import { cn } from "@/utils/cn";
import type { PrayerData } from "@/hooks/usePrayerTimes";
import { ADHAN_SOUNDS, CITIES, METHODS, PRAYERS, type PrayerKey } from "@/data/platform";
import { formatTime12, toArabicDigits } from "@/lib/arabic";
import {
  IconBell,
  IconBellOff,
  IconCompass,
  IconLamp,
  IconLocate,
  IconMoon,
  IconPin,
  IconQuote,
  IconRefresh,
  IconSparkle,
  IconSpinner,
  IconSun,
  IconSunLow,
  IconSunrise,
  IconSunset,
  IconWifiOff,
} from "./icons";

export interface Settings {
  mode: "city" | "geo";
  cityId: string;
  customCity: string;
  customCountry: string;
  /** empty => use the city's default method */
  method: string;
  lat: number | null;
  lng: number | null;
}

const PRAYER_ICONS: Record<PrayerKey, typeof IconSun> = {
  Fajr: IconSunrise,
  Dhuhr: IconSun,
  Asr: IconSunLow,
  Maghrib: IconSunset,
  Isha: IconMoon,
};

interface Props {
  data: PrayerData;
  retry: () => void;
  now: Date;
  next: { key: PrayerKey; name: string; at: Date } | null;
  windowPct: number;
  settings: Settings;
  onSettings: (patch: Partial<Settings>) => void;
  alarms: Record<PrayerKey, boolean>;
  onToggleAlarm: (k: PrayerKey) => void;
  adhanId: string;
  onAdhanId: (id: string) => void;
  onTestAdhan: () => void;
  adhanTesting: boolean;
  muted: boolean;
  onMuted: (m: boolean) => void;
  notifState: NotificationPermission | "unsupported";
  onEnableNotif: () => void;
  qiblaDeg: number | null;
  locationLabel: string;
  gregorianLabel: string;
  onGeo: () => void;
  geoLoading: boolean;
  geoError: string | null;
  dailyAyah: { text: string; ref: string };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 font-display text-2xl text-gold-200">
      <IconSparkle className="size-5 text-gold-400" />
      {children}
    </h2>
  );
}

function Countdown({ now, at }: { now: Date; at: Date }) {
  const diff = Math.max(0, at.getTime() - now.getTime());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;
  const cells = [
    { v: h, l: "ساعة" },
    { v: m, l: "دقيقة" },
    { v: s, l: "ثانية" },
  ];
  return (
    <div className="flex items-center justify-center gap-2.5">
      {cells.map((c, i) => (
        <div key={c.l} className="flex items-center gap-2.5">
          <div className="min-w-[4.6rem] rounded-xl border border-gold-500/25 bg-night-950/70 px-3 py-2.5 text-center">
            <span className="tnum block font-sans text-4xl font-extrabold text-gold-200">
              {toArabicDigits(String(c.v).padStart(2, "0"))}
            </span>
            <span className="mt-0.5 block text-[11px] font-medium text-sage">{c.l}</span>
          </div>
          {i < cells.length - 1 && <span className="pb-5 text-2xl font-bold text-gold-500/60">:</span>}
        </div>
      ))}
    </div>
  );
}

