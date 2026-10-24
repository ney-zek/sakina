import { cn } from "@/utils/cn";
import type { Surah } from "@/data/surahs";
import { toArabicDigits } from "@/lib/arabic";
import {
  IconNext,
  IconPause,
  IconPlay,
  IconPrev,
  IconSpinner,
  IconVolume,
  IconVolumeX,
  IconX,
} from "./icons";

interface Props {
  surah: Surah | null;
  reciterName: string;
  playing: boolean;
  loading: boolean;
  error: string | null;
  current: number;
  duration: number;
  volume: number;
  muted: boolean;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (t: number) => void;
  onVolume: (v: number) => void;
  onMute: () => void;
  onClose: () => void;
}

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return toArabicDigits(`${m}:${String(s).padStart(2, "0")}`);
}

function Eq() {
  return (
    <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[3px] origin-bottom animate-eq rounded-full bg-gold-400"
          style={{ height: "100%", animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  );
}

export function PlayerBar(p: Props) {
  if (!p.surah) return null;
  const pct = p.duration > 0 ? Math.min(100, (p.current / p.duration) * 100) : 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 animate-fade-up border-t border-gold-500/20 bg-night-900/95 backdrop-blur-lg">
      {/* progress hairline */}
      <div className="absolute inset-x-0 -top-px h-px bg-gold-500/15">
        <div className="h-full bg-gold-400 transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3">
        {/* Track info */}
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative grid size-11 shrink-0 place-items-center rounded-lg border border-gold-400/35 bg-night-800 font-display text-lg text-gold-300">
            {toArabicDigits(p.surah.n)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-ivory">
              سورة {p.surah.name}
              {p.playing && <span className="ms-2 inline-block align-middle"><Eq /></span>}
            </p>
            <p className="truncate text-xs text-sage">{p.reciterName}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={p.onPrev}
            className="grid size-9 place-items-center rounded-full text-sage transition-colors hover:bg-night-800 hover:text-gold-300"
            aria-label="السورة السابقة"
          >
            <IconPrev className="size-5" />
          </button>
          <button
            onClick={p.onToggle}
            disabled={p.loading}
            className="grid size-12 place-items-center rounded-full bg-gold-400 text-night-950 shadow-[0_0_26px_-4px_rgba(226,191,102,0.7)] transition-all hover:bg-gold-300 hover:shadow-[0_0_34px_-4px_rgba(226,191,102,0.9)] active:scale-95 disabled:opacity-60"
            aria-label={p.playing ? "إيقاف مؤقت" : "تشغيل"}
          >
            {p.loading ? (
              <IconSpinner className="size-5" />
            ) : p.playing ? (
              <IconPause className="size-5" />
            ) : (
              <IconPlay className="size-5 -me-0.5" />
            )}
          </button>
          <button
            onClick={p.onNext}
            className="grid size-9 place-items-center rounded-full text-sage transition-colors hover:bg-night-800 hover:text-gold-300"
            aria-label="السورة التالية"
          >
            <IconNext className="size-5" />
          </button>
        </div>

        {/* Seek */}
        <div className="order-last flex w-full items-center gap-3 md:order-none md:w-auto md:flex-1">
          <span className="tnum w-10 text-end text-[11px] text-sage">{fmt(p.current)}</span>
          <input
            type="range"
            min={0}
            max={p.duration || 0}
            step={1}
            value={p.current}
            onChange={(e) => p.onSeek(Number(e.target.value))}
            className="flex-1"
            style={{
              background: `linear-gradient(to left, var(--color-gold-400) ${pct}%, rgba(255,255,255,0.12) ${pct}%)`,
            }}
            aria-label="شريط التقدم"
          />
          <span className="tnum w-10 text-[11px] text-sage">{fmt(p.duration)}</span>
        </div>

        {/* Volume + close */}
        <div className="ms-auto flex items-center gap-2">
          <button
            onClick={p.onMute}
            className="grid size-9 place-items-center rounded-full text-sage transition-colors hover:bg-night-800 hover:text-gold-300"
            aria-label={p.muted ? "إلغاء الكتم" : "كتم الصوت"}
          >
            {p.muted || p.volume === 0 ? <IconVolumeX className="size-5" /> : <IconVolume className="size-5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={p.muted ? 0 : p.volume}
            onChange={(e) => p.onVolume(Number(e.target.value))}
            className="w-20"
            style={{
              background: `linear-gradient(to left, var(--color-jade-400) ${(p.muted ? 0 : p.volume) * 100}%, rgba(255,255,255,0.12) ${(p.muted ? 0 : p.volume) * 100}%)`,
            }}
            aria-label="مستوى الصوت"
          />
          <button
            onClick={p.onClose}
            className={cn(
              "grid size-9 place-items-center rounded-full text-sage transition-colors hover:bg-night-800 hover:text-red-300"
            )}
            aria-label="إغلاق المشغل"
          >
            <IconX className="size-5" />
          </button>
        </div>
      </div>

      {p.error && (
        <p className="border-t border-red-400/20 bg-red-950/40 px-4 py-1.5 text-center text-xs text-red-300">
          {p.error}
        </p>
      )}
    </div>
  );
}
