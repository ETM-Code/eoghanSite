import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Project Tarski | Eoghan Collins',
  description: 'Project Tarski — sub-watt, instant AI experiences coming soon.',
};

export default function TarskiPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute left-1/2 top-[-20%] h-[120vh] w-[140vw] -translate-x-1/2 rotate-6 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.35),_transparent_55%)] blur-3xl" />
        <div className="absolute right-[-25%] bottom-[-15%] h-[90vh] w-[120vw] bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.22),_transparent_62%)] blur-3xl" />
        <div
          className="absolute inset-0 opacity-20 mix-blend-soft-light"
          style={{
            backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/10" />
      </div>

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center px-6 py-16">
        <Link
          href="/"
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
          aria-label="Back to landing page"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 rotate-180">
            <path
              d="M5 12h12M13 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Home
        </Link>

        <section className="mt-16 flex h-[320px] w-[320px] flex-col items-center justify-center rounded-[32px] border border-white/15 bg-white/5 px-8 text-center shadow-[0_40px_120px_rgba(59,130,246,0.25)] backdrop-blur-2xl sm:h-[420px] sm:w-[420px] sm:px-12">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Project Tarski</h1>
          <p className="mt-6 text-base font-light text-slate-200 sm:text-lg">
            Sub-Watt, Instant AI. Coming Soon
          </p>
        </section>
      </div>
    </main>
  );
}
