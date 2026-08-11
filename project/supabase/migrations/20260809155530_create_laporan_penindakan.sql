/*
# Create laporan_penindakan table (single-tenant, no auth)

1. New Tables
- `laporan_penindakan`
  - id (uuid, primary key)
  - kategori (text, not null) — salah satu dari 6 kategori penindakan
  - tanggal (date, not null) — tanggal kejadian
  - lokasi (text, not null) — lokasi kejadian
  - personel (text) — daftar personel (textarea, tempel dari WA)
  - uraian (text) — uraian kejadian
  - foto_urls (text[]) — array URL foto di Supabase Storage
  - bulan (int) — bulan laporan (1-12)
  - tahun (int) — tahun laporan
  - created_at (timestamptz) — waktu dibuat
2. Security
- Enable RLS on `laporan_penindakan`.
- Allow anon + authenticated CRUD karena data sengaja dibagikan internal Satpol.
3. Notes
- bulan & tahun diisi otomatis dari tanggal kejadian oleh aplikasi.
*/

CREATE TABLE IF NOT EXISTS laporan_penindakan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kategori text NOT NULL,
  tanggal date NOT NULL,
  lokasi text NOT NULL,
  personel text,
  uraian text,
  foto_urls text[] DEFAULT '{}',
  bulan int,
  tahun int,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE laporan_penindakan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_laporan" ON laporan_penindakan;
CREATE POLICY "anon_select_laporan" ON laporan_penindakan
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_laporan" ON laporan_penindakan;
CREATE POLICY "anon_insert_laporan" ON laporan_penindakan
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_laporan" ON laporan_penindakan;
CREATE POLICY "anon_update_laporan" ON laporan_penindakan
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_laporan" ON laporan_penindakan;
CREATE POLICY "anon_delete_laporan" ON laporan_penindakan
  FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_laporan_kategori ON laporan_penindakan (kategori);
CREATE INDEX IF NOT EXISTS idx_laporan_bulan_tahun ON laporan_penindakan (bulan, tahun);
CREATE INDEX IF NOT EXISTS idx_laporan_tanggal ON laporan_penindakan (tanggal);
