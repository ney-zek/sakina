/** Digits are displayed in western (1234567890) form across the app. */
export function toArabicDigits(v: string | number): string {
  return String(v);
}

/** Strip tashkeel and normalize alef/ta-marbuta forms for search & matching. */
export function normalizeArabic(s: string): string {
  return s
    .replace(/[\u064B-\u0652\u0670\u0640\u06D6-\u06ED]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, "");
}

/** "04:12" -> { time: "4:12", period: "ص" } */
export function formatTime12(t: string): { time: string; period: string } {
  const [hStr, mStr] = t.split(":");
  let h = Number(hStr);
  const period = h >= 12 ? "م" : "ص";
  h = h % 12;
  if (h === 0) h = 12;
  return {
    time: `${toArabicDigits(h)}:${toArabicDigits((mStr ?? "00").padStart(2, "0"))}`,
    period,
  };
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}
