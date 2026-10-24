import type { ReactNode, SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: P & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconDome = (p: P) => (
  <Svg {...p}>
    <path d="M5 21v-4.6C5 11.6 8 9 12 9s7 2.6 7 7.4V21" />
    <path d="M3 21h18" />
    <path d="M12 9V6.9" />
    <circle cx="12" cy="5.2" r="1.4" />
    <path d="M10 21v-2.6a2 2 0 0 1 4 0V21" />
  </Svg>
);

export const IconBook = (p: P) => (
  <Svg {...p}>
    <path d="M12 6.2C10 4.8 7.6 4.3 4 4.3v13.9c3.6 0 6 .5 8 1.9 2-1.4 4.4-1.9 8-1.9V4.3c-3.6 0-6 .5-8 1.9Z" />
    <path d="M12 6.2v13.9" />
  </Svg>
);

export const IconBeads = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="11" r="6.8" />
    <circle cx="18.8" cy="11" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="16.8" cy="15.8" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="12" cy="17.8" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="7.2" cy="15.8" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="5.2" cy="11" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="7.2" cy="6.2" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="12" cy="4.2" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="16.8" cy="6.2" r="1.15" fill="currentColor" stroke="none" />
    <path d="M12 17.8v3.4" />
  </Svg>
);

export const IconStar8 = (p: P) => (
  <Svg {...p}>
    <rect x="7.1" y="7.1" width="9.8" height="9.8" />
    <rect x="7.1" y="7.1" width="9.8" height="9.8" transform="rotate(45 12 12)" />
  </Svg>
);

export const IconClock = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const IconPin = (p: P) => (
  <Svg {...p}>
    <path d="M12 21s-6.5-5.3-6.5-10.2A6.5 6.5 0 0 1 12 4.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15.7 12 21 12 21Z" />
    <circle cx="12" cy="10.8" r="2.3" />
  </Svg>
);

export const IconCompass = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m15.5 8.5-2 5-5 2 2-5Z" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconBell = (p: P) => (
  <Svg {...p}>
    <path d="M6 9.5a6 6 0 0 1 12 0c0 4 1.6 5.5 1.6 5.5H4.4S6 13.5 6 9.5Z" />
    <path d="M10 18.5a2.2 2.2 0 0 0 4 0" />
  </Svg>
);

export const IconBellOff = (p: P) => (
  <Svg {...p}>
    <path d="M6 9.5a6 6 0 0 1 12 0c0 4 1.6 5.5 1.6 5.5H4.4S6 13.5 6 9.5Z" />
    <path d="M10 18.5a2.2 2.2 0 0 0 4 0" />
    <path d="m4 4 16 16" />
  </Svg>
);

export const IconPlay = (p: P) => (
  <Svg {...p}>
    <path d="M8 5.4v13.2L19 12Z" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconPause = (p: P) => (
  <Svg {...p}>
    <rect x="6.8" y="5.4" width="3.6" height="13.2" rx="1" fill="currentColor" stroke="none" />
    <rect x="13.6" y="5.4" width="3.6" height="13.2" rx="1" fill="currentColor" stroke="none" />
  </Svg>
);

/** "next" points left (forward in RTL reading direction) */
export const IconNext = (p: P) => (
  <Svg {...p}>
    <path d="M17 5.5v13" />
    <path d="M14.2 12 6.8 16.8V7.2Z" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconPrev = (p: P) => (
  <Svg {...p}>
    <path d="M7 5.5v13" />
    <path d="M9.8 12l7.4 4.8V7.2Z" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconVolume = (p: P) => (
  <Svg {...p}>
    <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5Z" />
    <path d="M15.5 9a4.2 4.2 0 0 1 0 6" />
    <path d="M18 6.8a7.6 7.6 0 0 1 0 10.4" />
  </Svg>
);

export const IconVolumeX = (p: P) => (
  <Svg {...p}>
    <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5Z" />
    <path d="m16.5 9.5 5 5M21.5 9.5l-5 5" />
  </Svg>
);

export const IconX = (p: P) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
);

export const IconSearch = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Svg>
);

export const IconRefresh = (p: P) => (
  <Svg {...p}>
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 4v4h-4" />
  </Svg>
);

export const IconLocate = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="6.5" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
  </Svg>
);

