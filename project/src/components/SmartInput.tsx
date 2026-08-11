import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/categories';
import { compressPhotos, type CompressedPhoto } from '@/lib/photo';
import {
  ArrowLeft,
  Search,
  Save,
  X,
  ImagePlus,
  Loader2,
  Wand2,
  ClipboardPaste,
} from 'lucide-react';

type Props = {
  onCancel: () => void;
  onSaved: () => void;
};

type Parsed = {
  tanggal: string;
  lokasi: string;
  personel: string;
  uraian: string;
  dasar_hukum: string;
};

function isSectionHeader(line: string): boolean {
  return /^(I{1,3}|IV|V|VI{0,3}|IX|X)\.\s+[A-Z]/.test(line);
}

function parseWhatsApp(text: string): Parsed {
  const lines = text.split('\n');

  // === TANGGAL ===
  let tanggal = '';
  const datePatterns = [
    /(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/,
    /(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|mei|jun|jul|agu|ags|sep|okt|nov|des)\s+(\d{4})/i,
  ];
  for (const pattern of datePatterns) {
    const m = text.match(pattern);
    if (m) {
      if (m.length === 4 && m[2].length <= 2 && /\d/.test(m[2])) {
        const d = m[1].padStart(2, '0');
        const mo = m[2].padStart(2, '0');
        tanggal = `${m[3]}-${mo}-${d}`;
      } else {
        const monthMap: Record<string, number> = {
          januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
          juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
          jan: 1, feb: 2, mar: 3, apr: 4, jun: 6,
          jul: 7, agu: 8, ags: 8, sep: 9, okt: 10, nov: 11, des: 12,
        };
        const mo = monthMap[m[2].toLowerCase()];
        if (mo) {
          const d = m[1].padStart(2, '0');
          tanggal = `${m[3]}-${String(mo).padStart(2, '0')}-${d}`;
        }
      }
      break;
    }
  }
  if (!tanggal) {
    tanggal = new Date().toISOString().slice(0, 10);
  }

  // === LOKASI ===
  let lokasi = '';
  for (const line of lines) {
    const m = line.match(/lokasi\s*:\s*(.+)/i);
    if (m) {
      lokasi = m[1].trim();
      break;
    }
  }

  // === PERSONEL ===
  let inPersonel = false;
  const personelNames: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!inPersonel) {
      if (/personel/i.test(trimmed) && (isSectionHeader(trimmed) || /:\s*$/.test(trimmed))) {
        inPersonel = true;
      }
    } else {
      if (isSectionHeader(trimmed)) break;
      const nameMatch = trimmed.match(/^\d+[.)]\s+(.+)/);
      if (nameMatch) {
        personelNames.push(nameMatch[1].trim());
      }
    }
  }
  const personel = personelNames.join('\n');

  // === URAIAN ===
  let inHasil = false;
  const hasilPoints: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!inHasil) {
      if (/hasil\s*kegiatan/i.test(trimmed) && (isSectionHeader(trimmed) || /:\s*$/.test(trimmed))) {
        inHasil = true;
      }
    } else {
      if (isSectionHeader(trimmed)) break;
      const pointMatch = trimmed.match(/^[1-6][.)]\s+(.+)/);
      if (pointMatch) {
        hasilPoints.push(pointMatch[1].trim());
      }
    }
  }
  const uraian = hasilPoints.join('\n');

  // === DASAR HUKUM ===
  let inDasar = false;
  const dasarLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!inDasar) {
      if (/^dasar\s*(hukum)?\s*:/i.test(trimmed) || /^I\.\s*DASAR\s*:/i.test(trimmed)) {
        inDasar = true;
        const afterColon = trimmed.replace(/^.*?:\s*/, '').trim();
        if (afterColon) dasarLines.push(afterColon);
      }
    } else {
      if (/^(II|III)\./i.test(trimmed) || /kegiatan/i.test(trimmed)) break;
      dasarLines.push(trimmed);
    }
  }
  let dasar_hukum = '';
  const dasarItems = dasarLines.map((l) => l.replace(/^\d+[.)]\s*/, '').trim()).filter(Boolean);
  if (dasarItems.length > 0) {
    dasar_hukum = dasarItems.map((item, i) => `${i + 1}. ${item}`).join('\n');
  }

  return { tanggal, lokasi, personel, uraian, dasar_hukum };
}

