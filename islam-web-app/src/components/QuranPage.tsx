import { useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import { SURAHS, type Surah } from "@/data/surahs";
import { QURAN_TEXT } from "@/data/quranText";
import {
  ARABIC_LETTERS,
  reciterLetter,
  reciterSurahUrl,
  type Reciter,
} from "@/data/reciters";
import { normalizeArabic, toArabicDigits } from "@/lib/arabic";
import { formatSize, trackKey, type DownloadMeta } from "@/lib/idb";
import {
  IconBook,
  IconCheck,
  IconDownload,
  IconHardDrive,
  IconPause,
  IconPlay,
  IconSearch,
  IconStar8,
  IconTrash,
  IconX,
} from "./icons";

interface Props {
  featured: Reciter[];
  allReciters: Reciter[];
  recitersLoading: boolean;
  reciter: Reciter | null;
  onReciter: (r: Reciter) => void;
  currentSurah: number | null;
  currentReciterId: string | null;
  playing: boolean;
  onPlay: (n: number) => void;
  onToggle: () => void;
  downloadedKeys: Set<string>;
  downloadBusy: number | null;
  downloadError: string | null;
  downloads: DownloadMeta[];
  onDownload: (n: number) => void;
  onRemoveDownload: (key: string) => void;
  onDismissDownloadError: () => void;
}

function DownloadsModal({
  items,
  onRemove,
  onClose,
}: {
  items: DownloadMeta[];
  onRemove: (key: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-label="إغلاق" />
      <div className="relative flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-gold-500/25 bg-night-900 shadow-2xl animate-fade-up">
        <header className="flex items-center justify-between border-b border-gold-500/15 bg-night-850 px-5 py-4">
          <h3 className="flex items-center gap-2 font-display text-2xl text-gold-300">
            <IconHardDrive className="size-6" />
            التلاوات المحفوظة على الجهاز
          </h3>
          <button
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-sage transition hover:bg-night-700 hover:text-ivory"
            aria-label="إغلاق المحفوظات"
          >
            <IconX className="size-5" />
          </button>
        </header>
        <div className="overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <IconDownload className="mx-auto mb-4 size-10 text-sage/50" />
              <p className="text-sm font-extrabold text-ivory">لا توجد تلاوات محفوظة بعد</p>
              <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-sage">
                اضغط زر الحفظ بجانب أي سورة لتنزيلها على جهازك، ثم استمع إليها في أي وقت دون إنترنت
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((d) => (
                <div
                  key={d.key}
                  className="flex items-center gap-3 rounded-lg border border-gold-500/12 bg-night-850/70 px-4 py-3 transition-colors hover:border-gold-500/30"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-jade-500/30 bg-night-800 text-jade-300">
                    <IconCheck className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-ivory">
                      سورة {SURAHS[d.surah - 1]?.name ?? d.surah}
                    </p>
                    <p className="truncate text-[11px] text-sage">
                      {d.reciterName} · {formatSize(d.size)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-jade-500/15 px-2.5 py-1 text-[10px] font-extrabold text-jade-300">
                    تعمل دون إنترنت
                  </span>
                  <button
                    onClick={() => onRemove(d.key)}
                    className="grid size-8 shrink-0 place-items-center rounded-full text-sage transition hover:bg-red-950/60 hover:text-red-300"
                    aria-label={`حذف سورة ${SURAHS[d.surah - 1]?.name ?? ""} من الجهاز`}
                    title="حذف من الجهاز"
                  >
                    <IconTrash className="size-4.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReaderModal({
  n,
  onClose,
  isCurrent,
  playing,
  onToggle,
}: {
  n: number;
  onClose: () => void;
  isCurrent: boolean;
  playing: boolean;
  onToggle: () => void;
}) {
  const surah = SURAHS[n - 1];
  const [size, setSize] = useState(1);
  const SIZE_CLASSES = [
    "text-[1.3rem] leading-[2.35]",
    "text-[1.6rem] leading-[2.55]",
    "text-[1.95rem] leading-[2.7]",
  ];
  // النص مدمج داخل التطبيق — يعمل فوراً ودون اتصال بالإنترنت
  const ayahs = QURAN_TEXT[n - 1] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-label="إغلاق" />
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gold-500/25 bg-night-900 shadow-2xl animate-fade-up">
        <header className="flex items-center justify-between gap-3 border-b border-gold-500/15 bg-night-850 px-5 py-4">
          <div>
            <h3 className="font-display text-3xl text-gold-300">سورة {surah.name}</h3>
            <p className="mt-0.5 text-xs text-sage">
              {toArabicDigits(surah.ayahs)} آية · {surah.type}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center overflow-hidden rounded-full border border-gold-500/25 sm:flex" aria-label="حجم الخط">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => setSize(i)}
                  className={cn(
                    "px-3 py-2 font-bold transition-colors",
                    i === 0 ? "text-[10px]" : i === 1 ? "text-xs" : "text-sm",
                    size === i ? "bg-gold-400 text-night-950" : "text-sage hover:text-gold-200"
                  )}
                  aria-label={`حجم الخط ${i + 1}`}
                >
                  أ
                </button>
              ))}
            </div>
            {isCurrent && (
              <button
                onClick={onToggle}
                className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-4 py-2 text-xs font-extrabold text-night-950 transition hover:bg-gold-300"
              >
                {playing ? <IconPause className="size-4" /> : <IconPlay className="size-4" />}
                {playing ? "إيقاف مؤقت" : "استئناف التلاوة"}
              </button>
            )}
            <button
              onClick={onClose}
              className="grid size-9 place-items-center rounded-full text-sage transition hover:bg-night-700 hover:text-ivory"
              aria-label="إغلاق المصحف"
            >
              <IconX className="size-5" />
            </button>
          </div>
        </header>

        <div className="overflow-y-auto px-6 py-6 md:px-10">
          {n !== 9 && (
            <p className="mb-6 text-center font-quran text-2xl text-gold-200">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          )}
          <p className={cn("font-quran text-ivory", SIZE_CLASSES[size])}>
            {ayahs.map((text, i) => (
              <span key={i}>
                {text}{" "}
                <span className="mx-1 inline-block font-quran text-lg text-gold-400">
                  ﴿{toArabicDigits(i + 1)}﴾
                </span>{" "}
              </span>
            ))}
          </p>
          <p className="mt-10 text-center text-2xl tracking-[0.6em] text-gold-500/40">۞ ۞ ۞</p>
        </div>
      </div>
    </div>
  );
}

function RecitersModal({
  reciters,
  loading,
  currentId,
  onPick,
  onClose,
}: {
  reciters: Reciter[];
  loading: boolean;
  currentId: string | null;
  onPick: (r: Reciter) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [letter, setLetter] = useState<string | null>(null);

  const letters = useMemo(() => {
    const present = new Set(reciters.map((r) => reciterLetter(r)));
    return ARABIC_LETTERS.filter((l) => present.has(l));
  }, [reciters]);

  const filtered = useMemo(() => {
    let list = reciters;
    if (letter) list = list.filter((r) => reciterLetter(r) === letter);
    const nq = normalizeArabic(q.trim());
    if (!nq) return list;
    return list.filter((r) => normalizeArabic(r.name).includes(nq));
  }, [q, letter, reciters]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-label="إغلاق" />
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gold-500/25 bg-night-900 shadow-2xl animate-fade-up">
        <header className="border-b border-gold-500/15 bg-night-850 px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl text-gold-300">
              جميع القرّاء{" "}
              <span className="tnum text-sm font-sans font-bold text-sage">({toArabicDigits(reciters.length)})</span>
            </h3>
            <button
              onClick={onClose}
              className="grid size-9 place-items-center rounded-full text-sage transition hover:bg-night-700 hover:text-ivory"
              aria-label="إغلاق القائمة"
            >
              <IconX className="size-5" />
            </button>
          </div>
          <div className="relative mt-3">
            <IconSearch className="absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-sage" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن قارئ…"
              className="w-full rounded-lg border border-gold-500/20 bg-night-900 py-2.5 pe-3 ps-10 text-sm text-ivory placeholder:text-sage/50 transition focus:border-gold-400/60"
              autoFocus
            />
          </div>
          <div className="mt-2.5 flex gap-1 overflow-x-auto pb-1 no-scrollbar" aria-label="فهرس الحروف">
            <button
              onClick={() => setLetter(null)}
              className={cn(
                "shrink-0 rounded-md border px-2.5 py-1 text-xs font-extrabold transition-all",
                letter === null
                  ? "border-gold-400/60 bg-gold-400/15 text-gold-200"
                  : "border-gold-500/15 text-sage hover:text-ivory"
              )}
            >
              الكل
            </button>
            {letters.map((l) => (
              <button
                key={l}
                onClick={() => setLetter(letter === l ? null : l)}
                className={cn(
                  "shrink-0 rounded-md border px-2.5 py-1 text-xs font-extrabold transition-all",
                  letter === l
                    ? "border-gold-400/60 bg-gold-400/15 text-gold-200"
                    : "border-gold-500/15 text-sage hover:text-ivory"
                )}
                aria-pressed={letter === l}
              >
                {l}
              </button>
            ))}
          </div>
        </header>

        <div className="overflow-y-auto p-3">
          {loading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-sage">لا يوجد قارئ بهذا الاسم</p>
          ) : (
            <div className="grid gap-1.5 sm:grid-cols-2">
              {filtered.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    onPick(r);
                    onClose();
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-start transition-all",
                    r.id === currentId
                      ? "border-gold-400/55 bg-gold-400/10"
                      : "border-transparent hover:border-gold-500/25 hover:bg-night-850"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full border font-display text-base",
                      r.id === currentId
                        ? "border-gold-400/60 bg-gold-400/15 text-gold-300"
                        : "border-jade-500/30 bg-night-800 text-jade-300"
                    )}
                  >
                    {r.name.trim().charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-ivory">{r.name}</span>
                    <span className="block truncate text-[11px] text-sage">
                      {r.rewaya}
                      {r.surahs ? ` · ${toArabicDigits(r.surahs.length)} سورة` : " · المصحف كامل"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function QuranPage(p: Props) {
  const [q, setQ] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);
  const [readerSurah, setReaderSurah] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const nq = normalizeArabic(q.trim());
    if (!nq) return SURAHS;
    return SURAHS.filter(
      (s) =>
        normalizeArabic(s.name).includes(nq) ||
        toArabicDigits(s.n) === q.trim() ||
        String(s.n) === q.trim()
    );
  }, [q]);

  return (
    <div className="space-y-6">
      {/* Reciters strip */}
      <section className="animate-fade-up">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl text-gold-200">المصحف المرتَّل</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowDownloads(true)}
              className="inline-flex items-center gap-2 rounded-full border border-jade-500/40 bg-jade-500/10 px-4 py-2 text-xs font-bold text-jade-200 transition hover:border-jade-400/70 hover:bg-jade-500/20"
              title="التلاوات المحفوظة على جهازك — تعمل دون إنترنت"
            >
              <IconHardDrive className="size-4" />
              المحفوظات {p.downloads.length ? `(${toArabicDigits(p.downloads.length)})` : ""}
            </button>
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-night-850 px-4 py-2 text-xs font-bold text-gold-200 transition hover:border-gold-400/60 hover:bg-gold-400/10"
            >
              <IconBook className="size-4" />
              جميع القرّاء {p.allReciters.length ? `(${toArabicDigits(p.allReciters.length)})` : ""}
            </button>
          </div>
        </div>

        {p.downloadError && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-red-400/25 bg-red-950/40 px-4 py-3 text-xs font-medium text-red-200 animate-fade-up">
            <span>{p.downloadError}</span>
            <button
              onClick={p.onDismissDownloadError}
              className="shrink-0 font-extrabold underline underline-offset-4 transition hover:text-red-100"
            >
              حسناً
            </button>
          </div>
        )}

        <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {p.recitersLoading && p.featured.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-[4.4rem] w-40 shrink-0 rounded-xl" />
              ))
            : p.featured.map((r) => {
                const active = p.reciter?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => p.onReciter(r)}
                    className={cn(
                      "flex w-40 shrink-0 items-center gap-3 rounded-xl border p-3 text-start transition-all duration-300",
                      active
                        ? "border-gold-400/60 bg-gold-400/10 shadow-[0_0_20px_-6px_rgba(207,160,68,0.55)]"
                        : "border-gold-500/12 bg-night-850/70 hover:border-gold-500/40 hover:bg-night-800"
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full border font-display text-lg",
                        active
                          ? "border-gold-400/70 bg-gold-400/15 text-gold-300"
                          : "border-jade-500/30 bg-night-800 text-jade-300"
                      )}
                    >
                      {r.name.trim().charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <span className={cn("block truncate text-[13px] font-extrabold", active ? "text-gold-200" : "text-ivory")}>
                        {r.name}
                      </span>
                      <span className="block truncate text-[10px] text-sage">{r.rewaya}</span>
                    </span>
                  </button>
                );
              })}
        </div>
        {p.reciter?.surahs && (
          <p className="mt-1 text-[11px] text-sage">
            يتوفر لهذا القارئ {toArabicDigits(p.reciter.surahs.length)} سورة — السور غير المتاحة تظهر معطّلة
          </p>
        )}
      </section>

      {/* Search */}
      <div className="relative animate-fade-up">
        <IconSearch className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-sage" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن سورة بالاسم أو الرقم…"
          className="w-full rounded-xl border border-gold-500/20 bg-night-850/70 py-3.5 pe-4 ps-12 text-sm font-medium text-ivory placeholder:text-sage/50 transition focus:border-gold-400/60 focus:bg-night-850"
        />
      </div>

      {/* Surah list */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-sage">لا توجد سورة بهذا الاسم</p>
      ) : (
        <div className="grid gap-2.5 md:grid-cols-2">
          {filtered.map((s: Surah, i) => {
            const available = p.reciter ? reciterSurahUrl(p.reciter, s.n) != null : true;
            const isCurrent = p.currentSurah === s.n && p.currentReciterId === p.reciter?.id;
            const savedKey = p.reciter ? trackKey(p.reciter.id, s.n) : "";
            const isSaved = savedKey !== "" && p.downloadedKeys.has(savedKey);
            return (
              <div
                key={s.n}
                className={cn(
                  "group flex items-center gap-3.5 rounded-xl border p-3 transition-all duration-300 animate-fade-up",
                  isCurrent
                    ? "border-gold-400/55 bg-gold-400/8 card-glow"
                    : "border-gold-500/10 bg-night-850/60 hover:border-gold-500/35 hover:bg-night-800/70",
                  !available && "opacity-45"
                )}
                style={{ animationDelay: `${Math.min(i * 14, 450)}ms` }}
              >
                <span className="relative grid size-11 shrink-0 place-items-center">
                  <IconStar8 className="absolute size-11 text-gold-500/40 transition-transform duration-500 group-hover:rotate-45" />
                  <span className="tnum relative text-[13px] font-extrabold text-gold-300">{toArabicDigits(s.n)}</span>
                </span>

                <button className="min-w-0 flex-1 text-start" onClick={() => setReaderSurah(s.n)} title="قراءة نص السورة">
                  <span className="block truncate text-base font-extrabold text-ivory transition-colors group-hover:text-gold-200">
                    {s.name}
                  </span>
                  <span className="block text-[11px] text-sage">
                    {toArabicDigits(s.ayahs)} آية · {s.type}
                  </span>
                </button>

                {p.reciter && available && (
                  <button
                    onClick={() => p.onDownload(s.n)}
                    disabled={isSaved || p.downloadBusy === s.n}
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-300",
                      isSaved
                        ? "border-jade-400/55 bg-jade-500/15 text-jade-300"
                        : "border-gold-500/25 text-sage hover:border-jade-400/60 hover:text-jade-300",
                      p.downloadBusy === s.n && "animate-pulse"
                    )}
                    aria-label={isSaved ? `سورة ${s.name} محفوظة على الجهاز` : `حفظ سورة ${s.name} على الجهاز`}
                    title={isSaved ? "محفوظة على الجهاز — تعمل دون إنترنت" : "حفظ على الجهاز (بدون إنترنت)"}
                  >
                    {p.downloadBusy === s.n ? (
                      <span className="size-4 animate-spin rounded-full border-2 border-sage/40 border-t-jade-300" />
                    ) : isSaved ? (
                      <IconCheck className="size-4.5" />
                    ) : (
                      <IconDownload className="size-4.5" />
                    )}
                  </button>
                )}

                <button
                  onClick={() => setReaderSurah(s.n)}
                  className="hidden size-9 place-items-center rounded-full border border-gold-500/25 text-sage transition hover:border-gold-400/60 hover:text-gold-300 sm:grid"
                  aria-label={`قراءة سورة ${s.name}`}
                  title="القراءة"
                >
                  <IconBook className="size-4.5" />
                </button>

                <button
                  onClick={() => (isCurrent ? p.onToggle() : p.onPlay(s.n))}
                  disabled={!p.reciter || !available}
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-full border transition-all duration-300",
                    isCurrent
                      ? "border-gold-400 bg-gold-400 text-night-950 shadow-[0_0_18px_-2px_rgba(226,191,102,0.7)]"
                      : "border-gold-500/35 text-gold-300 hover:bg-gold-400 hover:text-night-950",
                    (!p.reciter || !available) && "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-gold-300"
                  )}
                  aria-label={isCurrent ? (p.playing ? "إيقاف مؤقت" : "تشغيل") : `تشغيل سورة ${s.name}`}
                  title={!p.reciter ? "اختر قارئاً أولاً" : !available ? "غير متوفرة لهذا القارئ" : undefined}
                >
                  {isCurrent && p.playing ? (
                    <IconPause className="size-5" />
                  ) : (
                    <IconPlay className="size-5 -me-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!p.reciter && (
        <p className="rounded-xl border border-gold-500/20 bg-gold-400/5 p-4 text-center text-sm text-gold-200 animate-fade-up">
          اختر قارئاً من القائمة أعلاه لبدء الاستماع
        </p>
      )}

      {showAll && (
        <RecitersModal
          reciters={p.allReciters}
          loading={p.recitersLoading}
          currentId={p.reciter?.id ?? null}
          onPick={p.onReciter}
          onClose={() => setShowAll(false)}
        />
      )}

      {showDownloads && (
        <DownloadsModal
          items={p.downloads}
          onRemove={p.onRemoveDownload}
          onClose={() => setShowDownloads(false)}
        />
      )}

      {readerSurah != null && (
        <ReaderModal
          n={readerSurah}
          onClose={() => setReaderSurah(null)}
          isCurrent={p.currentSurah === readerSurah && p.currentReciterId === p.reciter?.id}
          playing={p.playing}
          onToggle={p.onToggle}
        />
      )}
    </div>
  );
}