export const IconCheck = (p: P) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);

export const IconGear = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8" />
  </Svg>
);

export const IconSun = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3.8" />
    <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
  </Svg>
);

export const IconSunrise = (p: P) => (
  <Svg {...p}>
    <path d="M3 18.5h18" />
    <path d="M6.8 18.5a5.2 5.2 0 0 1 10.4 0" />
    <path d="M12 3.5v5M9.8 5.7 12 3.5l2.2 2.2" />
  </Svg>
);

export const IconSunset = (p: P) => (
  <Svg {...p}>
    <path d="M3 18.5h18" />
    <path d="M6.8 18.5a5.2 5.2 0 0 1 10.4 0" />
    <path d="M12 3.5v5M9.8 6.3 12 8.5l2.2-2.2" />
  </Svg>
);

export const IconSunLow = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="13" r="3.8" />
    <path d="M12 5v2.2M4.5 13h2.2M17.3 13h2.2M6.7 7.7l1.6 1.6M17.3 7.7l-1.6 1.6" />
    <path d="M3 20h18" />
  </Svg>
);

export const IconMoon = (p: P) => (
  <Svg {...p}>
    <path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10Z" />
    <path d="m17.2 6 .5 1.1 1.1.5-1.1.5-.5 1.1-.5-1.1-1.1-.5 1.1-.5Z" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconLamp = (p: P) => (
  <Svg {...p}>
    <path d="M12 2.2v2.6" />
    <path d="M9 8.2a3 3 0 0 1 6 0" />
    <path d="M8.7 8.2h6.6l-1 6.5a2.8 2.8 0 0 1-4.6 0Z" />
    <path d="M12 17.2v2" />
    <circle cx="12" cy="20.8" r="1" />
  </Svg>
);

export const IconQuote = (p: P) => (
  <Svg {...p}>
    <path
      d="M10.2 6.8c-3 .8-4.7 2.9-4.7 5.8v4.6h5.3v-5.3H7.6c.1-2 1.1-3.2 2.6-3.8ZM19.2 6.8c-3 .8-4.7 2.9-4.7 5.8v4.6h5.3v-5.3h-3.2c.1-2 1.1-3.2 2.6-3.8Z"
      fill="currentColor"
      stroke="none"
    />
  </Svg>
);

export const IconSparkle = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.5 13.8 10l6.7 2-6.7 2L12 20.5 10.2 14l-6.7-2 6.7-2Z" />
  </Svg>
);

export const IconSpinner = (p: P) => (
  <Svg {...p} className={`animate-spin ${p.className ?? ""}`}>
    <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
  </Svg>
);

export const IconDownload = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.5v10M8.5 10 12 13.5 15.5 10" />
    <path d="M4.5 15.5v2.8a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2.8" />
  </Svg>
);

export const IconTrash = (p: P) => (
  <Svg {...p}>
    <path d="M4.5 6.5h15M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5" />
    <path d="M6.5 6.5 7.3 19a1.8 1.8 0 0 0 1.8 1.7h5.8A1.8 1.8 0 0 0 16.7 19l.8-12.5" />
    <path d="M10 10.5v6M14 10.5v6" />
  </Svg>
);

export const IconWifiOff = (p: P) => (
  <Svg {...p}>
    <path d="M2.5 8.5a15 15 0 0 1 6.2-3.4M12.9 5a15 15 0 0 1 8.6 3.5M5.8 12a10 10 0 0 1 3.5-2.2M13.5 10a10 10 0 0 1 4.7 2" />
    <path d="M8.8 15.5a5.5 5.5 0 0 1 6.4 0" />
    <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
    <path d="m4 4 16 16" />
  </Svg>
);

export const IconHardDrive = (p: P) => (
  <Svg {...p}>
    <path d="M4 13.5 6 5.8A2 2 0 0 1 8 4.3h8a2 2 0 0 1 2 1.5l2 7.7" />
    <rect x="3.5" y="13.5" width="17" height="6" rx="2" />
    <path d="M7 16.5h.01M10.5 16.5h.01" />
  </Svg>
);
