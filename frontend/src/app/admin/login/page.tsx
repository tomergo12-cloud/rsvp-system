'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password required'),
});
type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/admin/dashboard');
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      router.replace('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(140deg, #1e1a17 0%, #2d2520 50%, #1a1612 100%)' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #d4a931 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #d4a931, #8f6510)' }}>
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl text-white font-light">Admin Portal</h1>
          <p className="font-body text-sm text-ink-400 mt-1">RSVP Management System</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7 animate-fade-up stagger-2"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block font-body text-xs font-medium text-ink-300 mb-1.5 tracking-widest uppercase">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-body text-white placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-blush-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block font-body text-xs font-medium text-ink-300 mb-1.5 tracking-widest uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
                <input
                  {...register('password')}
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm font-body text-white placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-blush-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl font-body font-medium text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-2"
              style={{ background: 'linear-gradient(135deg, #d4a931, #8f6510)' }}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
