'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { LayoutDashboard, LogOut, Send, QrCode, Users } from 'lucide-react';

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/invites', icon: Send, label: 'Send Invites' },
  { href: '/admin/qrcode', icon: QrCode, label: 'QR Code' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(140deg, #1e1a17 0%, #2d2520 100%)' }}>
        <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex" style={{ background: '#f5f1ea' }}>
      {/* ── Sidebar ── */}
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 py-8 px-4"
        style={{
          background: 'linear-gradient(180deg, #1e1a17 0%, #2a2219 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="px-3 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #d4a931, #8f6510)' }}>
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-display text-white text-lg leading-none">RSVP</p>
              <p className="font-body text-ink-500 text-[10px] tracking-wider uppercase">Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-all duration-150 ${
                  active
                    ? 'bg-gold-500/15 text-gold-400 font-medium'
                    : 'text-ink-400 hover:bg-white/5 hover:text-ink-200'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-gold-400' : ''}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm text-ink-500 hover:bg-white/5 hover:text-red-400 transition-all duration-150 mt-4"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 h-14"
        style={{ background: '#1e1a17', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d4a931, #8f6510)' }}>
            <Users className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display text-white text-lg">RSVP Admin</span>
        </div>
        <button onClick={logout} className="text-ink-400 hover:text-red-400 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around h-16 px-4"
        style={{ background: '#1e1a17', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                active ? 'text-gold-400' : 'text-ink-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-body text-[10px]">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
