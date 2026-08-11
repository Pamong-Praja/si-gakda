import { LogOut, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function OarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 2 L14.5 7 L12 12 L9.5 7 Z" fill="currentColor" />
      <path d="M12 12 L12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WaveMotif() {
  return (
    <div className="pacu-wave h-3 w-full" aria-hidden />
  );
}

export function Header({ email }: { email?: string }) {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#C8102E] via-[#a30d24] to-[#1A1A1A] shadow-xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/30">
            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <OarIcon className="h-7 w-7 shrink-0 text-[#F5B041] sm:h-8 sm:w-8" />
          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold tracking-tight text-white sm:text-xl">
              Si-Gakda
            </h1>
            <p className="truncate text-xs font-medium text-[#F5B041] sm:text-sm">
              Sistem Informasi Gakda Satpol PPPKP Kuansing
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {email && <span className="hidden max-w-48 truncate text-xs text-white/75 sm:block">{email}</span>}
            <button
              onClick={() => void supabase.auth.signOut()}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
      <WaveMotif />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-r from-[#1A1A1A] via-[#0e3a54] to-[#1A1A1A]">
      <WaveMotif />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <OarIcon className="h-6 w-6 text-[#F5B041]" />
            <span className="text-sm font-bold text-white">Si-Gakda</span>
            <OarIcon className="h-6 w-6 text-[#F5B041]" />
          </div>
          <p className="text-xs text-white/70">
            © 2026 Si-Gakda — Satpol PPPKP Kab. Kuantan Singingi
          </p>
          <p className="text-xs font-medium text-[#F5B041]">
            Dengan Semangat Pacu Jalur, Kita Tegakkan Perda
          </p>
        </div>
      </div>
    </footer>
  );
}
