import { useCallback, useEffect, useState } from 'react';
import { Header, Footer } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { ReportForm } from '@/components/ReportForm';
import { SmartInput } from '@/components/SmartInput';
import { ReportList } from '@/components/ReportList';
import { ReportDetail } from '@/components/ReportDetail';
import { AuthPage } from '@/components/AuthPage';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { CheckCircle2, X } from 'lucide-react';

type View =
  | { name: 'dashboard' }
  | { name: 'form'; defaultKategori?: string }
  | { name: 'smart' }
  | { name: 'list'; kategoriKey: string; month: number; year: number }
  | { name: 'detail'; reportId: string; from: { kategoriKey: string; month: number; year: number } };

type AuthMode = 'login' | 'register';

function App() {
  const [view, setView] = useState<View>({ name: 'dashboard' });
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setAuthLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f7f6] text-sm font-semibold text-[#1B7340]">Memuat Si-Gakda...</div>;
  }

  if (!session) return <AuthPage mode={authMode} onModeChange={setAuthMode} />;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pacu-bg-wave">
      <Header email={session.user.email ?? undefined} />
      <main className="flex-1">
        {view.name === 'dashboard' && (
          <Dashboard
            onSelectCategory={(key, month, year) => setView({ name: 'list', kategoriKey: key, month, year })}
            onOpenForm={() => setView({ name: 'form' })}
            onOpenSmart={() => setView({ name: 'smart' })}
          />
        )}
        {view.name === 'form' && (
          <ReportForm
            defaultKategori={view.defaultKategori}
            onCancel={() => setView({ name: 'dashboard' })}
            onSaved={() => { showToast('Laporan berhasil disimpan!'); setView({ name: 'dashboard' }); }}
          />
        )}
        {view.name === 'smart' && (
          <SmartInput
            onCancel={() => setView({ name: 'dashboard' })}
            onSaved={() => { showToast('Laporan berhasil disimpan!'); setView({ name: 'dashboard' }); }}
          />
        )}
        {view.name === 'list' && (
          <ReportList
            kategoriKey={view.kategoriKey}
            initialMonth={view.month}
            initialYear={view.year}
            onBack={() => setView({ name: 'dashboard' })}
            onSelectReport={(id) => setView({ name: 'detail', reportId: id, from: { kategoriKey: view.kategoriKey, month: view.month, year: view.year } })}
          />
        )}
        {view.name === 'detail' && (
          <ReportDetail
            reportId={view.reportId}
            onBack={() => setView({ name: 'list', kategoriKey: view.from.kategoriKey, month: view.from.month, year: view.from.year })}
          />
        )}
      </main>
      <Footer />
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fade-in">
          <div className="flex items-center gap-3 rounded-xl bg-gray-900 px-5 py-3 shadow-lg">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium text-white">{toast}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/60 transition hover:text-white" aria-label="Tutup notifikasi"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