export function SmartInput({ onCancel, onSaved }: Props) {
  const [rawText, setRawText] = useState('');
  const [detected, setDetected] = useState(false);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [kategori, setKategori] = useState<string>(CATEGORIES[0].key);
  const [uraian, setUraian] = useState('');
  const [dasarHukum, setDasarHukum] = useState('');
  const [photos, setPhotos] = useState<CompressedPhoto[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDetect() {
    if (!rawText.trim()) {
      setError('Tempel laporan dari WhatsApp dulu');
      return;
    }
    setError(null);
    const result = parseWhatsApp(rawText);
    setParsed(result);
    setUraian(result.uraian);
    setDasarHukum(result.dasar_hukum);
    setDetected(true);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setCompressing(true);
    try {
      const remaining = 3 - photos.length;
      const compressed = await compressPhotos(files.slice(0, remaining));
      setPhotos((prev) => [...prev, ...compressed]);
    } finally {
      setCompressing(false);
      e.target.value = '';
    }
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[idx].previewUrl);
      next.splice(idx, 1);
      return next;
    });
  }

  async function handleSave() {
    if (!parsed) return;
    setError(null);
    if (!parsed.lokasi.trim()) {
      setError('Lokasi tidak terdeteksi, mohon isi manual');
      return;
    }
    setSaving(true);
    try {
      const fotoUrls: string[] = [];
      for (const photo of photos) {
        const ext = photo.file.name.split('.').pop() || 'webp';
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('foto-laporan')
          .upload(fileName, photo.file, {
            contentType: 'image/webp',
            upsert: false,
          });
        if (uploadError) {
          setError('Gagal upload foto: ' + uploadError.message);
          setSaving(false);
          return;
        }
        const { data: urlData } = supabase.storage
          .from('foto-laporan')
          .getPublicUrl(fileName);
        fotoUrls.push(urlData.publicUrl);
      }

      const dateObj = new Date(parsed.tanggal);
      const bulan = dateObj.getMonth() + 1;
      const tahun = dateObj.getFullYear();

      const { error: insertError } = await supabase
        .from('laporan_penindakan')
        .insert({
          kategori,
          tanggal: parsed.tanggal,
          lokasi: parsed.lokasi.trim(),
          personel: parsed.personel.trim() || null,
          uraian: uraian.trim() || null,
          dasar_hukum: dasarHukum.trim() || null,
          foto_urls: fotoUrls,
          bulan,
          tahun,
        });

      if (insertError) {
        setError('Gagal menyimpan: ' + insertError.message);
        setSaving(false);
        return;
      }

      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      onSaved();
    } catch (err) {
      setError('Terjadi kesalahan: ' + (err as Error).message);
      setSaving(false);
    }
  }

  function handleReset() {
    setDetected(false);
    setParsed(null);
    setRawText('');
    setUraian('');
    setDasarHukum('');
    setPhotos([]);
    setError(null);
  }

  function updateParsed(field: keyof Parsed, value: string) {
    setParsed((p) => (p ? { ...p, [field]: value } : p));
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      setRawText(text);
    } catch {
      setError('Tidak bisa mengakses clipboard. Tempel manual dengan Ctrl+V.');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <button
        onClick={onCancel}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5B041] to-[#C8102E]">
          <Wand2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Smart Input dari WhatsApp
          </h2>
          <p className="text-sm text-gray-500">
            Tempel laporan, deteksi otomatis, lalu simpan
          </p>
        </div>
      </div>

      {!detected ? (
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-800">
              Tempelkan laporan dari WhatsApp di sini
            </label>
            <button
              onClick={handlePaste}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <ClipboardPaste className="h-3.5 w-3.5" /> Tempel
            </button>
          </div>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={10}
            placeholder="Tempel laporan dari WhatsApp di sini..."
            className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
          />
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <button
            onClick={handleDetect}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C8102E] to-[#a30d24] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-[#a30d24] hover:to-[#C8102E] active:scale-[0.99]"
          >
            <Search className="h-5 w-5" /> Deteksi Otomatis
          </button>
        </div>
      ) : (
        <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Berhasil mendeteksi data. Periksa & lengkapi sebelum menyimpan.
          </div>

          {/* ================== KATEGORI ================== */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
              Kategori
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
            >
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* ================== DASAR HUKUM (PALING ATAS) ================== */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
              Dasar Hukum
            </label>
            <textarea
              value={dasarHukum}
              onChange={(e) => setDasarHukum(e.target.value)}
              rows={4}
              placeholder="1. Peraturan ...&#10;2. Permendagri ...&#10;3. Perbup ..."
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
            />
          </div>

          {/* ================== TANGGAL ================== */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
              Tanggal Kejadian
            </label>
            <input
              type="date"
              value={parsed?.tanggal ?? ''}
              onChange={(e) => updateParsed('tanggal', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
            />
          </div>

          {/* ================== LOKASI ================== */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
              Lokasi
            </label>
            <input
              type="text"
              value={parsed?.lokasi ?? ''}
              onChange={(e) => updateParsed('lokasi', e.target.value)}
              placeholder="Lokasi kejadian"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
            />
          </div>

          {/* ================== PERSONEL ================== */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
              Personel
            </label>
            <textarea
              value={parsed?.personel ?? ''}
              onChange={(e) => updateParsed('personel', e.target.value)}
              rows={3}
              placeholder="Daftar personel..."
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
            />
          </div>

          {/* ================== URAIAN ================== */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
              Uraian
            </label>
            <textarea
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              rows={5}
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
            />
          </div>

          {/* ================== FOTO ================== */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
              Upload Foto (maks 3, dikompres otomatis)
            </label>
            <div className="flex flex-wrap gap-3">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200"
                >
                  <img
                    src={photo.previewUrl}
                    alt={`Foto ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-[#1B7340] hover:text-[#1B7340]">
                  {compressing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-[10px]">Tambah</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={compressing}
                  />
                </label>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1B7340] to-[#155730] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-[#155730] hover:to-[#1B7340] disabled:opacity-60 active:scale-[0.99]"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {saving ? 'Menyimpan...' : 'Simpan Laporan'}
            </button>
            <button
              onClick={handleReset}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              <X className="h-5 w-5" /> Ulang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}