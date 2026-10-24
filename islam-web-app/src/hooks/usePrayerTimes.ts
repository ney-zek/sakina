import { useCallback, useEffect, useState } from "react";
import { PRAYERS, type PrayerKey } from "@/data/platform";
import { toArabicDigits } from "@/lib/arabic";
import { computeLocalTimings, localHijriLabel } from "@/lib/prayTimesLocal";

export interface PrayerTimings {
  key: PrayerKey;
  name: string;
  time: string; // "HH:MM" 24h
}

export interface PrayerData {
  timings: PrayerTimings[];
  sunrise: string;
  midnight: string;
  hijriLabel: string;
  tomorrowFajr: string;
  loading: boolean;
  error: string | null;
  /** true عندما تُحسب المواقيت محلياً دون اتصال */
  isLocal: boolean;
}

export interface PrayerQuery {
  mode: "city" | "geo";
  city?: string;
  country?: string;
  method: string;
  lat?: number;
  lng?: number;
}

function clean(t: unknown): string {
  return String(t ?? "").split(" ")[0];
}

function dateParam(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`;
}

interface ApiDay {
  timings: Record<string, string>;
  date: { hijri: { day: string; year: string; month: { ar: string } } };
}

async function fetchDay(q: PrayerQuery, date: Date): Promise<ApiDay> {
  const dp = dateParam(date);
  const url =
    q.mode === "geo"
      ? `https://api.aladhan.com/v1/timings/${dp}?latitude=${q.lat}&longitude=${q.lng}&method=${q.method}`
      : `https://api.aladhan.com/v1/timingsByCity/${dp}?city=${encodeURIComponent(q.city ?? "")}&country=${encodeURIComponent(q.country ?? "")}&method=${q.method}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const json = (await res.json()) as { code: number; data: ApiDay };
  if (json.code !== 200 || !json.data?.timings) throw new Error("bad payload");
  return json.data;
}

const EMPTY: PrayerData = {
  timings: [],
  sunrise: "",
  midnight: "",
  hijriLabel: "",
  tomorrowFajr: "",
  loading: true,
  error: null,
  isLocal: false,
};

export function usePrayerTimes(query: PrayerQuery): PrayerData & { retry: () => void } {
  const [state, setState] = useState<PrayerData>(EMPTY);
  const [tick, setTick] = useState(0);
  const retry = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    const today = new Date();
    const tomorrow = new Date(Date.now() + 86400000);
    Promise.all([fetchDay(query, today), fetchDay(query, tomorrow)])
      .then(([t, m]) => {
        if (!alive) return;
        const timings = PRAYERS.map((p) => ({ key: p.key, name: p.name, time: clean(t.timings[p.key]) }));
        const h = t.date.hijri;
        setState({
          timings,
          sunrise: clean(t.timings.Sunrise),
          midnight: clean(t.timings.Midnight),
          hijriLabel: `${toArabicDigits(h.day)} ${h.month.ar} ${toArabicDigits(h.year)}هـ`,
          tomorrowFajr: clean(m.timings.Fajr),
          loading: false,
          error: null,
          isLocal: false,
        });
      })
      .catch(() => {
        if (!alive) return;
        // وضع عدم الاتصال: حساب فلكي محلي إن توفرت الإحداثيات
        if (query.lat != null && query.lng != null) {
          try {
            const t = computeLocalTimings(today, query.lat, query.lng, query.method);
            const m = computeLocalTimings(tomorrow, query.lat, query.lng, query.method);
            setState({
              timings: PRAYERS.map((p) => ({ key: p.key, name: p.name, time: t[p.key] })),
              sunrise: t.Sunrise,
              midnight: t.Midnight,
              hijriLabel: localHijriLabel(today),
              tomorrowFajr: m.Fajr,
              loading: false,
              error: null,
              isLocal: true,
            });
            return;
          } catch {
            /* falls through to error state */
          }
        }
        setState((s) => ({
          ...s,
          loading: false,
          error:
            "تعذّر جلب المواقيت — تحقق من اتصالك، أو اختر مدينة من القائمة أو فعّل تحديد الموقع ليُستخدم الحساب المحلي",
        }));
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.mode, query.city, query.country, query.method, query.lat, query.lng, tick]);

  return { ...state, retry };
}

/** First prayer strictly after `now`; wraps to tomorrow's Fajr. */
export function nextPrayer(
  now: Date,
  timings: PrayerTimings[],
  tomorrowFajr: string
): { key: PrayerKey; name: string; at: Date } | null {
  for (const t of timings) {
    const [h, m] = t.time.split(":").map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) continue;
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    if (d.getTime() > now.getTime()) return { key: t.key, name: t.name, at: d };
  }
  if (tomorrowFajr) {
    const [h, m] = tomorrowFajr.split(":").map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) {
      const d = new Date(now.getTime() + 86400000);
      d.setHours(h, m, 0, 0);
      return { key: "Fajr", name: "الفجر", at: d };
    }
  }
  return null;
}

/** Prayer that precedes the given upcoming prayer (for window progress). */
export function prevPrayerTime(
  nextKey: PrayerKey,
  timings: PrayerTimings[]
): { time: string; yesterday: boolean } | null {
  const idx = timings.findIndex((t) => t.key === nextKey);
  if (idx <= 0) {
    const isha = timings.find((t) => t.key === "Isha");
    return isha ? { time: isha.time, yesterday: true } : null;
  }
  return { time: timings[idx - 1].time, yesterday: false };
}
