'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { rsvpApi, Attendee, AttendeeListResponse } from '@/lib/api';
import {
  Download, Search, Trash2, Edit2, X, Check,
  Users, UserCheck, UserX, HelpCircle, Clock,
  RefreshCw, ChevronDown
} from 'lucide-react';

const STATUS_OPTS = ['', 'yes', 'no', 'maybe', 'pending'] as const;

function StatCard({ label, value, sub, color, icon: Icon }:
  { label: string; value: number; sub?: string; color: string; icon: any }) {
  return (
    <div className="card p-5 flex items-start gap-4" style={{ background: 'rgba(255,255,255,0.8)' }}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-body text-xs text-ink-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="font-display text-3xl text-ink-900 leading-none">{value}</p>
        {sub && <p className="font-body text-xs text-ink-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    yes: 'badge badge-yes',
    no: 'badge badge-no',
    maybe: 'badge badge-maybe',
    pending: 'badge badge-pending',
  };
  const labels: Record<string, string> = {
    yes: '✓ Attending',
    no: '✗ Declined',
    maybe: '? Maybe',
    pending: '· Pending',
  };
  return <span className={map[status] || 'badge badge-pending'}>{labels[status] ?? status}</span>;
}

export default function DashboardPage() {
  const [data, setData] = useState<AttendeeListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await rsvpApi.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setData(res.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // WebSocket real-time updates
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws/dashboard';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = () => { fetchData(); };
    ws.onerror = () => {}; // silently handle WS errors

    return () => ws.close();
  }, [fetchData]);

  const handleExport = async () => {
    try {
      const res = await rsvpApi.exportCsv();
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rsvp-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete RSVP for "${name}"?`)) return;
    try {
      await rsvpApi.delete(id);
      toast.success('RSVP deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleStatusUpdate = async (id: number) => {
    if (!editStatus) return;
    try {
      await rsvpApi.update(id, { status: editStatus as any });
      toast.success('Status updated');
      setEditingId(null);
      fetchData();
    } catch {
      toast.error('Update failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink-900">Dashboard</h1>
          <p className="font-body text-sm text-ink-400 mt-0.5">
            {data?.total ?? 0} responses total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="btn-ghost p-2.5" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleExport} className="btn-gold">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Confirmed" value={data?.confirmed ?? 0}
          sub={`+${data?.total_guests ?? 0} guests`}
          color="bg-emerald-50 text-emerald-600" icon={UserCheck}
        />
        <StatCard
          label="Not Coming" value={data?.not_coming ?? 0}
          color="bg-red-50 text-red-500" icon={UserX}
        />
        <StatCard
          label="Maybe" value={data?.maybe ?? 0}
          color="bg-amber-50 text-amber-600" icon={HelpCircle}
        />
        <StatCard
          label="Pending" value={data?.pending ?? 0}
          color="bg-gray-100 text-gray-500" icon={Clock}
        />
      </div>

      {/* ── Filters ── */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3" style={{ background: 'rgba(255,255,255,0.8)' }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or phone…"
            className="input-base pl-9 h-10 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-base h-10 pr-9 text-sm appearance-none cursor-pointer"
          >
            <option value="">All statuses</option>
            <option value="yes">Attending</option>
            <option value="no">Declined</option>
            <option value="maybe">Maybe</option>
            <option value="pending">Pending</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card overflow-hidden" style={{ background: 'rgba(255,255,255,0.8)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(176,161,134,0.2)' }}>
                {['Name', 'Phone', 'Guests', 'Status', 'Notes', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left font-medium text-ink-400 text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!data?.attendees?.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-ink-300 font-body text-sm">
                    No responses found
                  </td>
                </tr>
              ) : (
                data.attendees.map((a: Attendee) => (
                  <tr key={a.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(176,161,134,0.1)' }}>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-ink-800">{a.name}</div>
                      {a.dietary && <div className="text-xs text-ink-400 mt-0.5">🌿 {a.dietary}</div>}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-ink-500">{a.phone}</td>
                    <td className="px-4 py-3.5 text-center">
                      {a.status === 'yes' ? (
                        <span className="inline-flex items-center gap-1 text-ink-600">
                          <Users className="w-3.5 h-3.5" />
                          {a.guests_count + 1}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      {editingId === a.id ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="text-xs border border-ink-200 rounded-lg px-2 py-1 font-body bg-white"
                          >
                            {STATUS_OPTS.slice(1).map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <button onClick={() => handleStatusUpdate(a.id)} className="p-1 text-emerald-600 hover:text-emerald-700">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-ink-400 hover:text-ink-600">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <StatusBadge status={a.status} />
                      )}
                    </td>
                    <td className="px-4 py-3.5 max-w-[160px]">
                      <p className="text-xs text-ink-400 truncate">{a.notes || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink-400 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setEditingId(a.id); setEditStatus(a.status); }}
                          className="p-1.5 rounded-lg text-ink-400 hover:text-gold-600 hover:bg-gold-50 transition-colors"
                          title="Edit status"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id, a.name)}
                          className="p-1.5 rounded-lg text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {data && data.total > 0 && (
          <div className="px-4 py-3 flex items-center justify-between text-xs text-ink-400 font-body"
            style={{ borderTop: '1px solid rgba(176,161,134,0.15)' }}>
            <span>Showing {data.attendees.length} of {data.total}</span>
            <span>Total seats: {(data.confirmed ?? 0) + (data.total_guests ?? 0)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
