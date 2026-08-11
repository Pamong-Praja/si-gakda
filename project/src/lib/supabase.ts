import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const rememberKey = 'sigakda-remember-session';

const authStorage = {
  getItem(key: string): string | null {
    return getStorage().getItem(key);
  },
  setItem(key: string, value: string): void {
    getStorage().setItem(key, value);
  },
  removeItem(key: string): void {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

function getStorage(): Storage {
  return localStorage.getItem(rememberKey) === 'false' ? sessionStorage : localStorage;
}

export function setRememberPreference(remember: boolean): void {
  localStorage.setItem(rememberKey, String(remember));
  const session = localStorage.getItem('sb-' + new URL(supabaseUrl).hostname.split('.')[0] + '-auth-token');
  if (!remember && session) {
    sessionStorage.setItem('sb-' + new URL(supabaseUrl).hostname.split('.')[0] + '-auth-token', session);
    localStorage.removeItem('sb-' + new URL(supabaseUrl).hostname.split('.')[0] + '-auth-token');
  }
  if (remember) sessionStorage.removeItem('sb-' + new URL(supabaseUrl).hostname.split('.')[0] + '-auth-token');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Laporan = {
  id: string;
  kategori: string;
  tanggal: string;
  lokasi: string;
  personel: string | null;
  uraian: string | null;
  dasar_hukum: string | null;
  foto_urls: string[] | null;
  bulan: number | null;
  tahun: number | null;
  created_at: string;
};
