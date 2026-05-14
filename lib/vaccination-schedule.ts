export interface VaccStep {
  step: number;
  ageDays: number;       // umur ayam saat vaksin ini
  ageLabel: string;      // label tampilan
  vaccine: string;       // nama vaksin
  method: string;        // cara pemberian
  target: string;        // target penyakit
  nextAgeDays: number | null; // umur untuk vaksin berikutnya (null = tahap terakhir)
}

export const VACC_STEPS: VaccStep[] = [
  { step: 1, ageDays: 4,  ageLabel: "4 Hari",     vaccine: "ND + IB (Live)",    method: "Tetes Mata/Hidung", target: "Newcastle Disease & Bronchitis", nextAgeDays: 12 },
  { step: 2, ageDays: 12, ageLabel: "12–14 Hari",  vaccine: "Gumboro (IBD)",     method: "Air Minum",         target: "Gumboro",                       nextAgeDays: 18 },
  { step: 3, ageDays: 18, ageLabel: "18–21 Hari",  vaccine: "ND + AI (Killed)",  method: "Suntik (Injeksi)",  target: "Tetelo & Flu Burung",           nextAgeDays: 28 },
  { step: 4, ageDays: 28, ageLabel: "28 Hari",     vaccine: "Gumboro (Ulangan)", method: "Air Minum",         target: "Penguatan Gumboro",             nextAgeDays: 56 },
  { step: 5, ageDays: 56, ageLabel: "8 Minggu",    vaccine: "Coryza",            method: "Suntik",            target: "Pilek Ayam (Snot)",             nextAgeDays: 84 },
  { step: 6, ageDays: 84, ageLabel: "12 Minggu",   vaccine: "ND + IB + EDS",     method: "Suntik",            target: "Persiapan masa bertelur",       nextAgeDays: null },
];

/** Hitung tanggal dari hatch_date + jumlah hari → string YYYY-MM-DD */
export function calcVaccDate(hatchDate: string, ageDays: number): string {
  const d = new Date(hatchDate);
  d.setDate(d.getDate() + ageDays);
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

/** Cari tahap berikutnya setelah tahap ini */
export function getNextStep(step: VaccStep): VaccStep | null {
  return VACC_STEPS.find(s => s.step === step.step + 1) ?? null;
}
