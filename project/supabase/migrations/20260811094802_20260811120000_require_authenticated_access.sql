/*
# Require authenticated access for Si-Gakda reports

1. Purpose
- Protect the existing `laporan_penindakan` records now that Si-Gakda has a login and registration flow.
- Keep the current shared report workflow intact for signed-in Satpol PPPKP staff.

2. Modified Tables
- `laporan_penindakan`: enable Row Level Security without changing existing columns or report data.

3. Security Changes
- Anonymous users can no longer read or modify reports through the public API.
- Authenticated users receive separate SELECT, INSERT, UPDATE, and DELETE policies.
- The report table remains shared between authenticated staff accounts because this change adds access protection, not per-user report ownership.

4. Important Notes
- No rows are deleted or changed.
- Supabase Auth continues to manage accounts in its built-in `auth.users` table.
*/

ALTER TABLE public.laporan_penindakan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_laporan_penindakan" ON public.laporan_penindakan;
CREATE POLICY "authenticated_select_laporan_penindakan"
ON public.laporan_penindakan FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "authenticated_insert_laporan_penindakan" ON public.laporan_penindakan;
CREATE POLICY "authenticated_insert_laporan_penindakan"
ON public.laporan_penindakan FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_laporan_penindakan" ON public.laporan_penindakan;
CREATE POLICY "authenticated_update_laporan_penindakan"
ON public.laporan_penindakan FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_laporan_penindakan" ON public.laporan_penindakan;
CREATE POLICY "authenticated_delete_laporan_penindakan"
ON public.laporan_penindakan FOR DELETE
TO authenticated
USING (true);