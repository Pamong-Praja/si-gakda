/*
# Storage policies for foto-laporan bucket (public, no auth)

1. Problem
- storage.objects has RLS enabled but NO policies, so every upload/read is denied.
2. Security
- Allow anon + authenticated to SELECT (read) objects in foto-laporan bucket.
- Allow anon + authenticated to INSERT (upload) objects.
- Allow anon + authenticated to UPDATE objects.
- Allow anon + authenticated to DELETE objects.
3. Notes
- Bucket is public; policies allow the anon-key frontend to manage photos.
- Drop-first pattern ensures idempotency.
*/

DROP POLICY IF EXISTS "anon_read_foto_laporan" ON storage.objects;
CREATE POLICY "anon_read_foto_laporan" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'foto-laporan');

DROP POLICY IF EXISTS "anon_insert_foto_laporan" ON storage.objects;
CREATE POLICY "anon_insert_foto_laporan" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'foto-laporan');

DROP POLICY IF EXISTS "anon_update_foto_laporan" ON storage.objects;
CREATE POLICY "anon_update_foto_laporan" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'foto-laporan') WITH CHECK (bucket_id = 'foto-laporan');

DROP POLICY IF EXISTS "anon_delete_foto_laporan" ON storage.objects;
CREATE POLICY "anon_delete_foto_laporan" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'foto-laporan');