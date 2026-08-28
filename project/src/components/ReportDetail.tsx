import { useEffect, useState } from 'react';
import { supabase, type Laporan } from '@/lib/supabase';
import { getCategory } from '@/lib/categories';
import { ArrowLeft, Loader2, MapPin, Calendar, Users, FileText, Scale, X, CheckCircle2, Clock } from 'lucide-react';

type Props = {
  reportId: string;
  onBack: () => void;
};

export function ReportDetail({ reportId, onBack }: Props) {
  const [report, setReport] = useState<Laporan | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  // 🔥 STATE UNTUK EDIT TINDAKAN & STATUS
  const [editTindakan, setEditTindakan] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('');
  const [tindakanLainnya, setTindakanLainnya] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    void fetchReport();
  }, [reportId]);

  async function fetchReport() {
    setLoading(true);
    const { data, error } = await supabase
      .from('laporan_penindakan')
      .select('*')
      .eq('id', reportId)
      .maybeSingle();
    if (error) {
      console.error(error);
    }
    setReport(data);
    // 🔥 SET STATE DARI DATA LAPORAN
    if (data) {
      setEditTindakan(data.tindakan_diambil || '');
      setEditStatus(data.status_tindak_lanjut || '');
    }
    setLoading(false);
  }

  // 🔥 FUNGSI UPDATE TINDAKAN & STATUS
  async function handleUpdateTindakan() {
    setUpdating(true);
    const finalTindakan = editTindakan === 'Lainnya' ? tindakanLainnya : editTindakan;

    const { error } = await supabase
      .from('laporan_penindakan')
      .update({
        tindakan_diambil: finalTindakan || null,
        status_tindak_lanjut: editStatus || null,
      })
      .eq('id', reportId);

    if (error) {
      alert('❌ Gagal update: ' + error.message);
    } else {
      alert('✅ Berhasil diperbarui!');
      await fetchReport();
    }
    setUpdating(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-600"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar
        </button>
        <p className="text-sm text-gray-500">Laporan tidak ditemukan.</p>
      </div>
    );
  }

  const cat = getCategory(report.kategori);
  const fotos = report.foto_urls ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-[#1B7340] transition hover:text-[#155730]"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar
      </button>

      {/* Header kategori */}
      <div
        className={`mb-5 overflow-hidden rounded-2xl bg-gradient-to-r ${cat?.gradient} p-5 shadow-sm`}
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl">{cat?.emoji}</span>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/70">
              Detail Laporan
            </p>
            <h2 className="text-lg font-bold text-white sm:text-xl">
              {cat?.name}
            </h2>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        {/* 🔥 NO SPT (BARU) - DI ATAS DASAR HUKUM */}
        <DetailRow icon={<FileText className="h-4 w-4" />} label="No SPT">
          {report.no_spt || '-'}
        </DetailRow>

        {/* DASAR HUKUM */}
        <DetailRow icon={<Scale className="h-4 w-4" />} label="Dasar Hukum">
          <NumberedList text={report.dasar_hukum} />
        </DetailRow>

        <DetailRow icon={<Calendar className="h-4 w-4" />} label="Tanggal">
          {formatDate(report.tanggal)}
        </DetailRow>

        <DetailRow icon={<MapPin className="h-4 w-4" />} label="Lokasi">
          {report.lokasi}
        </DetailRow>

        {/* PERSONEL */}
        <DetailRow icon={<Users className="h-4 w-4" />} label="Personel">
          <PersonelList text={report.personel} />
        </DetailRow>

        {/* URAIAN */}
        <DetailRow icon={<FileText className="h-4 w-4" />} label="Uraian">
          <NumberedList text={report.uraian} />
        </DetailRow>

        {/* 🔥 TINDAKAN YANG DIAMBIL */}
        <div className="border-b border-gray-100 pb-4 last:border-0">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <CheckCircle2 className="h-4 w-4" />
            Tindakan yang Diambil
          </div>
          <div className="pl-6">
            <select
              value={editTindakan}
              onChange={(e) => setEditTindakan(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
            >
              <option value="">Pilih Tindakan</option>
              <option value="Edukasi & Peringatan">Edukasi & Peringatan</option>
              <option value="Pemeriksaan & Pendataan">Pemeriksaan & Pendataan</option>
              <option value="Penertiban Fisik & Penindakan Langsung">Penertiban Fisik & Penindakan Langsung</option>
              <option value="Pengamanan & Penyitaan">Pengamanan & Penyitaan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            {editTindakan === 'Lainnya' && (
              <input
                type="text"
                value={tindakanLainnya}
                onChange={(e) => setTindakanLainnya(e.target.value)}
                placeholder="Masukkan tindakan lainnya..."
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
              />
            )}
          </div>
        </div>

        {/* 🔥 STATUS TINDAK LANJUT */}
        <div className="border-b border-gray-100 pb-4 last:border-0">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Clock className="h-4 w-4" />
            Status Tindak Lanjut
          </div>
          <div className="pl-6">
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
            >
              <option value="">Pilih Status</option>
              <option value="Selesai">Selesai</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Monitoring">Monitoring</option>
              <option value="Pelimpahan">Pelimpahan</option>
              <option value="Pending">Pending</option>
            </select>
            <button
              onClick={handleUpdateTindakan}
              disabled={updating}
              className="mt-2 rounded-lg bg-[#1B7340] px-4 py-2 text-sm font-semibold text-white hover:bg-[#155730] disabled:opacity-50"
            >
              {updating ? 'Menyimpan...' : '💾 Simpan Perubahan'}
            </button>
          </div>
        </div>

        {/* FOTO */}
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-800">Foto</p>
          {fotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {fotos.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(url)}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200"
                >
                  <img
                    src={url}
                    alt={`Foto ${i + 1}`}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Tidak ada foto</p>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30">
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightbox}
            alt="Foto besar"
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 pb-4 last:border-0">
      <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {icon}
        {label}
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function splitLines(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

// 🔥 PERBAIKAN: PersonelList mempertahankan format asli
function PersonelList({ text }: { text: string | null | undefined }) {
  if (!text) return <span className="text-sm text-gray-400">-</span>;
  return (
    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
      {text}
    </pre>
  );
}

  function NumberedList({ text }: { text: string | null | undefined }) {
  if (!text) return <span className="text-sm text-gray-400">-</span>;

  const lines = text.split('\n').filter(line => line.trim() !== '');

  if (lines.length === 0) return <span className="text-sm text-gray-400">-</span>;

  // Cek apakah ada sub-judul (1. TEKS) ATAU strip (-)
  const hasSubHeadings = lines.some(line => /^\s*\d+\.\s*[A-Z]/.test(line));
  const hasStrip = lines.some(line => /^\s*[-*•]\s*/.test(line));

  // SKENARIO 1: Ada SUB-JUDUL + STRIP → nested list
  if (hasSubHeadings && hasStrip) {
    return (
      <div className="space-y-1 text-sm text-gray-700">
        {lines.map((line, index) => {
          const trimmed = line.trim();

          // Sub-judul (1. TEKS)
          const subMatch = trimmed.match(/^(\d+)\.\s*(.+)/);
          if (subMatch) {
            return (
              <div key={index} className="font-semibold text-gray-800 mt-1">
                {subMatch[1]}. {subMatch[2]}
              </div>
            );
          }

          // Strip (- TEKS)
          const stripMatch = trimmed.match(/^[-*•]\s*(.+)/);
          if (stripMatch) {
            return (
              <div key={index} className="pl-6 text-gray-700">
                - {stripMatch[1]}
              </div>
            );
          }

          // Teks biasa
          return <div key={index}>{trimmed}</div>;
        })}
      </div>
    );
  }

  // SKENARIO 2: Ada SUB-JUDUL (tanpa strip) → list biasa (1., 2., 3.)
  if (hasSubHeadings && !hasStrip) {
    return (
      <ol className="list-decimal list-inside space-y-1">
        {lines.map((line, i) => {
          const cleaned = line.replace(/^\s*(\d+)[.)]\s*/, '').trim();
          return (
            <li key={i} className="text-sm text-gray-700 pl-1">
              {cleaned}
            </li>
          );
        })}
      </ol>
    );
  }

  // SKENARIO 3: Ada STRIP (tanpa sub-judul) → tampilkan apa adanya
  if (hasStrip) {
    return (
      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
        {text}
      </pre>
    );
  }

  // SKENARIO 4: Teks biasa → list bernomor (1., 2., 3.)
  return (
    <ol className="list-decimal list-inside space-y-1">
      {lines.map((line, i) => (
        <li key={i} className="text-sm text-gray-700 pl-1">
          {line.trim()}
        </li>
      ))}
    </ol>
  );
}
