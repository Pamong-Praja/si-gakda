import { supabase } from './supabase';

export async function generateNoSpt(tahun: number): Promise<string> {
  const { count, error } = await supabase
    .from('laporan_penindakan')
    .select('*', { count: 'exact', head: true })
    .eq('tahun', tahun);

  if (error) {
    console.error('Gagal menghitung laporan:', error);
    return `331.1/SATPOLPPPKP/${tahun}/1`;
  }

  const nextNumber = (count || 0) + 1;
  return `331.1/SATPOLPPPKP/${tahun}/${nextNumber}`;
}
