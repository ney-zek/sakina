import { cn } from "@/utils/cn";
import { formatTime12 } from "@/lib/arabic";
import { IconBeads, IconBook, IconClock, IconDome, IconSparkle, IconStar8 } from "./icons";

export type TabId = "times" | "quran" | "adhkar" | "tasbih" | "asmaa";

const TABS: { id: TabId; label: string; Icon: typeof IconClock }[] = [
  { id: "times", label: "المواقيت", Icon: IconClock },
  { id: "quran", label: "القرآن الكريم", Icon: IconBook },
  { id: "adhkar", label: "الأذكار", Icon: IconBeads },
  { id: "tasbih", label: "التسبيح", Icon: IconStar8 },
  { id: "asmaa", label: "أسماء الله الحسنى", Icon: IconSparkle },
];

interface Props {
  tab: TabId;
  onTab: (t: TabId) => void;
  hijri: string;
  now: Date;
}

export function Header({ tab, onTab, hijri, now }: Props) {
  const clock = formatTime12(
    `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  );

  return (
    <header className="sticky top-0 z-40 border-b border-gold-500/15 bg-night-950/85 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Brand */}
          <button
            onClick={() => onTab("times")}
            className="group flex items-center gap-3 text-right"
            aria-label="سَكِينَة — الرئيسية"
          >
            <span className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-gold-400/40 bg-gradient-to-b from-night-700 to-night-900 text-gold-300 shadow-[0_0_24px_-6px_rgba(207,160,68,0.5)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <IconDome className="size-6" />
              <span className="absolute -top-1 -left-1 size-2 rounded-full bg-gold-400 animate-glow-pulse" />
            </span>
            <span>
              <span className="block font-display text-3xl leading-none text-gold-300 text-glow">
                سَكِينَة
              </span>
              <span className="mt-1 hidden text-[11px] font-medium text-sage sm:block">
                رفيقُك اليومي للعبادة والطمأنينة
              </span>
            </span>
          </button>

          {/* Clock + Hijri */}
          <div className="flex items-center gap-2">
            {hijri && (
              <span className="hidden rounded-full border border-gold-500/25 bg-night-850/80 px-3.5 py-1.5 text-xs font-medium text-gold-200 md:inline-block">
                {hijri}
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-full border border-jade-500/30 bg-night-850/80 px-3.5 py-1.5 text-sm font-bold text-jade-200">
              <IconClock className="size-4" />
              <span className="tnum">
                {clock.time} <span className="text-[10px] font-medium text-jade-300/80">{clock.period}</span>
              </span>
            </span>
          </div>
        </div>

        {/* Tabs */}
        <nav className="-mb-px flex gap-1 overflow-x-auto pb-3 no-scrollbar" aria-label="أقسام المنصة">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onTab(id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all duration-300",
                tab === id
                  ? "border-gold-400/60 bg-gold-400/10 text-gold-300 shadow-[0_0_18px_-4px_rgba(207,160,68,0.5)]"
                  : "border-transparent text-sage hover:border-gold-500/20 hover:bg-night-850 hover:text-ivory"
              )}
              aria-current={tab === id ? "page" : undefined}
            >
              <Icon className="size-4.5" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
