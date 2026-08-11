export type CategoryKey =
  | 'PEKAT'
  | 'LINGKUNGAN'
  | 'PKL'
  | 'PERIZINAN'
  | 'REKLAME'
  | 'GAKDIS';

export type CategoryConfig = {
  key: CategoryKey;
  name: string;
  shortName: string;
  emoji: string;
  gradient: string;
  bg: string;
  text: string;
  border: string;
  bar: string;
  accent: string;
};

export const CATEGORIES: CategoryConfig[] = [
  {
    key: 'PEKAT',
    name: 'PEKAT (Penyakit Masyarakat)',
    shortName: 'PEKAT',
    emoji: '⚠️',
    gradient: 'from-gray-900 to-red-700',
    bg: 'bg-gray-900',
    text: 'text-red-400',
    border: 'border-red-600',
    bar: 'bg-red-600',
    accent: 'bg-red-50',
  },
  {
    key: 'LINGKUNGAN',
    name: 'Lingkungan Hidup & SDA',
    shortName: 'Lingkungan',
    emoji: '🌿',
    gradient: 'from-green-700 to-blue-600',
    bg: 'bg-green-700',
    text: 'text-green-600',
    border: 'border-green-600',
    bar: 'bg-green-600',
    accent: 'bg-green-50',
  },
  {
    key: 'PKL',
    name: 'PKL & Ruang Publik',
    shortName: 'PKL',
    emoji: '🏪',
    gradient: 'from-yellow-400 to-orange-500',
    bg: 'bg-yellow-400',
    text: 'text-orange-600',
    border: 'border-orange-500',
    bar: 'bg-orange-500',
    accent: 'bg-yellow-50',
  },
  {
    key: 'PERIZINAN',
    name: 'Perizinan & Bangunan',
    shortName: 'Perizinan',
    emoji: '🏗️',
    gradient: 'from-blue-900 to-gray-500',
    bg: 'bg-blue-900',
    text: 'text-blue-900',
    border: 'border-blue-800',
    bar: 'bg-blue-800',
    accent: 'bg-blue-50',
  },
  {
    key: 'REKLAME',
    name: 'Reklame & Pajak/Retribusi Daerah',
    shortName: 'Reklame',
    emoji: '💰',
    gradient: 'from-yellow-500 to-green-600',
    bg: 'bg-yellow-500',
    text: 'text-yellow-600',
    border: 'border-yellow-500',
    bar: 'bg-yellow-500',
    accent: 'bg-yellow-50',
  },
  {
    key: 'GAKDIS',
    name: 'GAKDIS (Disiplin ASN & Aparatur)',
    shortName: 'GAKDIS',
    emoji: '⚖️',
    gradient: 'from-blue-900 to-white',
    bg: 'bg-blue-900',
    text: 'text-blue-900',
    border: 'border-blue-900',
    bar: 'bg-blue-900',
    accent: 'bg-blue-50',
  },
];

export const getCategory = (key: string): CategoryConfig | undefined =>
  CATEGORIES.find((c) => c.key === key);

export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];
