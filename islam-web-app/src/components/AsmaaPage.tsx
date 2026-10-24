import { useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import { ASMA_UL_HUSNA } from "@/data/asmaa";
import { normalizeArabic } from "@/lib/arabic";
import { IconSearch, IconSparkle, IconStar8 } from "./icons";

export function AsmaaPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const nq = normalizeArabic(q.trim());
    if (!nq) return ASMA_UL_HUSNA;
    return ASMA_UL_HUSNA.filter(
      (n) => normalizeArabic(n.name).includes(nq) || normalizeArabic(n.meaning).includes(nq)
    );
  }, [q]);

  return (
    <div className="space-y-7">
      <header className="text-center animate-fade-up">
        <h2 className="font-display text-4xl text-gold-200 md:text-5xl">أسماء الله الحسنى</h2>
        <p className="mx-auto mt-3 max-w-xl font-quran text-xl leading-relaxed text-jade-200 md:text-2xl">
          ﴿وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا﴾
        </p>
        <p className="mt-2 text-sm text-sage">
          «إن لله تسعة وتسعين اسماً مائة إلا واحداً، من أحصاها دخل الجنة»
        </p>
      </header>

      <div className="relative animate-fade-up">
        <IconSearch className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-sage" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن اسم أو معنى…"
          className="w-full rounded-xl border border-gold-500/20 bg-night-850/70 py-3.5 pe-4 ps-12 text-sm font-medium text-ivory placeholder:text-sage/50 transition focus:border-gold-400/60 focus:bg-night-850"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-sage">لا يوجد اسم بهذا البحث</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item, i) => {
            const expanded = open === item.n;
            return (
              <button
                key={item.n}
                onClick={() => setOpen(expanded ? null : item.n)}
                className={cn(
                  "group relative flex flex-col items-center gap-1 overflow-hidden rounded-xl border p-4 pt-5 text-center transition-all duration-300 animate-fade-up",
                  expanded
                    ? "border-gold-400/60 bg-night-800 card-glow"
                    : "border-gold-500/12 bg-night-850/60 hover:-translate-y-0.5 hover:border-gold-500/40 hover:bg-night-800/70"
                )}
                style={{ animationDelay: `${Math.min(i * 8, 400)}ms` }}
                aria-expanded={expanded}
              >
                <span className="pointer-events-none absolute -top-3 -start-3 opacity-[0.06] transition-transform duration-700 group-hover:rotate-45">
                  <IconStar8 className="size-16 text-gold-300" />
                </span>

                <span className="tnum absolute top-2 start-2.5 text-[11px] font-bold text-gold-500/70">
                  {item.n}
                </span>

                <span
                  className={cn(
                    "font-quran leading-snug transition-colors duration-300",
                    expanded ? "text-[1.55rem] font-bold text-gold-200" : "text-[1.45rem] font-bold text-gold-100 group-hover:text-gold-200"
                  )}
                >
                  {item.name}
                </span>

                <span
                  className={cn(
                    "text-[11px] leading-relaxed text-sage transition-all duration-300",
                    expanded ? "mt-1 max-h-24 opacity-100" : "max-h-0 overflow-hidden opacity-0 group-hover:max-h-24 group-hover:opacity-100"
                  )}
                >
                  {item.meaning}
                </span>

                <span className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-jade-300/80">
                  <IconSparkle className="size-3" />
                  {expanded ? "إخفاء المعنى" : "اضغط لعرض المعنى"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <p className="pb-2 text-center text-xs text-sage">
        من أحصاها حفظاً وفهماً وعملاً دخل الجنة — تقبّل الله منا ومنكم
      </p>
    </div>
  );
}
