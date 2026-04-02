'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { waApi } from '@/lib/api';
import { Send, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface Result {
  phone: string;
  success: boolean;
  error?: string;
}

export default function InvitesPage() {
  const [singlePhone, setSinglePhone] = useState('');
  const [singleName, setSingleName] = useState('');
  const [phones, setPhones] = useState<string[]>(['']);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const handleSingleSend = async () => {
    if (!singlePhone) return toast.error('Enter a phone number');
    setLoading(true);
    try {
      await waApi.sendInvite(singlePhone, singleName || undefined);
      toast.success(`Invite sent to ${singlePhone}!`);
      setSinglePhone('');
      setSingleName('');
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSend = async () => {
    const valid = phones.filter((p) => p.trim());
    if (!valid.length) return toast.error('Add at least one phone number');
    setLoading(true);
    setResults([]);
    try {
      const res = await waApi.sendBulk(valid);
      const data = res.data as any;
      setResults(data.results || []);
      toast.success(`${data.success}/${data.total} sent successfully`);
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Bulk send failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink-900">Send Invites</h1>
        <p className="font-body text-sm text-ink-400 mt-0.5">
          Send RSVP links via WhatsApp
        </p>
      </div>

      {/* Custom message */}
      <div className="card p-6" style={{ background: 'rgba(255,255,255,0.8)' }}>
        <h2 className="font-display text-xl text-ink-800 mb-3">Custom Message</h2>
        <p className="font-body text-xs text-ink-400 mb-3">
          Leave blank to use the default invitation template.
        </p>
        <textarea
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value)}
          rows={4}
          className="input-base resize-none text-sm"
          placeholder="Write a custom WhatsApp message… (optional)"
        />
      </div>

      {/* Single invite */}
      <div className="card p-6" style={{ background: 'rgba(255,255,255,0.8)' }}>
        <h2 className="font-display text-xl text-ink-800 mb-4">Single Invite</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block font-body text-xs text-ink-500 mb-1.5 uppercase tracking-wide">
              Name (optional)
            </label>
            <input
              value={singleName}
              onChange={(e) => setSingleName(e.target.value)}
              className="input-base text-sm"
              placeholder="Guest name"
            />
          </div>
          <div>
            <label className="block font-body text-xs text-ink-500 mb-1.5 uppercase tracking-wide">
              Phone *
            </label>
            <input
              value={singlePhone}
              onChange={(e) => setSinglePhone(e.target.value)}
              type="tel"
              className="input-base text-sm"
              placeholder="+1 555 000 0000"
            />
          </div>
        </div>
        <button onClick={handleSingleSend} disabled={loading} className="btn-gold">
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Send Invite
        </button>
      </div>

      {/* Bulk invite */}
      <div className="card p-6" style={{ background: 'rgba(255,255,255,0.8)' }}>
        <h2 className="font-display text-xl text-ink-800 mb-4">Bulk Invites</h2>
        <p className="font-body text-xs text-ink-400 mb-4">Add up to 100 phone numbers</p>

        <div className="space-y-2 mb-4">
          {phones.map((phone, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={phone}
                onChange={(e) => {
                  const updated = [...phones];
                  updated[i] = e.target.value;
                  setPhones(updated);
                }}
                type="tel"
                className="input-base text-sm flex-1"
                placeholder={`+1 555 000 000${i}`}
              />
              {phones.length > 1 && (
                <button
                  onClick={() => setPhones(phones.filter((_, idx) => idx !== i))}
                  className="p-2 text-ink-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPhones([...phones, ''])}
            className="btn-ghost text-sm"
            disabled={phones.length >= 100}
          >
            <Plus className="w-4 h-4" />
            Add Number
          </button>

          <button onClick={handleBulkSend} disabled={loading} className="btn-gold">
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send All ({phones.filter(p => p.trim()).length})
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-5 space-y-2 max-h-64 overflow-y-auto">
            <p className="font-body text-xs font-medium text-ink-500 uppercase tracking-wide mb-2">Results</p>
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg text-sm font-body
                ${r.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {r.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                <span className="font-mono text-xs">{r.phone}</span>
                {!r.success && <span className="text-xs ml-auto opacity-70">{r.error}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp API note */}
      <div className="rounded-xl p-4 border border-amber-200 bg-amber-50/60">
        <p className="font-body text-xs text-amber-700">
          <strong>ℹ️ WhatsApp API:</strong> Requires a Meta Business account with an approved phone number.
          Configure <code className="font-mono bg-amber-100 px-1 rounded">WHATSAPP_ACCESS_TOKEN</code> and{' '}
          <code className="font-mono bg-amber-100 px-1 rounded">WHATSAPP_PHONE_NUMBER_ID</code> in your{' '}
          <code className="font-mono bg-amber-100 px-1 rounded">.env</code> file. Without these, sends will be simulated.
        </p>
      </div>
    </div>
  );
}
