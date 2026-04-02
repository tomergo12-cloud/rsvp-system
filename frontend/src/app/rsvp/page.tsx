'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { rsvpApi } from '@/lib/api';
import ConfirmationScreen from '@/components/ConfirmationScreen';
import { CalendarDays, MapPin, Users, Phone, User, MessageSquare, ChefHat } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(7, 'Enter a valid phone number').regex(/^\+?[\d\s\-\(\)]{7,20}$/, 'Invalid phone format'),
  guests_count: z.coerce.number().min(0, 'Min 0').max(20, 'Max 20 guests'),
  status: z.enum(['yes', 'no', 'maybe'], { required_error: 'Please select attendance status' }),
  notes: z.string().max(500).optional(),
  dietary: z.string().max(200).optional(),
});

type FormData = z.infer<typeof schema>;

const STATUS_OPTIONS = [
  {
    value: 'yes',
    label: 'Attending',
    emoji: '🎉',
    desc: "Yes, I'll be there",
    bg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-400',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
  },
  {
    value: 'no',
    label: 'Not Attending',
    emoji: '😔',
    desc: "Sorry, can't make it",
    bg: 'from-red-50 to-rose-50',
    border: 'border-rose-400',
    text: 'text-rose-600',
    dot: 'bg-rose-400',
  },
  {
    value: 'maybe',
    label: 'Maybe',
    emoji: '🤔',
    desc: "I'm not sure yet",
    bg: 'from-amber-50 to-yellow-50',
    border: 'border-amber-400',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
] as const;

export default function RsvpPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventName = process.env.NEXT_PUBLIC_EVENT_NAME || 'Our Special Event';
  const eventDate = process.env.NEXT_PUBLIC_EVENT_DATE || 'December 31, 2024';
  const eventLocation = process.env.NEXT_PUBLIC_EVENT_LOCATION || 'Grand Ballroom';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { guests_count: 0, status: undefined },
  });

  const selectedStatus = watch('status');

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await rsvpApi.submit(data);
      setSubmittedData(data);
      setSubmitted(true);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted && submittedData) {
    return <ConfirmationScreen name={submittedData.name} status={submittedData.status} />;
  }

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #fdf8f0 0%, #faf4eb 40%, #f5ede0 100%)' }}>

      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #d4a931 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #f2b8ae 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12 sm:py-16">

        {/* ── Header ── */}
        <header className="text-center mb-10 animate-fade-up">
          {/* Crown ornament */}
          <div className="flex justify-center mb-4">
            <div className="text-4xl animate-float">👑</div>
          </div>

          <p className="font-body text-xs tracking-[0.25em] uppercase text-ink-400 mb-2">You are cordially invited to</p>

          <h1 className="font-display text-4xl sm:text-5xl font-light text-ink-900 leading-tight mb-1">
            {eventName}
          </h1>

          <div className="ornament-line my-4">
            <span className="font-display text-gold-500 text-lg">✦</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 text-sm font-body text-ink-500">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-gold-500" />
              <span>{eventDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold-500" />
              <span>{eventLocation}</span>
            </div>
          </div>
        </header>

        {/* ── Form Card ── */}
        <div className="card p-6 sm:p-8 animate-fade-up stagger-2"
          style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)' }}>

          <h2 className="font-display text-2xl text-ink-800 mb-1">Confirm your attendance</h2>
          <p className="font-body text-sm text-ink-400 mb-6">Fill in your details below</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* Name */}
            <div>
              <label className="block font-body text-xs font-medium text-ink-600 mb-1.5 tracking-wide uppercase">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 pointer-events-none" />
                <input
                  {...register('name')}
                  className="input-base pl-10"
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-blush-500 font-body">{errors.name.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block font-body text-xs font-medium text-ink-600 mb-1.5 tracking-wide uppercase">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 pointer-events-none" />
                <input
                  {...register('phone')}
                  type="tel"
                  className="input-base pl-10"
                  placeholder="+1 (555) 000-0000"
                  autoComplete="tel"
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-blush-500 font-body">{errors.phone.message}</p>}
            </div>

            {/* Attendance status */}
            <div>
              <label className="block font-body text-xs font-medium text-ink-600 mb-2.5 tracking-wide uppercase">
                Will you attend? *
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('status', opt.value, { shouldValidate: true })}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                      selectedStatus === opt.value
                        ? `bg-gradient-to-b ${opt.bg} ${opt.border} shadow-sm scale-[1.02]`
                        : 'border-ink-100 bg-white/60 hover:border-ink-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    <span className={`font-body text-xs font-semibold ${selectedStatus === opt.value ? opt.text : 'text-ink-600'}`}>
                      {opt.label}
                    </span>
                    {selectedStatus === opt.value && (
                      <div className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 ${opt.dot} rounded-full border-2 border-white`} />
                    )}
                  </button>
                ))}
              </div>
              {errors.status && <p className="mt-1 text-xs text-blush-500 font-body">{errors.status.message}</p>}
            </div>

            {/* Guests count (only if attending or maybe) */}
            {(selectedStatus === 'yes' || selectedStatus === 'maybe') && (
              <div className="animate-fade-up">
                <label className="block font-body text-xs font-medium text-ink-600 mb-1.5 tracking-wide uppercase">
                  Number of Additional Guests
                </label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 pointer-events-none" />
                  <input
                    {...register('guests_count')}
                    type="number"
                    min="0"
                    max="20"
                    className="input-base pl-10"
                    placeholder="0"
                  />
                </div>
                <p className="mt-1 text-xs text-ink-400 font-body">Not counting yourself</p>
                {errors.guests_count && <p className="mt-1 text-xs text-blush-500 font-body">{errors.guests_count.message}</p>}
              </div>
            )}

            {/* Dietary */}
            {(selectedStatus === 'yes' || selectedStatus === 'maybe') && (
              <div className="animate-fade-up">
                <label className="block font-body text-xs font-medium text-ink-600 mb-1.5 tracking-wide uppercase">
                  Dietary Requirements
                </label>
                <div className="relative">
                  <ChefHat className="absolute left-3.5 top-3.5 w-4 h-4 text-ink-300 pointer-events-none" />
                  <input
                    {...register('dietary')}
                    className="input-base pl-10"
                    placeholder="Vegetarian, vegan, gluten-free, allergies…"
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block font-body text-xs font-medium text-ink-600 mb-1.5 tracking-wide uppercase">
                Additional Notes <span className="text-ink-300 normal-case">(optional)</span>
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-ink-300 pointer-events-none" />
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="input-base pl-10 resize-none"
                  placeholder="Any message for the host…"
                />
              </div>
              {errors.notes && <p className="mt-1 text-xs text-blush-500 font-body">{errors.notes.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold w-full h-12 text-base mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending…
                </>
              ) : (
                <>✨ Confirm RSVP</>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 animate-fade-up stagger-4">
          <p className="font-body text-xs text-ink-300">
            Questions? Contact us and we'll get back to you.
          </p>
        </footer>
      </div>
    </main>
  );
}
