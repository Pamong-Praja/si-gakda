// src/lib/smartParser.ts
// Parser cerdas untuk laporan tidak rapi dari WhatsApp

export function parseLaporanWA(text: string) {
  const lines = text.split('\n');
  
  let tanggal = '';
  let lokasi = '';
  let personel: string[] = [];
  let dasarHukum = '';
  let uraian = '';
  
  // ============================================================
  // 1. DETEKSI TANGGAL
  // ============================================================
  const tanggalMatch = text.match(/(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})/i);
  if (tanggalMatch) {
    const bulanMap: Record<string, string> = {
      'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
      'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
      'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
    };
    tanggal = `${tanggalMatch[3]}-${bulanMap[tanggalMatch[2]]}-${tanggalMatch[1].padStart(2, '0')}`;
  }
  
  // ============================================================
  // 2. DETEKSI LOKASI
  // ============================================================
  for (const line of lines) {
    const trimmed = line.trim();
    if (/lokasi/i.test(trimmed) && /:/i.test(trimmed)) {
      lokasi = trimmed.replace(/^.*?:/i, '').trim();
      break;
    }
    const diMatch = trimmed.match(/di\s+([A-Za-z\s,()]+)/i);
    if (diMatch && diMatch[1].length > 5) {
      lokasi = diMatch[1].trim();
    }
  }
  
  // ============================================================
  // 3. DETEKSI DASAR HUKUM
  // ============================================================
  let inDasar = false;
  const dasarLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!inDasar) {
      if (/^(I\.\s*)?DASAR\s*(HUKUM)?/i.test(trimmed)) {
        inDasar = true;
        const after = trimmed.replace(/^.*?:\s*/, '').trim();
        if (after) dasarLines.push(after);
        continue;
      }
    } else {
      if (/^(II|III|KEGIATAN)/i.test(trimmed)) break;
      dasarLines.push(trimmed);
    }
  }
  dasarHukum = dasarLines.filter(l => l.length > 2).map((l, i) => `${i+1}. ${l.replace(/^\d+[.)]\s*/, '')}`).join('\n');
  
  // ============================================================
  // 4. DETEKSI PERSONEL (FLEKSIBEL - Termasuk Dinas Lain)
  // ============================================================
  let inPersonel = false;
  const personelLines: string[] = [];
  let currentInstansi = 'Satpol PP';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (!inPersonel) {
      if (/personel/i.test(trimmed)) {
        inPersonel = true;
        continue;
      }
    } else {
      if (/^(VI|HASIL\s*KEGIATAN|KETERANGAN|VII|DEMIKIAN)/i.test(trimmed)) break;
      
      // Deteksi instansi (contoh: "Inspektorat (6 Orang)")
      const instansiMatch = trimmed.match(/^([A-Za-z\s]+)\s*\(/);
      if (instansiMatch) {
        currentInstansi = instansiMatch[1].trim();
        continue;
      }
      
      let cleaned = trimmed
        .replace(/^\s*[-*•]\s*/, '')
        .replace(/^\s*(\d+)[.)]\s*/, '')
        .trim();
      
      // Hapus gelar
      cleaned = cleaned
        .replace(/,?\s*(?:S\.\w+\.?|M\.\w+\.?|A\.Md\.?|SST|S\.I\.P|S\.Sos\.?|S\.E\.?|S\.H\.?|S\.P\.?|M\.M\.?|M\.Si\.?|S\.Pd\.?)\s*/g, '')
        .trim();
      
      const isInstansi = /^(Inspektorat|Kecamatan|Dinas|Badan|Kantor)/i.test(cleaned);
      
      if (cleaned.length > 2 && !isInstansi) {
        if (currentInstansi && currentInstansi !== 'Satpol PP') {
          personelLines.push(`${cleaned} (${currentInstansi})`);
        } else {
          personelLines.push(cleaned);
        }
      }
    }
  }
  personel = personelLines;
  
  // ============================================================
  // 5. DETEKSI URAIAN / HASIL KEGIATAN (FLEKSIBEL)
  // ============================================================
  let inUraian = false;
  const uraianLines: string[] = [];
  
  const stopKeywords = [
    /^VII\./i,
    /^VIII\./i,
    /^KETERANGAN/i,
    /^DEMIKIAN/i,
    /^DOKUMENTASI/i,
    /^Wassalamu'alaikum/i,
    /^Wassalamualaikum/i,
  ];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (!inUraian) {
      if (/hasil\s*kegiatan/i.test(trimmed)) {
        inUraian = true;
        const after = trimmed.replace(/^.*?hasil\s*kegiatan\s*:?/i, '').trim();
        if (after) uraianLines.push(after);
        continue;
      }
    } else {
      let shouldStop = false;
      for (const pattern of stopKeywords) {
        if (pattern.test(trimmed)) {
          shouldStop = true;
          break;
        }
      }
      if (shouldStop) break;
      
      const cleaned = trimmed
        .replace(/^\s*(\d+)[.)]\s*/, '')
        .replace(/^\s*[-*•▪️]\s*/, '')
        .trim();
      
      if (cleaned.length > 0) {
        uraianLines.push(cleaned);
      }
    }
  }
  
  uraian = uraianLines.join('\n');
  
  // ============================================================
  // 6. RETURN HASIL
  // ============================================================
  return {
    tanggal,
    lokasi,
    personel,
    dasar_hukum: dasarHukum,
    uraian
  };
}