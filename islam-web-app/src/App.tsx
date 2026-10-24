import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Header, type TabId } from "@/components/Header";
import { PrayerBoard, type Settings } from "@/components/PrayerBoard";
import { QuranPage } from "@/components/QuranPage";
import { AdhkarPage } from "@/components/AdhkarPage";
import { TasbihPage } from "@/components/TasbihPage";
import { AsmaaPage } from "@/components/AsmaaPage";
import { PlayerBar } from "@/components/PlayerBar";
import { IconBell, IconDome, IconStar8, IconWifiOff } from "@/components/icons";
import { SURAHS } from "@/data/surahs";
import { ADHAN_SOUNDS, CITIES, DAILY_AYAHS, type PrayerKey } from "@/data/platform";
import {
  buildFeatured,
  EXTRA_RECITERS,
  FALLBACK_RECITERS,
  fetchReciters,
  reciterSurahUrl,
  type Reciter,
} from "@/data/reciters";
import { usePrayerTimes, nextPrayer, prevPrayerTime, type PrayerQuery } from "@/hooks/usePrayerTimes";
import { dayOfYear, pad2 } from "@/lib/arabic";
import { qiblaBearing } from "@/lib/qibla";
import { loadLS, saveLS } from "@/lib/storage";
import { deleteTrack, getTrack, putTrack, trackKey, type DownloadMeta } from "@/lib/idb";

const DEFAULT_SETTINGS: Settings = {
  mode: "city",
  cityId: "makkah",
  customCity: "",
  customCountry: "",
  method: "",
  lat: null,
  lng: null,
};

const DEFAULT_ALARMS: Record<PrayerKey, boolean> = {
  Fajr: true,
  Dhuhr: true,
  Asr: true,
  Maghrib: true,
  Isha: true,
};

interface PlayerState {
  surah: number | null;
  reciterId: string | null;
  playing: boolean;
  loading: boolean;
  current: number;
  duration: number;
  error: string | null;
}

const INITIAL_PLAYER: PlayerState = {
  surah: null,
  reciterId: null,
  playing: false,
  loading: false,
  current: 0,
  duration: 0,
  error: null,
};