export function PrayerBoard(p: Props) {
  const { data, settings } = p;
  const city = CITIES.find((c) => c.id === settings.cityId) ?? CITIES[0];
  const methodLabel =
    METHODS.find((m) => m.id === (settings.method || city.method))?.label ?? METHODS[0].label;

  if (data.error) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-400/25 bg-red-950/30 p-10 text-center animate-fade-up">
        <IconBellOff className="mx-auto mb-4 size-10 text-red-300" />
        <p className="mb-5 font-medium leading-relaxed text-red-200">{data.error}</p>
        <button
          onClick={p.retry}
          className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-2.5 text-sm font-bold text-night-950 transition hover:bg-gold-300"
        >
          <IconRefresh className="size-4" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const passedKeys = new Set<PrayerKey>();
  if (!data.loading) {
    for (const t of data.timings) {
      const [h, m] = t.time.split(":").map(Number);
      const d = new Date(p.now);
      d.setHours(h, m, 0, 0);
      if (d.getTime() <= p.now.getTime()) passedKeys.add(t.key);
      else break;
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* ─── Mihrab arch: next prayer ─── */}
        <section
          className="arch-top relative overflow-hidden border border-gold-500/30 bg-gradient-to-b from-night-800 via-night-850 to-night-900 p-7 pt-14 text-center card-glow animate-fade-up"
          aria-label="الصلاة القادمة"
        >
          <div className="pattern-stars pointer-events-none absolute inset-0 opacity-[0.05]" />
          <div className="pointer-events-none absolute inset-x-0 top-16 mx-auto h-56 w-56 rounded-full bg-gold-400/10 blur-3xl animate-glow-pulse" />

          {/* hanging lamp */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center">
            <span className="h-7 w-px bg-gradient-to-b from-gold-400/70 to-gold-400/20" />
            <span className="relative">
              <IconLamp className="size-10 text-gold-300 animate-float-soft" />
              <span className="absolute inset-0 -z-10 scale-[2.2] rounded-full bg-gold-400/20 blur-xl animate-glow-pulse" />
            </span>
          </div>

          {data.loading || !p.next ? (
            <div className="relative space-y-5 py-8">
              <div className="skeleton mx-auto h-6 w-32 rounded-full" />
              <div className="skeleton mx-auto h-16 w-52 rounded-2xl" />
              <div className="skeleton mx-auto h-20 w-full rounded-xl" />
              <div className="skeleton mx-auto h-4 w-40 rounded-full" />
            </div>
          ) : (
            <div className="relative">
              <p className="text-sm font-bold tracking-wide text-jade-300">الصلاة القادمة</p>
              <h2 className="mt-2 font-display text-6xl leading-tight text-gold-300 text-glow">
                {p.next.name}
              </h2>
              <p className="tnum mt-1 text-sm font-medium text-sage">
                {(() => {
                  const f = formatTime12(data.timings.find((t) => t.key === p.next!.key)?.time ?? "");
                  return `${f.time} ${f.period}`;
                })()}
              </p>

              <div className="mt-6">
                <Countdown now={p.now} at={p.next.at} />
              </div>

              {/* prayer-window progress */}
              <div className="mt-6">
                <div className="h-1.5 overflow-hidden rounded-full bg-night-950/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-jade-400 to-gold-400 transition-[width] duration-1000"
                    style={{ width: `${Math.round(p.windowPct * 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-sage">
                  انقضى {toArabicDigits(Math.round(p.windowPct * 100))}٪ من وقت الصلاة الحالية
                </p>
              </div>

              <div className="mt-6 space-y-1.5 border-t border-gold-500/15 pt-4 text-sm">
                <p className="font-bold text-gold-200">{data.hijriLabel}</p>
                <p className="text-xs text-sage">{p.gregorianLabel}</p>
                <p className="flex items-center justify-center gap-1.5 pt-1 text-xs font-medium text-jade-300">
                  <IconPin className="size-3.5" />
                  {p.locationLabel}
                  <span className="text-sage">· طريقة {methodLabel}</span>
                </p>
                {data.isLocal && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-1 text-[10px] font-extrabold text-gold-200">
                    <IconWifiOff className="size-3" />
                    حساب محلي دون اتصال بالإنترنت
                  </p>
                )}
                {p.qiblaDeg != null && (
                  <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-gold-300/90">
                    <IconCompass className="size-4" style={{ transform: `rotate(${p.qiblaDeg}deg)` }} />
                    القبلة على بُعد {toArabicDigits(Math.round(p.qiblaDeg))}° من الشمال
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ─── Prayer cards + settings ─── */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {data.loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-40 rounded-xl" />
                ))
              : data.timings.map((t, i) => {
                  const Icon = PRAYER_ICONS[t.key];
                  const isNext = p.next?.key === t.key;
                  const passed = passedKeys.has(t.key);
                  const f = formatTime12(t.time);
                  const alarmOn = p.alarms[t.key];
                  return (
                    <div
                      key={t.key}
                      className={cn(
                        "relative flex flex-col items-center gap-1.5 rounded-xl border p-4 pt-5 text-center transition-all duration-300 animate-fade-up",
                        isNext
                          ? "border-gold-400/60 bg-night-800 card-glow"
                          : "border-gold-500/12 bg-night-850/70 hover:border-gold-500/35 hover:bg-night-800/70",
                        passed && !isNext && "opacity-55"
                      )}
                      style={{ animationDelay: `${i * 70}ms` }}
                    >
                      <button
                        onClick={() => p.onToggleAlarm(t.key)}
                        className={cn(
                          "absolute top-2 start-2 grid size-7 place-items-center rounded-full transition-colors",
                          alarmOn
                            ? "text-gold-300 hover:bg-gold-400/15"
                            : "text-sage/60 hover:bg-night-700"
                        )}
                        aria-label={`${alarmOn ? "إيقاف" : "تفعيل"} منبه ${t.name}`}
                        title={alarmOn ? "المنبه مفعّل" : "المنبه متوقف"}
                      >
                        {alarmOn ? <IconBell className="size-4" /> : <IconBellOff className="size-4" />}
                      </button>

                      <span
                        className={cn(
                          "grid size-11 place-items-center rounded-full border",
                          isNext
                            ? "border-gold-400/50 bg-gold-400/10 text-gold-300"
                            : "border-jade-500/25 bg-jade-500/8 text-jade-300"
                        )}
                      >
                        <Icon className="size-5.5" />
                      </span>
                      <span className="mt-1 text-sm font-extrabold text-ivory">{t.name}</span>
                      <span className="tnum text-xl font-bold text-gold-100">
                        {f.time}
                        <span className="ms-1 text-[11px] font-medium text-sage">{f.period}</span>
                      </span>
                      {isNext && (
                        <span className="absolute -bottom-2.5 rounded-full bg-gold-400 px-3 py-0.5 text-[10px] font-extrabold text-night-950">
                          التالية
                        </span>
                      )}
                    </div>
                  );
                })}
          </div>

          {/* sunrise / midnight strip */}
          {!data.loading && data.sunrise && (
            <div className="flex flex-wrap gap-2.5 text-xs">
              <span className="rounded-full border border-jade-500/25 bg-night-850/70 px-4 py-1.5 text-jade-200">
                الشروق <b className="tnum">{formatTime12(data.sunrise).time} {formatTime12(data.sunrise).period}</b>
              </span>
              {data.midnight && (
                <span className="rounded-full border border-jade-500/25 bg-night-850/70 px-4 py-1.5 text-jade-200">
                  منتصف الليل <b className="tnum">{formatTime12(data.midnight).time} {formatTime12(data.midnight).period}</b>
                </span>
              )}
            </div>
          )}

          {/* ─── Location & calculation ─── */}
          <section className="rounded-2xl border border-gold-500/15 bg-night-850/60 p-5 animate-fade-up">
            <SectionTitle>الموقع وطريقة الحساب</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-sage">المدينة</span>
                <select
                  value={settings.cityId}
                  onChange={(e) => p.onSettings({ cityId: e.target.value, mode: "city", method: "" })}
                  className="w-full rounded-lg border border-gold-500/20 bg-night-900 px-3 py-2.5 text-sm font-medium text-ivory transition focus:border-gold-400/60"
                >
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  <option value="custom">مدينة أخرى…</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-sage">طريقة الحساب</span>
                <select
                  value={settings.method || city.method}
                  onChange={(e) => p.onSettings({ method: e.target.value })}
                  className="w-full rounded-lg border border-gold-500/20 bg-night-900 px-3 py-2.5 text-sm font-medium text-ivory transition focus:border-gold-400/60"
                >
                  {METHODS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </label>

              {settings.cityId === "custom" && settings.mode === "city" && (
                <>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-sage">اسم المدينة</span>
                    <input
                      value={settings.customCity}
                      onChange={(e) => p.onSettings({ customCity: e.target.value })}
                      placeholder="مثال: London"
                      className="w-full rounded-lg border border-gold-500/20 bg-night-900 px-3 py-2.5 text-sm text-ivory placeholder:text-sage/50 transition focus:border-gold-400/60"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-sage">الدولة</span>
                    <input
                      value={settings.customCountry}
                      onChange={(e) => p.onSettings({ customCountry: e.target.value })}
                      placeholder="مثال: United Kingdom"
                      className="w-full rounded-lg border border-gold-500/20 bg-night-900 px-3 py-2.5 text-sm text-ivory placeholder:text-sage/50 transition focus:border-gold-400/60"
                    />
                  </label>
                </>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={p.onGeo}
                disabled={p.geoLoading}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all",
                  settings.mode === "geo"
                    ? "border-jade-400/60 bg-jade-500/15 text-jade-200"
                    : "border-gold-500/30 bg-night-900 text-gold-200 hover:border-gold-400/60 hover:bg-gold-400/10"
                )}
              >
                {p.geoLoading ? <IconSpinner className="size-4" /> : <IconLocate className="size-4" />}
                {settings.mode === "geo" ? "يُستخدم موقعك الحالي" : "تحديد موقعي تلقائياً"}
              </button>
              {settings.mode === "geo" && (
                <button
                  onClick={() => p.onSettings({ mode: "city" })}
                  className="text-xs font-bold text-sage underline-offset-4 transition hover:text-gold-300 hover:underline"
                >
                  العودة إلى اختيار المدينة
                </button>
              )}
              {p.geoError && <p className="text-xs text-red-300">{p.geoError}</p>}
            </div>

            {p.qiblaDeg != null && (
              <div className="mt-5 flex items-center gap-5 rounded-xl border border-gold-500/15 bg-night-900/70 p-4">
                <div className="relative shrink-0">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-extrabold text-sage">
                    شمال
                  </span>
                  <svg viewBox="0 0 100 100" className="size-24" aria-hidden="true">
                    <circle cx="50" cy="50" r="45" fill="var(--color-night-950)" stroke="rgba(207,160,68,0.3)" strokeWidth="1.5" />
                    {Array.from({ length: 12 }).map((_, i) => (
                      <line
                        key={i}
                        x1="50" y1="7" x2="50" y2={i % 3 === 0 ? "14" : "11"}
                        stroke="rgba(207,160,68,0.45)"
                        strokeWidth={i % 3 === 0 ? 2 : 1}
                        transform={`rotate(${i * 30} 50 50)`}
                      />
                    ))}
                    <g
                      style={{ transform: `rotate(${p.qiblaDeg}deg)`, transformOrigin: "50px 50px" }}
                      className="transition-transform duration-700 ease-out"
                    >
                      <path d="M50 13 L55 50 L50 58 L45 50 Z" fill="var(--color-gold-400)" />
                      <path d="M50 87 L55 50 L50 42 L45 50 Z" fill="rgba(95,189,152,0.55)" />
                    </g>
                    <circle cx="50" cy="50" r="4" fill="var(--color-gold-300)" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-gold-200">اتجاه القبلة</p>
                  <p className="tnum mt-0.5 text-3xl font-extrabold text-gold-300">
                    {toArabicDigits(Math.round(p.qiblaDeg))}°
                  </p>
                  <p className="mt-1 max-w-[15rem] text-[11px] leading-relaxed text-sage">
                    من الشمال باتجاه عقارب الساعة — استقبل الكعبة المشرفة وفقاً لهذا الاتجاه
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* ─── Adhan alarm ─── */}
          <section className="rounded-2xl border border-gold-500/15 bg-night-850/60 p-5 animate-fade-up">
            <SectionTitle>منبّه الأذان</SectionTitle>

            <div className="mb-4 flex flex-wrap gap-2">
              {PRAYERS.map((pr) => {
                const on = p.alarms[pr.key];
                return (
                  <button
                    key={pr.key}
                    onClick={() => p.onToggleAlarm(pr.key)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all",
                      on
                        ? "border-gold-400/55 bg-gold-400/12 text-gold-200"
                        : "border-night-600 bg-night-900 text-sage hover:border-gold-500/30"
                    )}
                  >
                    {on ? <IconBell className="size-3.5" /> : <IconBellOff className="size-3.5" />}
                    {pr.name}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-sage">نغمة الأذان</span>
                <select
                  value={p.adhanId}
                  onChange={(e) => p.onAdhanId(e.target.value)}
                  disabled={p.muted}
                  className="w-full rounded-lg border border-gold-500/20 bg-night-900 px-3 py-2.5 text-sm font-medium text-ivory transition focus:border-gold-400/60 disabled:opacity-50"
                >
                  {ADHAN_SOUNDS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </label>
              <div className="flex items-end">
                <button
                  onClick={p.onTestAdhan}
                  disabled={p.muted}
                  className="inline-flex items-center gap-2 rounded-lg border border-jade-500/40 bg-jade-500/10 px-4 py-2.5 text-xs font-bold text-jade-200 transition hover:bg-jade-500/20 disabled:opacity-50"
                >
                  {p.adhanTesting ? <IconBellOff className="size-4" /> : <IconBell className="size-4" />}
                  {p.adhanTesting ? "إيقاف التجربة" : "تجربة النغمة"}
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gold-500/10 pt-4">
              <button
                onClick={() => p.onMuted(!p.muted)}
                className="flex items-center gap-2.5 text-xs font-bold text-ivory"
                role="switch"
                aria-checked={!p.muted}
              >
                <span
                  className={cn(
                    "relative h-5.5 w-10 rounded-full border transition-colors",
                    p.muted ? "border-night-600 bg-night-900" : "border-jade-400/60 bg-jade-500/30"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1/2 size-4 -translate-y-1/2 rounded-full transition-all",
                      p.muted ? "start-0.5 bg-sage/60" : "start-[calc(100%-1.125rem)] bg-jade-300"
                    )}
                  />
                </span>
                صوت المنبه {p.muted ? "مكتوم" : "مفعّل"}
              </button>

              {p.notifState !== "granted" && p.notifState !== "unsupported" && (
                <button
                  onClick={p.onEnableNotif}
                  className="rounded-full border border-gold-500/35 bg-night-900 px-4 py-1.5 text-xs font-bold text-gold-200 transition hover:bg-gold-400/10"
                >
                  تفعيل تنبيهات المتصفح
                </button>
              )}
              {p.notifState === "granted" && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-jade-300">
                  <IconBell className="size-3.5" /> تنبيهات المتصفح مفعّلة
                </span>
              )}
              {p.notifState === "denied" && (
                <span className="text-xs text-sage">تنبيهات المتصفح محظورة من إعدادات المتصفح</span>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* ─── Daily ayah ─── */}
      <section className="relative overflow-hidden rounded-2xl border border-gold-500/20 bg-gradient-to-l from-night-850 via-night-800 to-night-850 p-8 text-center animate-fade-up">
        <div className="pattern-stars pointer-events-none absolute inset-0 opacity-[0.05]" />
        <IconQuote className="mx-auto mb-3 size-8 text-gold-400/80" />
        <p className="text-xs font-bold tracking-wider text-jade-300">آية اليوم</p>
        <blockquote className="mx-auto mt-3 max-w-3xl font-quran text-2xl leading-[2.2] text-gold-100 md:text-3xl">
          ﴿ {p.dailyAyah.text} ﴾
        </blockquote>
        <p className="mt-3 text-sm font-medium text-gold-400">{p.dailyAyah.ref}</p>
      </section>
    </div>
  );
}
