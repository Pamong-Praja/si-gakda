import { FormEvent, useState } from 'react';
import { AlertCircle, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { supabase, setRememberPreference } from '@/lib/supabase';

type AuthMode = 'login' | 'register';

type AuthPageProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
};

function OarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 2 L14.5 7 L12 12 L9.5 7 Z" fill="currentColor" />
      <path d="M12 12 L12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function AuthPage({ mode, onModeChange }: AuthPageProps) {
  const isRegister = mode === 'register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (isRegister && password !== confirmation) {
      setError('Konfirmasi password belum sama.');
      return;
    }

    setSubmitting(true);
    if (!isRegister) setRememberPreference(remember);

    const result = isRegister
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });

    setSubmitting(false);

    if (result.error) {
      setError(getAuthErrorMessage(result.error.message, isRegister));
      return;
    }

    if (isRegister && !result.data.session) {
      setMessage('Pendaftaran berhasil. Silakan login untuk melanjutkan.');
      onModeChange('login');
      setPassword('');
      setConfirmation('');
      return;
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7f6] px-4 py-8">
      <div className="absolute inset-0 pacu-bg-wave opacity-70" aria-hidden />
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#C8102E]/10 blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-[#1A5276]/10 blur-3xl" aria-hidden />

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#C8102E] via-[#a30d24] to-[#1A1A1A] p-10 lg:block">
          <div className="pacu-bg-wave absolute inset-0 opacity-30" aria-hidden />
          <OarIcon className="absolute -bottom-4 -right-4 h-48 w-48 text-white/10" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-white">Si-Gakda</p>
                <p className="text-xs font-medium text-[#F5B041]">Praja Wibawa</p>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#F5B041]">Satpol PPPKP Kuansing</p>
              <h1 className="text-4xl font-extrabold leading-tight text-white">Tegakkan Perda dengan integritas.</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">Kelola laporan penindakan secara teratur, aman, dan mudah diakses oleh tim Anda.</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F5B041]"><OarIcon className="h-6 w-6" /> Praja Wibawa</div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8 lg:hidden">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C8102E] text-white shadow-lg"><ShieldCheck className="h-7 w-7" /></div>
            <p className="mt-3 text-center text-xl font-extrabold text-[#1A1A1A]">Si-Gakda</p>
            <p className="text-center text-xs font-semibold text-[#C8102E]">Praja Wibawa</p>
          </div>

          <div className="mb-7">
            <p className="text-sm font-semibold text-[#1B7340]">Selamat datang</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#1A1A1A]">{isRegister ? 'Buat akun baru' : 'Masuk ke Si-Gakda'}</h2>
            <p className="mt-2 text-sm text-gray-500">{isRegister ? 'Daftar untuk mulai mengelola laporan penindakan.' : 'Masuk untuk melanjutkan ke dashboard Anda.'}</p>
          </div>

          {error && <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span></div>}
          {message && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-gray-700">Email</span><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#1B7340] focus:bg-white focus:ring-2 focus:ring-[#1B7340]/15" /></div></label>
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-gray-700">Password</span><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type={showPassword ? 'text' : 'password'} required minLength={6} autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimal 6 karakter" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-[#1B7340] focus:bg-white focus:ring-2 focus:ring-[#1B7340]/15" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700" aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>
            {isRegister && <label className="block"><span className="mb-1.5 block text-sm font-semibold text-gray-700">Konfirmasi Password</span><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type={showConfirmation ? 'text' : 'password'} required minLength={6} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Ulangi password" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-[#1B7340] focus:bg-white focus:ring-2 focus:ring-[#1B7340]/15" /><button type="button" onClick={() => setShowConfirmation((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700" aria-label={showConfirmation ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}>{showConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>}
            {!isRegister && <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-[#C8102E]" /> Ingat saya</label>}
            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-[#C8102E] to-[#a30d24] px-4 py-3.5 text-sm font-bold text-white shadow-lg transition hover:from-[#a30d24] hover:to-[#C8102E] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Memproses...' : isRegister ? 'Daftar' : 'Login'}</button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">{isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'} <button type="button" onClick={() => { setError(null); setMessage(null); onModeChange(isRegister ? 'login' : 'register'); }} className="font-bold text-[#1B7340] hover:text-[#155730]">{isRegister ? 'Login' : 'Daftar'}</button></p>
        </div>
      </section>
    </main>
  );
}

function getAuthErrorMessage(message: string, isRegister: boolean): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) return 'Email atau password salah.';
  if (normalized.includes('user already registered')) return 'Email ini sudah terdaftar. Silakan login.';
  if (normalized.includes('password')) return 'Password harus terdiri dari minimal 6 karakter.';
  return isRegister ? 'Pendaftaran belum berhasil. Periksa data dan coba lagi.' : 'Login belum berhasil. Periksa email dan password Anda.';
}