export default function App() {
  // ─── clock ───
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ─── navigation ───
  const [tab, setTab] = useState<TabId>(() => loadLS<TabId>("sakina:tab", "times"));
  const changeTab = (t: TabId) => {
    setTab(t);
    saveLS("sakina:tab", t);
  };

  // ─── location & prayer times ───
  const [settings, setSettings] = useState<Settings>(() => ({
    ...DEFAULT_SETTINGS,
    ...loadLS<Partial<Settings>>("sakina:settings", {}),
  }));
  const patchSettings = (patch: Partial<Settings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      saveLS("sakina:settings", next);
      return next;
    });
  };

  const city = CITIES.find((c) => c.id === settings.cityId) ?? CITIES[0];
  const isCustom = settings.cityId === "custom";
  const method = settings.method || (isCustom ? "MWL" : city.method);

  const query: PrayerQuery =
    settings.mode === "geo" && settings.lat != null && settings.lng != null
      ? { mode: "geo", lat: settings.lat, lng: settings.lng, method }
      : isCustom
        ? {
            mode: "city",
            city: settings.customCity.trim() || "Mecca",
            country: settings.customCountry.trim() || "Saudi Arabia",
            method,
            lat: undefined,
            lng: undefined,
          }
        : { mode: "city", city: city.en, country: city.country, method, lat: city.lat, lng: city.lng };

  const data = usePrayerTimes(query);
  const retryTimes = data.retry;

  // ─── حالة الاتصال بالإنترنت ───
  const [isOnline, setIsOnline] = useState(() => ("onLine" in navigator ? navigator.onLine : true));
  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      retryTimes();
    };
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [retryTimes]);
  const next = useMemo(
    () => nextPrayer(now, data.timings, data.tomorrowFajr),
    [now, data.timings, data.tomorrowFajr]
  );

  const windowPct = useMemo(() => {
    if (!next || data.timings.length === 0) return 0;
    const prev = prevPrayerTime(next.key, data.timings);
    if (!prev) return 0;
    const [h, m] = prev.time.split(":").map(Number);
    // if the previous prayer was yesterday, start from (next - 1 day); otherwise today
    const prevAt = prev.yesterday ? new Date(next.at.getTime() - 86400000) : new Date(now.getTime());
    prevAt.setHours(h, m, 0, 0);
    const span = next.at.getTime() - prevAt.getTime();
    if (span <= 0) return 0;
    return Math.min(1, Math.max(0, (now.getTime() - prevAt.getTime()) / span));
  }, [next, now, data.timings]);

  const qiblaDeg = useMemo(() => {
    if (settings.mode === "geo" && settings.lat != null && settings.lng != null)
      return qiblaBearing(settings.lat, settings.lng);
    if (!isCustom) return qiblaBearing(city.lat, city.lng);
    return null;
  }, [settings.mode, settings.lat, settings.lng, isCustom, city]);

  const locationLabel =
    settings.mode === "geo"
      ? "موقعك الحالي"
      : isCustom
        ? settings.customCity.trim() || "—"
        : city.name;

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const locateMe = () => {
    if (!("geolocation" in navigator)) {
      setGeoError("متصفحك لا يدعم تحديد الموقع");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        patchSettings({ mode: "geo", lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setGeoLoading(false);
        setGeoError("تعذّر تحديد موقعك — فعّل إذن الموقع أو اختر مدينة");
      },
      { timeout: 9000, maximumAge: 300000 }
    );
  };

  const gregorianLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now),
    [now]
  );

  // ─── adhan alarms ───
  const [alarms, setAlarms] = useState<Record<PrayerKey, boolean>>(() => ({
    ...DEFAULT_ALARMS,
    ...loadLS<Partial<Record<PrayerKey, boolean>>>("sakina:alarms", {}),
  }));
  const toggleAlarm = (k: PrayerKey) => {
    setAlarms((a) => {
      const nextA = { ...a, [k]: !a[k] };
      saveLS("sakina:alarms", nextA);
      return nextA;
    });
  };

  const [adhanId, setAdhanIdState] = useState(() => loadLS("sakina:adhan", "local"));
  const [muted, setMutedState] = useState(() => loadLS("sakina:muted", false));
  const setAdhanId = (id: string) => {
    setAdhanIdState(id);
    saveLS("sakina:adhan", id);
  };
  const setMuted = (m: boolean) => {
    setMutedState(m);
    saveLS("sakina:muted", m);
  };

  const [notifPerm, setNotifPerm] = useState<NotificationPermission | "unsupported">(() =>
    "Notification" in window ? Notification.permission : "unsupported"
  );
  const enableNotif = () => {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then((p) => setNotifPerm(p));
  };

  const adhanAudioRef = useRef<HTMLAudioElement | null>(null);
  const stopAdhanAudio = () => {
    adhanAudioRef.current?.pause();
    adhanAudioRef.current = null;
  };

  const [alarmActive, setAlarmActive] = useState<{ key: PrayerKey; name: string } | null>(null);
  const [adhanTesting, setAdhanTesting] = useState(false);

  const playAdhanSound = useCallback(
    (onEnd?: () => void) => {
      stopAdhanAudio();
      const snd = ADHAN_SOUNDS.find((s) => s.id === adhanId) ?? ADHAN_SOUNDS[0];
      const a = new Audio(snd.url);
      adhanAudioRef.current = a;
      if (onEnd) {
        a.onended = () => {
          onEnd();
          if (adhanAudioRef.current === a) adhanAudioRef.current = null;
        };
      }
      a.play().catch(() => onEnd?.());
    },
    [adhanId]
  );

  const testAdhan = () => {
    if (adhanTesting) {
      stopAdhanAudio();
      setAdhanTesting(false);
      return;
    }
    setAdhanTesting(true);
    playAdhanSound(() => setAdhanTesting(false));
  };

  const firedRef = useRef<Set<string>>(new Set(loadLS<string[]>("sakina:fired", [])));
  useEffect(() => {
    if (now.getSeconds() > 3) return;
    const hhmm = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    for (const t of data.timings) {
      if (t.time !== hhmm || !alarms[t.key]) continue;
      const key = `${now.toDateString()}|${t.key}`;
      if (firedRef.current.has(key)) continue;
      firedRef.current.add(key);
      saveLS("sakina:fired", [...firedRef.current].slice(-40));
      setAlarmActive({ key: t.key, name: t.name });
      if (!muted) playAdhanSound();
      if (notifPerm === "granted" && "Notification" in window) {
        try {
          new Notification("سَكِينَة — حان وقت الصلاة", {
            body: `حان الآن وقت صلاة ${t.name} — تقبّل الله طاعتكم`,
          });
        } catch {
          /* some platforms block constructor */
        }
      }
    }
  }, [now, data.timings, alarms, muted, playAdhanSound, notifPerm]);

  const stopAlarm = () => {
    stopAdhanAudio();
    setAdhanTesting(false);
    setAlarmActive(null);
  };

  // ─── reciters ───
  const [recitersState, setRecitersState] = useState<{
    featured: Reciter[];
    all: Reciter[];
    loading: boolean;
  }>(() => ({
    featured: buildFeatured([]),
    all: [...EXTRA_RECITERS, ...FALLBACK_RECITERS],
    loading: true,
  }));

  useEffect(() => {
    let alive = true;
    fetchReciters()
      .then((api) => {
        if (!alive) return;
        setRecitersState({
          featured: buildFeatured(api),
          all: [...EXTRA_RECITERS, ...api],
          loading: false,
        });
      })
      .catch(() => {
        if (alive) setRecitersState((s) => ({ ...s, loading: false }));
      });
    return () => {
      alive = false;
    };
  }, []);

  const [reciter, setReciterState] = useState<Reciter | null>(() =>
    loadLS<Reciter | null>("sakina:reciter", null)
  );

  // preselect first featured reciter when nothing saved
  useEffect(() => {
    if (!recitersState.loading && !reciter) {
      const first = recitersState.featured[0] ?? null;
      if (first) {
        setReciterState(first);
        saveLS("sakina:reciter", first);
      }
    }
  }, [recitersState.loading, recitersState.featured, reciter]);

  // ─── Quran audio player ───
  const [audio] = useState(() => {
    const a = new Audio();
    a.preload = "metadata";
    return a;
  });
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER);
  const [volume, setVolumeState] = useState(() => loadLS("sakina:volume", 0.9));
  const [playerMuted, setPlayerMutedState] = useState(() => loadLS("sakina:playerMuted", false));

  const setVolume = (v: number) => {
    setVolumeState(v);
    saveLS("sakina:volume", v);
    if (v > 0 && playerMuted) {
      setPlayerMutedState(false);
      saveLS("sakina:playerMuted", false);
    }
  };
  const togglePlayerMute = () => {
    setPlayerMutedState((m) => {
      saveLS("sakina:playerMuted", !m);
      return !m;
    });
  };

  useEffect(() => {
    audio.volume = playerMuted ? 0 : volume;
  }, [audio, volume, playerMuted]);

  const reciterRef = useRef(reciter);
  reciterRef.current = reciter;
  const playerRef = useRef(player);
  playerRef.current = player;

  const playGenRef = useRef(0);
  const blobUrlRef = useRef<string | null>(null);

  const startAudio = useCallback(
    (surahN: number, r: Reciter, autoplay = true) => {
      const url = reciterSurahUrl(r, surahN);
      if (!url) {
        setPlayer((p) => ({
          ...p,
          error: "هذه السورة غير متوفرة بصوت هذا القارئ",
          playing: false,
          loading: false,
        }));
        return;
      }
      const gen = ++playGenRef.current;
      setPlayer({
        surah: surahN,
        reciterId: r.id,
        playing: false,
        loading: true,
        current: 0,
        duration: 0,
        error: null,
      });
      const load = (src: string) => {
        if (playGenRef.current !== gen) return;
        audio.src = src;
        audio.load();
        if (autoplay) {
          audio.play().catch(() => {
            setPlayer((p) => ({ ...p, loading: false, error: "تعذّر التشغيل — اضغط زر التشغيل مجدداً" }));
          });
        }
      };
      // التلاوات المحفوظة على الجهاز تعمل دون اتصال
      getTrack(trackKey(r.id, surahN))
        .then((blob) => {
          if (blob) {
            if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = URL.createObjectURL(blob);
            load(blobUrlRef.current);
          } else {
            load(url);
          }
        })
        .catch(() => load(url));
    },
    [audio]
  );
  const startAudioRef = useRef(startAudio);
  startAudioRef.current = startAudio;

  const stepSurah = useCallback(
    (delta: 1 | -1) => {
      const cur = playerRef.current.surah;
      const r = reciterRef.current;
      if (cur == null || !r) return;
      for (let i = 1; i <= 114; i++) {
        const n = ((((cur - 1 + delta * i) % 114) + 114) % 114) + 1;
        if (reciterSurahUrl(r, n)) {
          startAudioRef.current(n, r);
          return;
        }
      }
    },
    []
  );
  const stepSurahRef = useRef(stepSurah);
  stepSurahRef.current = stepSurah;

  useEffect(() => {
    const onTime = () => setPlayer((p) => ({ ...p, current: audio.currentTime }));
    const onDur = () =>
      setPlayer((p) => ({ ...p, duration: Number.isFinite(audio.duration) ? audio.duration : 0 }));
    const onPlay = () => setPlayer((p) => ({ ...p, playing: true, loading: false, error: null }));
    const onPause = () => setPlayer((p) => ({ ...p, playing: false }));
    const onWaiting = () => setPlayer((p) => ({ ...p, loading: true }));
    const onPlaying = () => setPlayer((p) => ({ ...p, loading: false }));
    const onEnded = () => stepSurahRef.current(1);
    const onError = () => {
      if (!audio.src) return;
      setPlayer((p) => ({
        ...p,
        playing: false,
        loading: false,
        error: "تعذّر تحميل هذا المقطع — جرّب سورة أخرى أو قارئاً آخر",
      }));
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDur);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDur);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [audio]);

  const playSurah = (n: number) => {
    if (!reciter) return;
    startAudio(n, reciter);
  };

  const togglePlay = () => {
    if (!player.surah) return;
    if (audio.paused) {
      audio.play().catch(() =>
        setPlayer((p) => ({ ...p, error: "تعذّر التشغيل — اضغط مجدداً" }))
      );
    } else {
      audio.pause();
    }
  };

  const seek = (t: number) => {
    audio.currentTime = t;
    setPlayer((p) => ({ ...p, current: t }));
  };

  const closePlayer = () => {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    setPlayer(INITIAL_PLAYER);
  };

  // ─── التلاوات المحفوظة على الجهاز (تعمل دون إنترنت) ───
  const [downloads, setDownloads] = useState<DownloadMeta[]>(() =>
    loadLS<DownloadMeta[]>("sakina:downloads", [])
  );
  const [downloadBusy, setDownloadBusy] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const downloadedKeys = useMemo(() => new Set(downloads.map((d) => d.key)), [downloads]);

  const downloadSurah = useCallback(
    async (n: number) => {
      const r = reciterRef.current;
      if (!r) return;
      const url = reciterSurahUrl(r, n);
      const key = trackKey(r.id, n);
      if (!url || downloadedKeys.has(key)) return;
      setDownloadError(null);
      setDownloadBusy(n);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const blob = await res.blob();
        await putTrack(key, blob);
        setDownloads((prev) => {
          const next = [
            ...prev,
            { key, reciterId: r.id, reciterName: r.name, surah: n, size: blob.size },
          ];
          saveLS("sakina:downloads", next);
          return next;
        });
      } catch {
        setDownloadError("تعذّر حفظ التلاوة على الجهاز — يلزم اتصال بالإنترنت عند الحفظ لأول مرة");
      } finally {
        setDownloadBusy(null);
      }
    },
    [downloadedKeys]
  );

  const removeDownload = useCallback(async (key: string) => {
    try {
      await deleteTrack(key);
    } catch {
      /* ignore */
    }
    setDownloads((prev) => {
      const next = prev.filter((d) => d.key !== key);
      saveLS("sakina:downloads", next);
      return next;
    });
  }, []);

  const selectReciter = (r: Reciter) => {
    setReciterState(r);
    saveLS("sakina:reciter", r);
    if (player.surah != null) {
      const url = reciterSurahUrl(r, player.surah);
      if (url) startAudio(player.surah, r);
      else {
        audio.pause();
        setPlayer((p) => ({
          ...p,
          reciterId: r.id,
          playing: false,
          loading: false,
          error: "السورة الحالية غير متوفرة لهذا القارئ — اختر سورة أخرى",
        }));
      }
    }
  };

  // media session (lock-screen controls)
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    if (player.surah != null && reciter) {
      const surah = SURAHS[player.surah - 1];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `سورة ${surah?.name ?? player.surah}`,
        artist: reciter.name,
        album: "سَكِينَة — القرآن الكريم",
      });
    }
    const ms = navigator.mediaSession;
    ms.setActionHandler("play", () => audio.play().catch(() => undefined));
    ms.setActionHandler("pause", () => audio.pause());
    ms.setActionHandler("previoustrack", () => stepSurahRef.current(-1));
    ms.setActionHandler("nexttrack", () => stepSurahRef.current(1));
  }, [player.surah, reciter, audio]);

  const dailyAyah = DAILY_AYAHS[dayOfYear(now) % DAILY_AYAHS.length];

  const currentSurah = player.surah != null ? SURAHS[player.surah - 1] : null;

  return (
    <div className="relative min-h-screen">
      {/* ─── ambient background ─── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_520px_at_50%_-90px,rgba(207,160,68,0.12),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_620px_at_-12%_112%,rgba(55,163,126,0.09),transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(760px_520px_at_112%_28%,rgba(55,163,126,0.07),transparent_60%)]" />
        <div className="pattern-stars absolute inset-0 opacity-[0.045]" />
        <IconStar8
          className="absolute -top-56 left-1/2 size-[38rem] -translate-x-1/2 text-gold-500/[0.05] animate-slow-rotate"
          strokeWidth={0.5}
        />
      </div>

      <Header tab={tab} onTab={changeTab} hijri={data.hijriLabel} now={now} />

      {/* ─── offline notice ─── */}
      {!isOnline && (
        <div className="border-b border-gold-500/25 bg-gold-400/10 animate-fade-in">
          <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 px-4 py-2 text-center text-xs font-bold text-gold-200">
            <IconWifiOff className="size-4 shrink-0" />
            تعمل سَكِينَة الآن دون اتصال — المواقيت بالحساب المحلي، ونص القرآن والتلاوات المحفوظة والأذان المدمج متاحة بالكامل
          </p>
        </div>
      )}

      {/* ─── alarm banner ─── */}
      {alarmActive && (
        <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          <div className="card-glow flex w-full max-w-lg items-center gap-4 rounded-2xl border border-gold-400/60 bg-night-900/95 p-4 backdrop-blur animate-fade-up">
            <span className="grid size-13 shrink-0 place-items-center rounded-full border border-gold-400/50 bg-gold-400/15">
              <IconBell className="size-6 text-gold-300 animate-bell-ring" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl leading-tight text-gold-200">
                حان الآن وقت صلاة {alarmActive.name}
              </p>
              <p className="mt-0.5 text-xs text-sage">حيَّ على الصلاة · حيَّ على الفلاح</p>
            </div>
            <button
              onClick={stopAlarm}
              className="shrink-0 rounded-full bg-gold-400 px-5 py-2.5 text-xs font-extrabold text-night-950 transition hover:bg-gold-300 active:scale-95"
            >
              إيقاف
            </button>
          </div>
        </div>
      )}

      <main className="relative mx-auto max-w-6xl px-4 pb-44 pt-7">
        <div key={tab} className="animate-fade-in">
          {tab === "times" && (
            <PrayerBoard
              data={data}
              retry={data.retry}
              now={now}
              next={next}
              windowPct={windowPct}
              settings={settings}
              onSettings={patchSettings}
              alarms={alarms}
              onToggleAlarm={toggleAlarm}
              adhanId={adhanId}
              onAdhanId={setAdhanId}
              onTestAdhan={testAdhan}
              adhanTesting={adhanTesting}
              muted={muted}
              onMuted={setMuted}
              notifState={notifPerm}
              onEnableNotif={enableNotif}
              qiblaDeg={qiblaDeg}
              locationLabel={locationLabel}
              gregorianLabel={gregorianLabel}
              onGeo={locateMe}
              geoLoading={geoLoading}
              geoError={geoError}
              dailyAyah={dailyAyah}
            />
          )}

          {tab === "quran" && (
            <QuranPage
              featured={recitersState.featured}
              allReciters={recitersState.all}
              recitersLoading={recitersState.loading}
              reciter={reciter}
              onReciter={selectReciter}
              currentSurah={player.surah}
              currentReciterId={player.reciterId}
              playing={player.playing}
              onPlay={playSurah}
              onToggle={togglePlay}
              downloadedKeys={downloadedKeys}
              downloadBusy={downloadBusy}
              downloadError={downloadError}
              downloads={downloads}
              onDownload={downloadSurah}
              onRemoveDownload={removeDownload}
              onDismissDownloadError={() => setDownloadError(null)}
            />
          )}

          {tab === "adhkar" && <AdhkarPage />}
          {tab === "tasbih" && <TasbihPage />}
          {tab === "asmaa" && <AsmaaPage />}
        </div>

        {/* footer */}
        <footer className="mt-20 border-t border-gold-500/10 pt-8 pb-2 text-center">
          <p className="flex items-center justify-center gap-2 font-display text-3xl text-gold-300">
            <IconDome className="size-6" />
            سَكِينَة
          </p>
          <p className="mx-auto mt-3 max-w-md font-quran text-xl leading-relaxed text-jade-200/90">
            ﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾
          </p>
          <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {(
              [
                ["times", "مواقيت الصلاة"],
                ["quran", "القرآن الكريم"],
                ["adhkar", "الأذكار"],
                ["tasbih", "التسبيح"],
                ["asmaa", "أسماء الله الحسنى"],
              ] as [TabId, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => changeTab(id)}
                className="text-xs font-bold text-sage underline-offset-8 transition hover:text-gold-300 hover:underline"
              >
                {label}
              </button>
            ))}
          </nav>
          <p className="mt-7 text-[11px] font-medium text-sage/70">
            اللهم تقبّل منا ومنكم صالح الأعمال · سَكِينَة {new Date().getFullYear()}
          </p>
        </footer>
      </main>

      <PlayerBar
        surah={currentSurah}
        reciterName={reciter?.name ?? ""}
        playing={player.playing}
        loading={player.loading}
        error={player.error}
        current={player.current}
        duration={player.duration}
        volume={volume}
        muted={playerMuted}
        onToggle={togglePlay}
        onNext={() => stepSurah(1)}
        onPrev={() => stepSurah(-1)}
        onSeek={seek}
        onVolume={setVolume}
        onMute={togglePlayerMute}
        onClose={closePlayer}
      />
    </div>
  );
}
