import { normalizeArabic } from "@/lib/arabic";

export interface Reciter {
  id: string;
  name: string;
  rewaya: string;
  /** Base server: audio = server + "NNN.mp3" */
  server?: string;
  /** Explicit per-surah URLs (for reciters outside mp3Quran CDN). */
  urlMap?: Record<number, string>;
  /** Available surah numbers; null => all 114. */
  surahs: number[] | null;
}

export function reciterSurahUrl(r: Reciter, n: number): string | null {
  if (r.urlMap) return r.urlMap[n] ?? null;
  if (!r.server) return null;
  if (r.surahs && !r.surahs.includes(n)) return null;
  const base = r.server.endsWith("/") ? r.server : r.server + "/";
  return base + String(n).padStart(3, "0") + ".mp3";
}

/**
 * عبد الرحمن مسعد — recordings hosted on Internet Archive
 * (archive.org item: 010_20221110), per-surah mp3 files.
 */
const MOSSAD_SURAHS = [10, 19, 23, 29, 32, 49, 73, 78, 87, 88, 100, 107];
const MOSSAD_MAP: Record<number, string> = {};
for (const n of MOSSAD_SURAHS) {
  MOSSAD_MAP[n] = `https://archive.org/download/010_20221110/${String(n).padStart(3, "0")}.mp3`;
}

export const EXTRA_RECITERS: Reciter[] = [
  {
    id: "custom-mossad",
    name: "عبد الرحمن مسعد",
    rewaya: "تلاوات مختارة (12 سورة)",
    urlMap: MOSSAD_MAP,
    surahs: MOSSAD_SURAHS,
  },
];

