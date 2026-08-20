import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/categories';
import { compressPhotos, type CompressedPhoto } from '@/lib/photo';
import { ArrowLeft, Save, X, ImagePlus, Loader2, CheckCircle2 } from 'lucide-react';

type Props = {
  onCancel: () => void;
  onSaved: () => void;
  defaultKategori?: string;
};

export function ReportForm({ onCancel, onSaved, defaultKategori }: Props) {
  const [kategori, setKategori] = useState(defaultKategori ?? CATEGORIES[0].key);
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [lokasi, setLokasi] = useState('');
  const [personel, setPersonel] = useState('');
  const [uraian, setUraian] = useState('');
  const [dasarHukum, setDasarHukum] = useState('');
  const [photos, setPhotos] = useState<CompressedPhoto[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setCompressing(true);
    setError(null);
    try {
      const remaining = 3 - photos.length;
      const toCompress = files.slice(0, remaining);
      const compressed = await compressPhotos(toCompress);
      setPhotos((prev) => [...prev, ...compressed]);
    } catch {
      setError('Gagal mengompres foto');
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
    setError(null);
    if (!kategori || !tanggal || !lokasi.trim()) {
      setError('Kategori, tanggal, dan lokasi wajib diisi');
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
          console.error('Upload error:', uploadError);
          setError('Gagal upload foto: ' + uploadError.message);
          setSaving(false);
          return;
        }
        const { data: urlData } = supabase.storage
          .from('foto-laporan')
          .getPublicUrl(fileName);
        fotoUrls.push(urlData.publicUrl);
      }

      const dateObj = new Date(tanggal);
      const bulan = dateObj.getMonth() + 1;
      const tahun = dateObj.getFullYear();

      const { error: insertError } = await supabase
        .from('laporan_penindakan')
        .insert({
          kategori,
          tanggal,
          lokasi: lokasi.trim(),
          personel: personel.trim() || null,
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <button
        onClick={onCancel}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>

      <h2 className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">
        Input Laporan Penindakan
      </h2>

      <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        {/* Kategori */}
        <Field label="Kategori" required>
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
        </Field>

        {/* Tanggal */}
        <Field label="Tanggal Kejadian" required>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
          />
        </Field>

        {/* Lokasi */}
        <Field label="Lokasi" required>
          <input
            type="text"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            placeholder="Contoh: Jl. Diponegoro, Teluk Kuantan"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
          />
        </Field>

        {/* Personel — DI ATAS Uraian */}
        <Field label="Personel" hint="Tempel dari WhatsApp">
          <textarea
            value={personel}
            onChange={(e) => setPersonel(e.target.value)}
            rows={3}
            placeholder="Daftar personel yang terlibat..."
            className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
          />
        </Field>

        {/* Dasar Hukum */}
        <Field label="Dasar Hukum" hint="Format list/poin">
          <textarea
            value={dasarHukum}
            onChange={(e) => setDasarHukum(e.target.value)}
            rows={4}
            placeholder="1. Peraturan ...&#10;2. Permendagri ...&#10;3. Perbup ..."
            className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
          />
        </Field>

        {/* Uraian — DI BAWAH Personel */}
        <Field label="Uraian">
          <textarea
            value={uraian}
            onChange={(e) => setUraian(e.target.value)}
            rows={4}
            placeholder="Uraian kejadian / penindakan..."
            className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-[#1B7340] focus:outline-none focus:ring-1 focus:ring-[#1B7340]"
          />
        </Field>

        {/* Upload Foto */}
        <Field label="Upload Foto" hint="Maksimal 3 foto, dikompres otomatis ke WebP (maks 0.5 MB)">
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
                  className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white shadow-sm transition hover:bg-red-700"
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
        </Field>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Tombol */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || compressing}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C8102E] to-[#a30d24] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-[#a30d24] hover:to-[#C8102E] disabled:opacity-60 active:scale-[0.99]"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            <X className="h-5 w-5" /> Batal
          </button>
        </div>

        {saving && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4 animate-pulse" />
            Mengompres & mengunggah foto...
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-gray-800">
          {label}
          {required && <span className="text-red-600"> *</span>}
        </span>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
