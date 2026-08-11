import { useEffect, useState } from 'react';
import { supabase, type Laporan } from '@/lib/supabase';
import { getCategory } from '@/lib/categories';
import { ArrowLeft, Loader2, MapPin, Calendar, Users, FileText, Scale, X } from 'lucide-react';

type Props = {
  reportId: string;
  onBack: () => void;
};

export function ReportDetail({ reportId, onBack }: Props) {
  const [report, setReport] = useState<Laporan | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

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
    setLoading(false);
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
        {/* DASAR HUKUM — di ATAS Tanggal */}
        <DetailRow icon={<Scale className="h-4 w-4" />} label="Dasar Hukum">
          <NumberedList text={report.dasar_hukum} />
        </DetailRow>

        <DetailRow icon={<Calendar className="h-4 w-4" />} label="Tanggal">
          {formatDate(report.tanggal)}
        </DetailRow>

        <DetailRow icon={<MapPin className="h-4 w-4" />} label="Lokasi">
          {report.lokasi}
        </DetailRow>

        {/* PERSONEL — bernomor dengan gelar tetap muncul */}
        <DetailRow icon={<Users className="h-4 w-4" />} label="Personel">
          <PersonelList text={report.personel} />
        </DetailRow>

        {/* URAIAN — bernomor jika ada poin */}
        <DetailRow icon={<FileText className="h-4 w-4" />} label="Uraian">
          <NumberedList text={report.uraian} />
        </DetailRow>

        {/* Foto galeri */}
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

// ============================================================
// PERSONEL LIST — split by koma, nomor urut, gelar tetap
// ============================================================
function PersonelList({ text }: { text: string | null | undefined }) {
  if (!text) return <span className="text-sm text-gray-400">-</span>;

  // Split berdasarkan koma, bukan newline
  const names = text
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);

  if (names.length === 0) return <span className="text-sm text-gray-400">-</span>;

  return (
    <ol className="list-decimal list-inside space-y-1">
      {names.map((name, i) => (
        <li key={i} className="text-sm text-gray-700 pl-1">
          {name}
        </li>
      ))}
    </ol>
  );
}

// ============================================================
// NUMBERED LIST — untuk Uraian & Dasar Hukum
// ============================================================
function NumberedList({ text }: { text: string | null | undefined }) {
  if (!text) return <span className="text-sm text-gray-400">-</span>;

  // 1. Coba split berdasarkan pola "1.", "2.", "3." di dalam teks
  const numberedPattern = /(\d+\.\s+[^\n]+)/g;
  const numberedMatches = text.match(numberedPattern);

  if (numberedMatches && numberedMatches.length > 1) {
    return (
      <ol className="list-decimal list-inside space-y-1">
        {numberedMatches.map((item, i) => (
          <li key={i} className="text-sm text-gray-700 pl-1">
            {item.replace(/^\d+\.\s+/, '')}
          </li>
        ))}
      </ol>
    );
  }

  // 2. Coba split berdasarkan baris baru
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length > 1) {
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

  // 3. Coba split berdasarkan titik koma
  const parts = text.split(';').filter(p => p.trim() !== '');
  if (parts.length > 1) {
    return (
      <ol className="list-decimal list-inside space-y-1">
        {parts.map((part, i) => (
          <li key={i} className="text-sm text-gray-700 pl-1">
            {part.trim()}
          </li>
        ))}
      </ol>
    );
  }

  // 4. Jika tidak ada pola, tampilkan sebagai teks biasa
  return <p className="text-sm text-gray-700">{text}</p>;
}