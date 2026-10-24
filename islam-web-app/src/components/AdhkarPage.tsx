import { useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import { ADHKAR, type DhikrCategory } from "@/data/adhkar";
import { loadLS, saveLS } from "@/lib/storage";
import { toArabicDigits } from "@/lib/arabic";
import {
  IconCheck,
  IconDome,
  IconMoon,
  IconQuote,
  IconRefresh,
  IconSparkle,
  IconSun,
  IconSunrise,
  IconSunset,
} from "./icons";

const CATS: { id: DhikrCategory; label: string; Icon: typeof IconSunrise }[] = [
  { id: "morning", label: "أذكار الصباح", Icon: IconSunrise },
  { id: "evening", label: "أذكار المساء", Icon: IconSunset },
  { id: "sleep", label: "أذكار النوم", Icon: IconMoon },
  { id: "wake", label: "الاستيقاظ", Icon: IconSun },
  { id: "afterPrayer", label: "بعد الصلاة", Icon: IconDome },
  { id: "duas", label: "أدعية مختارة", Icon: IconQuote },
];

const LS_KEY = "sakina:adhkar:v1";

export function AdhkarPage() {
  const [cat, setCat] = useState<DhikrCategory>(() => {
    const h = new Date().getHours();
    return h >= 4 && h < 15 ? "morning" : h >= 15 && h < 19 ? "evening" : "sleep";
  });
  const [counts, setCounts] = useState<Record<string, number>>(() => loadLS(LS_KEY, {}));

  const items = useMemo(() => ADHKAR.filter((d) => d.cat === cat), [cat]);
  const totalNeeded = items.reduce((a, d) => a + d.count, 0);
  const totalDone = items.reduce((a, d) => a + Math.min(counts[d.id] ?? 0, d.count), 0);
  const pct = totalNeeded > 0 ? (totalDone / totalNeeded) * 100 : 0;

  const tap = (id: string, max: number) => {
    setCounts((prev) => {
      const cur = prev[id] ?? 0;
      if (cur >= max) return prev;
      const next = { ...prev, [id]: cur + 1 };
      saveLS(LS_KEY, next);
      return next;
    });
    if (navigator.vibrate) navigator.vibrate(12);
  };

  const resetCat = () => {
    setCounts((prev) => {
      const next = { ...prev };
      for (const d of items) delete next[d.id];
      saveLS(LS_KEY, next);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* category tabs */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar animate-fade-up">
        {CATS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setCat(id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-extrabold transition-all duration-300",
              cat === id
                ? "border-gold-400/60 bg-gold-400/10 text-gold-300 shadow-[0_0_18px_-5px_rgba(207,160,68,0.55)]"
                : "border-gold-500/12 bg-night-850/70 text-sage hover:border-gold-500/35 hover:text-ivory"
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </div>

      {/* progress */}
      <section className="rounded-2xl border border-gold-500/15 bg-night-850/60 p-5 animate-fade-up">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-extrabold text-ivory">
            أُنجز <span className="text-gold-300">{toArabicDigits(totalDone)}</span> من{" "}
            <span className="text-gold-300">{toArabicDigits(totalNeeded)}</span> ذكراً
          </p>
          <button
            onClick={resetCat}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/25 px-3.5 py-1.5 text-[11px] font-bold text-sage transition hover:border-gold-400/50 hover:text-gold-200"
          >
            <IconRefresh className="size-3.5" />
            إعادة تعيين القسم
          </button>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-night-950/80">
          <div
            className="h-full rounded-full bg-gradient-to-l from-jade-400 via-gold-400 to-gold-300 transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct >= 100 && (
          <p className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-jade-300 animate-fade-in">
            <IconCheck className="size-4" />
            تقبّل الله منك — أتممت أذكار هذا القسم
          </p>
        )}
      </section>

      {/* dhikr cards */}
      <div className="space-y-3.5">
        {items.map((d, i) => {
          const cur = Math.min(counts[d.id] ?? 0, d.count);
          const done = cur >= d.count;
          const remaining = d.count - cur;
          return (
            <article
              key={d.id}
              className={cn(
                "rounded-2xl border p-5 transition-all duration-500 animate-fade-up",
                done
                  ? "border-jade-500/40 bg-jade-700/10"
                  : "border-gold-500/12 bg-night-850/60 hover:border-gold-500/30"
              )}
              style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
            >
              <div className="flex items-start gap-4">
                <p
                  className={cn(
                    "flex-1 font-quran text-xl leading-[2.3] md:text-[1.35rem]",
                    done ? "text-jade-200/85" : "text-ivory"
                  )}
                >
                  {d.text}
                </p>

                <button
                  onClick={() => tap(d.id, d.count)}
                  disabled={done}
                  className={cn(
                    "relative grid size-[4.6rem] shrink-0 place-items-center rounded-full border-2 transition-all duration-300",
                    done
                      ? "border-jade-400/70 bg-jade-500/20 text-jade-200"
                      : "border-gold-400/50 bg-night-900 text-gold-300 hover:scale-105 hover:border-gold-300 hover:shadow-[0_0_22px_-4px_rgba(207,160,68,0.6)] active:scale-95"
                  )}
                  aria-label={done ? "اكتمل الذكر" : `سَبِّح — باقي ${remaining}`}
                >
                  {done ? (
                    <IconCheck className="size-7 animate-pop" />
                  ) : (
                    <span key={cur} className="tnum animate-pop text-2xl font-extrabold">
                      {toArabicDigits(remaining)}
                    </span>
                  )}
                  {/* ring progress */}
                  <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                    <circle
                      cx="50" cy="50" r="46"
                      fill="none"
                      stroke={done ? "rgba(95,189,152,0.55)" : "rgba(226,191,102,0.5)"}
                      strokeWidth="3.5"
                      strokeDasharray={`${(cur / d.count) * 289} 289`}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gold-500/10 pt-3">
                <p className="text-[11px] font-medium leading-relaxed text-sage">
                  {d.virtue ?? `يُقال ${toArabicDigits(d.count)} ${d.count === 1 ? "مرة" : d.count === 2 ? "مرتين" : "مرات"}`}
                </p>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-extrabold",
                    done ? "bg-jade-500/20 text-jade-200" : "bg-gold-400/10 text-gold-300"
                  )}
                >
                  {done ? "تمّ ✓" : `${toArabicDigits(cur)} / ${toArabicDigits(d.count)}`}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <p className="flex items-center justify-center gap-2 pb-2 text-xs text-sage">
        <IconSparkle className="size-4 text-gold-500/60" />
        يُحفظ تقدّمك تلقائياً على هذا الجهاز
      </p>
    </div>
  );
}
