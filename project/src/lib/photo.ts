import imageCompression from 'browser-image-compression';

export type CompressedPhoto = {
  file: File;
  previewUrl: string;
};

const options = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp' as const,
};

export async function compressPhoto(file: File): Promise<File> {
  try {
    const compressed = await imageCompression(file, options);
    return compressed;
  } catch (err) {
    console.error('Kompresi gagal, gunakan file asli', err);
    return file;
  }
}

export async function compressPhotos(files: File[]): Promise<CompressedPhoto[]> {
  const results: CompressedPhoto[] = [];
  for (const file of files.slice(0, 3)) {
    const compressed = await compressPhoto(file);
    const previewUrl = URL.createObjectURL(compressed);
    results.push({ file: compressed, previewUrl });
  }
  return results;
}
