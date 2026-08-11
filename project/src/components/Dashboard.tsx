import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  CATEGORIES,
  MONTH_NAMES,
  type CategoryConfig,
} from '@/lib/categories';
import {
  ChevronRight,
  BarChart3,
  FileText,
  Search,
  Waves,
} from 'lucide-react';

type Props = {
  onSelectCategory: (key: string, month: number, year: number) => void;
  onOpenForm: () => void;
  onOpenSmart: () => void;
};

type Counts = Record<string, number>;

const CHART_COLORS = [
  'bg-[#C8102E]',
  'bg-[#F5B041]',
  'bg-[#1B7340]',
  'bg-[#1A5276]',
  'bg-[#1A1A1A]',
  'bg-[#C8102E]',
];

function OarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 2 L14.5 7 L12 12 L9.5 7 Z" fill="currentColor" />
      <path d="M12 12 L12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Dashboard({ onSelectCategory, onOpenForm, onOpenSmart }: Props) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [counts, setCounts] = useState<Counts>({});
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    void fetchCounts();
  }, [month, year]);

  async function fetchCounts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('laporan_penindakan')
      .select('kategori')
      .eq('bulan', month)
      .eq('tahun', year);
    if (error) {
      console.error(error);
      setCounts({});
      setTotal(0);
      setLoading(false);
      return;
    }
    const map: Counts = {};
    for (const row of data ?? []) {
      const k = row.kategori as string;
      map[k] = (map[k] ?? 0) + 1;
    }
    setCounts(map);
    setTotal((data ?? []).length);
    setLoading(false);
  }

  const maxCount = Math.max(1, ...CATEGORIES.map((c) => counts[c.key] ?? 0));
  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* HERO SECTION */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#C8102E] via-[#a30d24] to-[#1A1A1A] shadow-2xl">
        {/* Wave pattern overlay */}
        <div className="pacu-bg-wave absolute inset-0 opacity-30" aria-hidden />
        {/* Decorative oar */}
        <OarIcon className="absolute right-6 top-6 h-24 w-24 text-white/10 animate-float-slow" />
        <div className="relative px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-[#F5B041]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#F5B041]">
              Praja Wibawa
            </span>
          </div>
          <h2 className="mt-3 max-w-2xl text-2xl font-extrabold leading-tight text-white sm:text-3xl md:text-4xl">
            Dengan Semangat Pacu Jalur,
            <br />
            <span className="text-[#F5B041]">Kita Tegakkan Perda</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
            Sistem Informasi Gakda Satpol PPPKP Kabupaten Kuantan Singingi —
            penegakan Peraturan Daerah yang tegas, profesional, dan berbudaya.
          </p>
        </div>
        {/* Bottom wave motif */}
        <div className="pacu-wave h-3 w-full" aria-hidden />
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#1A1A1A] sm:text-2xl">
            Dashboard Rekap Penindakan
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Rekap laporan per kategori penindakan
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Bulan
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Tahun
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Total card — gradient merah-kuning */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#C8102E] to-[#F5B041] p-5 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/90">Total Laporan Periode</p>
            <p className="text-2xl font-extrabold text-white">
              {loading ? '...' : total}{' '}
              <span className="text-sm font-medium text-white/80">
                laporan · {MONTH_NAMES[month - 1]} {year}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.key}
            cat={cat}
            count={counts[cat.key] ?? 0}
            loading={loading}
            onClick={() => onSelectCategory(cat.key, month, year)}
          />
        ))}
      </div>

      {/* Bar chart */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#1B7340]" />
          <h3 className="text-base font-bold text-[#1A1A1A]">
            Grafik Laporan per Kategori
          </h3>
        </div>
        <div className="space-y-3">
          {CATEGORIES.map((cat, idx) => {
            const count = counts[cat.key] ?? 0;
            const pct = (count / maxCount) * 100;
            const barColor = CHART_COLORS[idx % CHART_COLORS.length];
            return (
              <div key={cat.key} className="flex items-center gap-3">
                <div className="w-28 shrink-0 text-xs font-medium text-gray-600 sm:w-36 sm:text-sm">
                  {cat.emoji} {cat.shortName}
                </div>
                <div className="h-7 flex-1 overflow-hidden rounded-lg bg-gray-100">
                  <div
                    className={`flex h-full items-center justify-end rounded-lg ${barColor} transition-all duration-500 ease-out`}
                    style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                  >
                    {count > 0 && (
                      <span className="px-2 text-xs font-bold text-white">
                        {count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onOpenForm}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C8102E] to-[#a30d24] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-[#a30d24] hover:to-[#C8102E] active:scale-[0.99]"
        >
          <FileText className="h-5 w-5" /> Input Laporan Manual
        </button>
        <button
          onClick={onOpenSmart}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F5B041] to-[#e09b30] px-4 py-3 text-sm font-semibold text-[#1A1A1A] shadow-lg transition hover:from-[#e09b30] hover:to-[#F5B041] active:scale-[0.99]"
        >
          <Search className="h-5 w-5" /> Smart Input (WhatsApp)
        </button>
      </div>
    </div>
  );
}

function CategoryCard({
  cat,
  count,
  loading,
  onClick,
}: {
  cat: CategoryConfig;
  count: number;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border-2 ${cat.border} bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
    >
      <div className={`h-2 w-full bg-gradient-to-r ${cat.gradient}`} />
      {/* Decorative oar in corner */}
      <OarIcon className="absolute right-3 top-4 h-8 w-8 text-gray-200 transition group-hover:text-gray-300" />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.accent} text-2xl`}
          >
            {cat.emoji}
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-[#1A1A1A]">
              {loading ? '...' : count}
            </p>
            <p className="text-xs text-gray-500">laporan</p>
          </div>
        </div>
        <h3 className="mt-3 text-sm font-bold leading-snug text-[#1A1A1A]">
          {cat.name}
        </h3>
        <button
          onClick={onClick}
          className="mt-4 flex w-full items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 transition group-hover:bg-gray-100"
        >
          Lihat Detail
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
