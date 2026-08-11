import { useEffect, useState } from 'react';
import { supabase, type Laporan } from '@/lib/supabase';
import { getCategory, MONTH_NAMES } from '@/lib/categories';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Search,
  FileSpreadsheet,
  Loader2,
  ChevronRight,
  Trash2,
} from 'lucide-react';

type Props = {
  kategoriKey: string;
  initialMonth: number;
  initialYear: number;
  onBack: () => void;
  onSelectReport: (id: string) => void;
};

export function ReportList({
  kategoriKey,
  initialMonth,
  initialYear,
  onBack,
  onSelectReport,
}: Props) {
  const cat = getCategory(kategoriKey);
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [reports, setReports] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kesimpulan, setKesimpulan] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchReports();
  }, [kategoriKey, month, year]);

  async function fetchReports() {
    setLoading(true);
    const { data, error } = await supabase
      .from('laporan_penindakan')
      .select('*')
      .eq('kategori', kategoriKey)
      .eq('bulan', month)
      .eq('tahun', year)
      .order('tanggal', { ascending: false });
    if (error) {
      console.error(error);
      setReports([]);
    } else {
      setReports(data ?? []);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Yakin ingin menghapus laporan ini?')) return;
    setDeletingId(id);
    const { error } = await supabase
      .from('laporan_penindakan')
      .delete()
      .eq('id', id);
    setDeletingId(null);
    if (error) {
      console.error(error);
      alert('Gagal menghapus laporan: ' + error.message);
      return;
    }
    await fetchReports();
  }

  const filtered = reports.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.lokasi?.toLowerCase().includes(q) ||
      r.personel?.toLowerCase().includes(q) ||
      r.uraian?.toLowerCase().includes(q) ||
      r.dasar_hukum?.toLowerCase().includes(q) ||
      r.tanggal?.includes(q)
    );
  });

  function handleExportExcel() {
  const rows = filtered.map((r, i) => ({
    No: i + 1,
    'Dasar Hukum': r.dasar_hukum ?? '',        // ← PINDAH KE SINI (setelah No)
    Tanggal: r.tanggal,
    Lokasi: r.lokasi,
    Personel: r.personel ?? '',
    Uraian: r.uraian ?? '',
    'Jumlah Foto': (r.foto_urls ?? []).length,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 5 },   // No
    { wch: 40 },  // Dasar Hukum
    { wch: 12 },  // Tanggal
    { wch: 25 },  // Lokasi
    { wch: 30 },  // Personel
    { wch: 50 },  // Uraian
    { wch: 10 },  // Jumlah Foto
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
  const fileName = `Laporan_${cat?.shortName ?? kategoriKey}_${MONTH_NAMES[month - 1]}_${year}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
  const now = new Date();
  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-[#1B7340] transition hover:text-[#155730]"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
      </button>

      {/* Header kategori */}
      <div
        className={`mb-5 overflow-hidden rounded-2xl bg-gradient-to-r ${cat?.gradient} p-5 shadow-sm`}
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl">{cat?.emoji}</span>
          <div>
            <h2 className="text-lg font-bold text-white sm:text-xl">
              {cat?.name}
            </h2>
            <p className="text-sm text-white/80">
              Daftar laporan penindakan
            </p>
          </div>
        </div>
      </div>

      {/* Filter & search */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari laporan..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-800 focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340] sm:w-64"
          />
        </div>
      </div>

      {/* Export button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleExportExcel}
          disabled={loading || filtered.length === 0}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1B7340] to-[#155730] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-[#155730] hover:to-[#1B7340] disabled:opacity-50 active:scale-[0.99]"
        >
          <FileSpreadsheet className="h-4 w-4" /> Export ke Excel
        </button>
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            Belum ada laporan di kategori ini untuk periode tersebut.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">No</th>
                  <th className="px-4 py-3 font-semibold">Dasar Hukum</th>
                  <th className="px-4 py-3 font-semibold">Tanggal</th>
                  <th className="px-4 py-3 font-semibold">Lokasi</th>
                  <th className="px-4 py-3 font-semibold">Personel</th>
                  <th className="px-4 py-3 font-semibold">Uraian</th>
                  <th className="px-4 py-3 font-semibold">Foto</th>
                  <th className="px-4 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    className="cursor-pointer transition hover:bg-gray-50"
                    onClick={() => onSelectReport(r.id)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-500">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div
                        className="max-w-[200px] truncate"
                        title={r.dasar_hukum ?? undefined}
                      >
                        {r.dasar_hukum ? (
                          r.dasar_hukum.length > 100 ?
                            `${r.dasar_hukum.slice(0, 100)}...` :
                            r.dasar_hukum.replace(/\n/g, ' ')
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-800">
                      {formatDate(r.tanggal)}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{r.lokasi}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="max-w-[180px] truncate">
                        {r.personel || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="max-w-[240px] truncate">
                        {r.uraian || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {(r.foto_urls ?? []).length > 0 ? (
                        <img
                          src={r.foto_urls![0]}
                          alt="Thumbnail"
                          className="h-12 w-12 rounded-lg object-cover ring-1 ring-gray-200"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectReport(r.id)}
                          className="flex items-center gap-1 rounded-lg bg-[#1B7340]/10 px-2.5 py-1.5 text-xs font-semibold text-[#1B7340] transition hover:bg-[#1B7340]/20"
                        >
                          Detail <ChevronRight className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => void handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {deletingId === r.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ujung rekapan */}
      {!loading && (
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800">
              Total Laporan:
            </span>
            <span className="rounded-lg bg-[#C8102E]/10 px-3 py-1 text-lg font-bold text-[#C8102E]">
              {filtered.length}
            </span>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
              Kesimpulan:
            </label>
            <textarea
              value={kesimpulan}
              onChange={(e) => setKesimpulan(e.target.value)}
              rows={3}
              placeholder="Tulis kesimpulan rekap penindakan periode ini..."
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
