'use client';

import { useEffect, useState } from 'react';
import { waApi } from '@/lib/api';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QrCodePage() {
  const [qrData, setQrData] = useState<{ qr_data_url: string; rsvp_url: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQr = async () => {
    setLoading(true);
    try {
      const res = await waApi.getQrCode();
      setQrData(res.data);
    } catch {
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQr(); }, []);

  const copyUrl = () => {
    if (!qrData) return;
    navigator.clipboard.writeText(qrData.rsvp_url);
    toast.success('RSVP link copied!');
  };

  const downloadQr = () => {
    if (!qrData) return;
    const a = document.createElement('a');
    a.href = qrData.qr_data_url;
    a.download = 'rsvp-qr-code.png';
    a.click();
  };

  return (
    <div className="p-6 sm:p-8 max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink-900">QR Code</h1>
        <p className="font-body text-sm text-ink-400 mt-0.5">Share the RSVP link easily</p>
      </div>

      <div className="card p-8 flex flex-col items-center text-center" style={{ background: 'rgba(255,255,255,0.85)' }}>
        {loading ? (
          <div className="w-10 h-10 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin my-12" />
        ) : qrData ? (
          <>
            <div className="rounded-2xl overflow-hidden shadow-lg mb-6 border-4 border-white">
              <img src={qrData.qr_data_url} alt="RSVP QR Code" className="w-56 h-56" />
            </div>

            <p className="font-body text-xs text-ink-400 mb-2 uppercase tracking-wide">RSVP URL</p>
            <div className="flex items-center gap-2 bg-ink-50 rounded-xl px-4 py-2.5 w-full max-w-xs mb-6">
              <code className="font-mono text-xs text-ink-600 flex-1 text-left truncate">{qrData.rsvp_url}</code>
              <button onClick={copyUrl} className="text-ink-400 hover:text-gold-600 transition-colors shrink-0">
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={downloadQr} className="btn-gold">
                Download QR
              </button>
              <a href={qrData.rsvp_url} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <ExternalLink className="w-4 h-4" />
                Open Form
              </a>
              <button onClick={loadQr} className="btn-ghost p-2.5">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <p className="font-body text-ink-400 my-12">Failed to load QR code.</p>
        )}
      </div>

      <div className="rounded-xl p-4 border border-ink-100 bg-white/60 font-body text-sm text-ink-500">
        <p className="font-medium text-ink-700 mb-1">How to use the QR Code</p>
        <ul className="text-xs space-y-1 text-ink-400 list-disc list-inside">
          <li>Print and place at your venue or on physical invitations</li>
          <li>Share the image on social media or WhatsApp groups</li>
          <li>Guests scan with their phone camera — no app needed</li>
        </ul>
      </div>
    </div>
  );
}