/** Verified cdn.mp3quran.net servers — used when the live API is unreachable. */
export const FALLBACK_RECITERS: Reciter[] = [
  { id: "fb-sobhi", name: "إسلام صبحي", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/islam-sobhi/r1/", surahs: null },
  { id: "fb-afs", name: "مشاري العفاسي", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/mishary-alafasy/r1/", surahs: null },
  { id: "fb-basit", name: "عبدالباسط عبدالصمد", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/abdulbasit-abdulsamad/r1/", surahs: null },
  { id: "fb-maher", name: "ماهر المعيقلي", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/maher-muaiqly/r1/", surahs: null },
  { id: "fb-yasser", name: "ياسر الدوسري", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/yasser-dosari/r1/", surahs: null },
  { id: "fb-saad", name: "سعد الغامدي", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/saad-ghamdi/r1/", surahs: null },
  { id: "fb-husary", name: "محمود خليل الحصري", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/mahmoud-husary/r1/", surahs: null },
  { id: "fb-fares", name: "فارس عباد", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/fares-abbad/r1/", surahs: null },
  { id: "fb-hani", name: "هاني الرفاعي", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/hani-rifai/r1/", surahs: null },
  { id: "fb-abkar", name: "إدريس أبكر", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/idrees-abkar/r1/", surahs: null },
  { id: "fb-qatami", name: "ناصر القطامي", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/nasser-qatami/r1/", surahs: null },
  { id: "fb-jalil", name: "خالد الجليل", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/khalid-jalil/r1/", surahs: null },
  { id: "fb-ajmi", name: "أحمد بن علي العجمي", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/ahmad-ajmi/r1/", surahs: null },
  { id: "fb-minshawi", name: "محمد صديق المنشاوي", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/muhammad-minshawi/r4/", surahs: null },
  { id: "fb-sudais", name: "عبدالرحمن السديس", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/abdulrahman-sudais/r1/", surahs: null },
  { id: "fb-shuraim", name: "سعود الشريم", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/saud-shuraim/r1/", surahs: null },
  { id: "fb-shatri", name: "أبو بكر الشاطري", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/abubakr-shatri/r1/", surahs: null },
  { id: "fb-juhani", name: "عبدالله عواد الجهني", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/abdullah-juhani/r1/", surahs: null },
  { id: "fb-luhaidan", name: "محمد اللحيدان", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/muhammad-luhaidan/r1/", surahs: null },
  { id: "fb-muhaisni", name: "محمد المحيسني", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/muhammad-muhaisni/r1/", surahs: null },
  { id: "fb-qahtani", name: "خالد القحطاني", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/khalid-qahtani/r1/", surahs: null },
  { id: "fb-shoaey", name: "يوسف الشويعي", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/yousef-shoaey/r1/", surahs: null },
  { id: "fb-tablawi", name: "محمد الطبلاوي", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/muhammad-tablawi/r1/", surahs: null },
  { id: "fb-bukhatir", name: "صلاح بو خاطر", rewaya: "حفص عن عاصم", server: "https://cdn.mp3quran.net/audio/salah-bukhatir/r1/", surahs: null },
];

const FEATURED_QUERIES = [
  "إسلام صبحي",
  "عبد الرحمن مسعد",
  "مشاري العفاسي",
  "عبد الباسط",
  "ماهر المعيقلي",
  "ياسر الدوسري",
  "سعد الغامدي",
  "الحصري",
  "فارس عباد",
  "هاني الرفاعي",
  "إدريس أبكر",
  "ناصر القطامي",
  "خالد الجليل",
  "العجمي",
  "المنشاوي",
  "السديس",
  "سعود الشريم",
  "الجهني",
  "اللحيدان",
  "الشويعي",
  "المحيسني",
  "الطبلاوي",
  "بو خاطر",
  "القحطاني",
  "الشاطري",
  "جبريل",
  "الأخضر",
  "محمد أيوب",
  "علي جابر",
  "القزابري",
  "الصايغ",
];

interface ApiMoshaf {
  id: number;
  name?: string;
  server?: string;
  surah_total?: number;
  surah_list?: string;
}
interface ApiReciter {
  id: number;
  name: string;
  moshaf?: ApiMoshaf[];
}

export async function fetchReciters(): Promise<Reciter[]> {
  const res = await fetch("https://mp3quran.net/api/v3/reciters?language=ar");
  if (!res.ok) throw new Error("HTTP " + res.status);
  const json = (await res.json()) as { reciters?: ApiReciter[] };
  const out: Reciter[] = [];
  for (const r of json.reciters ?? []) {
    const m = (r.moshaf ?? []).find((x) => /حفص/.test(x.name ?? "")) ?? r.moshaf?.[0];
    if (!m?.server) continue;
    const total = Number(m.surah_total ?? 114);
    let surahs: number[] | null = null;
    if (total !== 114) {
      const list = String(m.surah_list ?? "")
        .split(",")
        .map((x) => Number(x.trim()))
        .filter((x) => Number.isFinite(x) && x > 0);
      surahs = list.length ? list : null;
    }
    out.push({
      id: `mq-${r.id}-${m.id}`,
      name: r.name,
      rewaya: m.name ?? "حفص عن عاصم",
      server: m.server,
      surahs,
    });
  }
  if (out.length < 20) throw new Error("empty response");
  return out;
}

/** First (normalized) letter of a reciter name — used for the alphabetical index. */
export function reciterLetter(r: Reciter): string {
  return normalizeArabic(r.name).charAt(0) || "ا";
}

export const ARABIC_LETTERS = [
  "ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش",
  "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي",
];

/** Ordered featured reciters (requested names first), merged with the full catalog. */
export function buildFeatured(all: Reciter[]): Reciter[] {
  const pool = [...EXTRA_RECITERS, ...all];
  const picked: Reciter[] = [];
  for (const q of FEATURED_QUERIES) {
    const nq = normalizeArabic(q);
    const found = pool.find((r) => normalizeArabic(r.name).includes(nq));
    if (found && !picked.some((r) => r.id === found.id)) picked.push(found);
  }
  for (const f of FALLBACK_RECITERS) {
    if (!picked.some((r) => normalizeArabic(r.name) === normalizeArabic(f.name))) picked.push(f);
  }
  return picked;
}
