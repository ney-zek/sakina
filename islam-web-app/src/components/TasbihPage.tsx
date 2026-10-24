import { useState } from "react";
import { cn } from "@/utils/cn";
import { TASBIH_PHRASES } from "@/data/platform";
import { loadLS, saveLS } from "@/lib/storage";
import { toArabicDigits } from "@/lib/arabic";
import { IconRefresh, IconSparkle } from "./icons";

const LS_KEY = "sakina:tasbih:v1";

interface TasbihState {
  phraseIdx: number;
  target: number;
  count: number;
  cycles: number;
  total: number;
}

const DEFAULT: TasbihState = { phraseIdx: 0, target: 33, count: 0, cycles: 0, total: 0 };

const TARGETS = [33, 99, 100];

export function TasbihPage() {
  const [st, setSt] = useState<TasbihState>(() => ({ ...DEFAULT, ...loadLS<Partial<TasbihState>>(LS_KEY, {}) }));

  const update = (patch: Partial<TasbihState>) => {
    setSt((prev) => {
      const next = { ...prev, ...patch };
      saveLS(LS_KEY, next);
      return next;
    });
  };

  const tap = () => {
    const nextCount = st.count + 1;
    const finishedRound = nextCount >= st.target;
    update({
      count: finishedRound ? 0 : nextCount,
      cycles: st.cycles + (finishedRound ? 1 : 0),
      total: st.total + 1,
    });
    if (navigator.vibrate) navigator.vibrate(finishedRound ? [30, 60, 30] : 10);
  };

  const R = 112;
  const C = 2 * Math.PI * R;
  const frac = st.count / st.target;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="text-center animate-fade-up">
        <h2 className="font-display text-4xl text-gold-200">المسبحة الإلكترونية</h2>
        <p className="mt-2 text-sm text-sage">اذكر الله ذكراً كثيراً — {TASBIH_PHRASES.length} صيغ للاختيار</p>
      </header>

      {/* phrase picker */}
      <div className="flex flex-wrap justify-center gap-2 animate-fade-up">
        {TASBIH_PHRASES.map((ph, i) => (
          <button
            key={ph}
            onClick={() => update({ phraseIdx: i, count: 0 })}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-bold transition-all duration-300",
              st.phraseIdx === i
                ? "border-gold-400/60 bg-gold-400/12 text-gold-200"
                : "border-gold-500/15 bg-night-850/70 text-sage hover:border-gold-500/40 hover:text-ivory"
            )}
          >
            {ph}
          </button>
        ))}
      </div>

      {/* target picker */}
      <div className="flex items-center justify-center gap-2 animate-fade-up">
        <span className="text-xs font-bold text-sage">هدف الجولة:</span>
        {TARGETS.map((t) => (
          <button
            key={t}
            onClick={() => update({ target: t, count: 0 })}
            className={cn(
              "tnum rounded-full border px-3.5 py-1.5 text-xs font-extrabold transition-all",
              st.target === t
                ? "border-jade-400/60 bg-jade-500/15 text-jade-200"
                : "border-gold-500/15 bg-night-850/70 text-sage hover:text-ivory"
            )}
          >
            {toArabicDigits(t)}
          </button>
        ))}
      </div>

      {/* the bead */}
      <div className="flex justify-center animate-fade-up" style={{ animationDelay: "120ms" }}>
        <button
          onClick={tap}
          className="group relative grid size-72 place-items-center rounded-full transition-transform duration-150 active:scale-[0.97] md:size-80"
          aria-label={`سبّح: ${TASBIH_PHRASES[st.phraseIdx]}`}
        >
          <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 260 260" aria-hidden="true">
            <circle cx="130" cy="130" r={R} fill="none" stroke="rgba(22,64,47,0.9)" strokeWidth="9" />
            <circle
              cx="130" cy="130" r={R}
              fill="none"
              stroke="url(#tasbihGrad)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - frac)}
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient id="tasbihGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5fbd98" />
                <stop offset="100%" stopColor="#e2bf66" />
              </linearGradient>
            </defs>
          </svg>

          <span className="pointer-events-none absolute inset-4 rounded-full border border-gold-500/20 bg-gradient-to-b from-night-800 to-night-900 shadow-[inset_0_0_60px_-20px_rgba(207,160,68,0.25)] transition-shadow duration-300 group-hover:shadow-[inset_0_0_80px_-18px_rgba(207,160,68,0.4)]" />

          <span className="relative flex flex-col items-center gap-1 px-8 text-center">
            <span className="font-display text-2xl leading-snug text-jade-200">
              {TASBIH_PHRASES[st.phraseIdx]}
            </span>
            <span key={st.count} className="tnum animate-pop text-7xl font-extrabold text-gold-200 text-glow">
              {toArabicDigits(st.count)}
            </span>
            <span className="tnum text-sm font-bold text-sage">من {toArabicDigits(st.target)}</span>
          </span>
        </button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: "180ms" }}>
        {[
          { label: "عدّاد الجولة", value: st.count, tone: "text-gold-300" },
          { label: "الجولات المكتملة", value: st.cycles, tone: "text-jade-300" },
          { label: "الإجمالي الكلي", value: st.total, tone: "text-ivory" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gold-500/12 bg-night-850/70 p-4 text-center">
            <span className={cn("tnum block text-3xl font-extrabold", s.tone)}>{toArabicDigits(s.value)}</span>
            <span className="mt-1 block text-[11px] font-medium text-sage">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3 pb-2">
        <button
          onClick={() => update({ count: 0, cycles: 0 })}
          className="inline-flex items-center gap-2 rounded-full border border-gold-500/25 px-5 py-2 text-xs font-bold text-sage transition hover:border-gold-400/50 hover:text-gold-200"
        >
          <IconRefresh className="size-4" />
          تصفير الجولة
        </button>
        <button
          onClick={() => update({ count: 0, cycles: 0, total: 0 })}
          className="text-xs font-bold text-sage/70 underline-offset-4 transition hover:text-red-300 hover:underline"
        >
          مسح الإجمالي
        </button>
      </div>

      <p className="flex items-center justify-center gap-2 text-xs text-sage">
        <IconSparkle className="size-4 text-gold-500/60" />
        «كلمتان خفيفتان على اللسان، ثقيلتان في الميزان: سبحان الله وبحمده، سبحان الله العظيم»
      </p>
    </div>
  );
}
