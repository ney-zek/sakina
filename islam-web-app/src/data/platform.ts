export const PRAYERS = [
  { key: "Fajr", name: "الفجر" },
  { key: "Dhuhr", name: "الظهر" },
  { key: "Asr", name: "العصر" },
  { key: "Maghrib", name: "المغرب" },
  { key: "Isha", name: "العشاء" },
] as const;

export type PrayerKey = (typeof PRAYERS)[number]["key"];

export interface City {
  id: string;
  name: string;
  en: string;
  country: string;
  lat: number;
  lng: number;
  method: string;
}

export const CITIES: City[] = [
  { id: "makkah", name: "مكة المكرمة", en: "Mecca", country: "Saudi Arabia", lat: 21.4225, lng: 39.8262, method: "MAKKAH" },
  { id: "madinah", name: "المدينة المنورة", en: "Medina", country: "Saudi Arabia", lat: 24.4672, lng: 39.6111, method: "MAKKAH" },
  { id: "riyadh", name: "الرياض", en: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lng: 46.6753, method: "MAKKAH" },
  { id: "jeddah", name: "جدة", en: "Jeddah", country: "Saudi Arabia", lat: 21.5433, lng: 39.1728, method: "MAKKAH" },
  { id: "cairo", name: "القاهرة", en: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357, method: "EGYPT" },
  { id: "alex", name: "الإسكندرية", en: "Alexandria", country: "Egypt", lat: 31.2001, lng: 29.9187, method: "EGYPT" },
  { id: "amman", name: "عمّان", en: "Amman", country: "Jordan", lat: 31.9539, lng: 35.9106, method: "JORDAN" },
  { id: "quds", name: "القدس", en: "Jerusalem", country: "Palestine", lat: 31.7683, lng: 35.2137, method: "MWL" },
  { id: "damascus", name: "دمشق", en: "Damascus", country: "Syria", lat: 33.5138, lng: 36.2765, method: "MWL" },
  { id: "beirut", name: "بيروت", en: "Beirut", country: "Lebanon", lat: 33.8938, lng: 35.5018, method: "MWL" },
  { id: "baghdad", name: "بغداد", en: "Baghdad", country: "Iraq", lat: 33.3152, lng: 44.3661, method: "MWL" },
  { id: "kuwait", name: "مدينة الكويت", en: "Kuwait City", country: "Kuwait", lat: 29.3759, lng: 47.9774, method: "KUWAIT" },
  { id: "doha", name: "الدوحة", en: "Doha", country: "Qatar", lat: 25.2854, lng: 51.531, method: "QATAR" },
  { id: "manama", name: "المنامة", en: "Manama", country: "Bahrain", lat: 26.2285, lng: 50.586, method: "GULF" },
  { id: "dubai", name: "دبي", en: "Dubai", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708, method: "DUBAI" },
  { id: "muscat", name: "مسقط", en: "Muscat", country: "Oman", lat: 23.588, lng: 58.3829, method: "GULF" },
  { id: "sanaa", name: "صنعاء", en: "Sanaa", country: "Yemen", lat: 15.3694, lng: 44.191, method: "MWL" },
  { id: "khartoum", name: "الخرطوم", en: "Khartoum", country: "Sudan", lat: 15.5007, lng: 32.5599, method: "EGYPT" },
  { id: "tripoli", name: "طرابلس", en: "Tripoli", country: "Libya", lat: 32.8872, lng: 13.1913, method: "MWL" },
  { id: "algiers", name: "الجزائر", en: "Algiers", country: "Algeria", lat: 36.7538, lng: 3.0588, method: "ALGERIA" },
  { id: "tunis", name: "تونس", en: "Tunis", country: "Tunisia", lat: 36.8065, lng: 10.1815, method: "TUNISIA" },
  { id: "rabat", name: "الرباط", en: "Rabat", country: "Morocco", lat: 34.0209, lng: -6.8416, method: "MOROCCO" },
];

export const METHODS: { id: string; label: string }[] = [
  { id: "MAKKAH", label: "أم القرى — السعودية" },
  { id: "EGYPT", label: "الهيئة المصرية العامة للمساحة" },
  { id: "MWL", label: "رابطة العالم الإسلامي" },
  { id: "ISNA", label: "أمريكا الشمالية (ISNA)" },
  { id: "KARACHI", label: "جامعة العلوم الإسلامية — كراتشي" },
  { id: "GULF", label: "منطقة الخليج" },
  { id: "KUWAIT", label: "الكويت" },
  { id: "QATAR", label: "قطر" },
  { id: "DUBAI", label: "دبي — الإمارات" },
  { id: "JORDAN", label: "وزارة الأوقاف — الأردن" },
  { id: "TURKEY", label: "رئاسة الشؤون الدينية — تركيا" },
  { id: "TUNISIA", label: "تونس" },
  { id: "ALGERIA", label: "الجزائر" },
  { id: "MOROCCO", label: "وزارة الأوقاف — المغرب" },
  { id: "SINGAPORE", label: "سنغافورة (MUIS)" },
  { id: "MOONSIGHTING", label: "لجنة رؤية الهلال العالمية" },
];

import { ADHAN_LOCAL } from "./adhanLocal";

export const ADHAN_SOUNDS: { id: string; label: string; url: string }[] = [
  { id: "local", label: "الأذان المدمج (يعمل دون إنترنت)", url: ADHAN_LOCAL },
  { id: "azan1", label: "الأذان الأول", url: "https://www.islamcan.com/audio/adhan/azan1.mp3" },
  { id: "azan2", label: "الأذان الثاني", url: "https://www.islamcan.com/audio/adhan/azan2.mp3" },
  { id: "azan3", label: "الأذان الثالث", url: "https://www.islamcan.com/audio/adhan/azan3.mp3" },
  { id: "azan4", label: "الأذان الرابع", url: "https://www.islamcan.com/audio/adhan/azan4.mp3" },
];

export const DAILY_AYAHS: { text: string; ref: string }[] = [
  { text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", ref: "الرعد — 28" },
  { text: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ", ref: "الطلاق — 3" },
  { text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا", ref: "الشرح — 5-6" },
  { text: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ", ref: "البقرة — 152" },
  { text: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ", ref: "البقرة — 186" },
  { text: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", ref: "الزمر — 53" },
  { text: "وَاللَّهُ خَيْرٌ حَافِظًا ۖ وَهُوَ أَرْحَمُ الرَّاحِمِينَ", ref: "يوسف — 64" },
  { text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", ref: "آل عمران — 173" },
  { text: "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ", ref: "هود — 88" },
  { text: "رَبِّ اشْرَحْ لِي صَدْرِي ۝ وَيَسِّرْ لِي أَمْرِي", ref: "طه — 25-26" },
  { text: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ ۚ وَاللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ", ref: "الحديد — 4" },
  { text: "وَقُل رَّبِّ زِدْنِي عِلْمًا", ref: "طه — 114" },
];

export const TASBIH_PHRASES: string[] = [
  "سبحان الله",
  "الحمد لله",
  "الله أكبر",
  "لا إله إلا الله",
  "أستغفر الله",
  "لا حول ولا قوة إلا بالله",
  "سبحان الله وبحمده",
  "اللهم صلِّ على محمد",
];
