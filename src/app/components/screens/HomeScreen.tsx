import { useNavigate } from "react-router";
import {
  Clock,
  Menu,
  Sunrise,
  Sun,
  Sunset,
  CloudMoon,
  Star,
  HeartPulse,
  CalendarCheck,
  MapPin,
  Search,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FadeIn } from "../ui/FadeIn";
import { useMenu } from "../ui/MenuContext";
import { useState, useEffect, useMemo, useRef } from "react";

interface PrayerTimeEntry {
  name: string;
  key: string;
  time: string;
  icon: React.ElementType;
  passed: boolean;
  isNext: boolean;
}

const PRAYER_KEYS = [
  { key: "Fajr", name: "الفجر", icon: Star },
  { key: "Sunrise", name: "الشروق", icon: Sunrise },
  { key: "Dhuhr", name: "الظهر", icon: Sun },
  { key: "Asr", name: "العصر", icon: Sun },
  { key: "Maghrib", name: "المغرب", icon: Sunset },
  { key: "Isha", name: "العشاء", icon: CloudMoon },
];

const toArabicNum = (n: number | string): string =>
  n.toString().replace(/\d/g, (d) => '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669'[parseInt(d)]);

const formatTimeArabic = (time24: string): string => {
  const [h, m] = time24.split(":").map(Number);
  return `${toArabicNum(h > 12 ? h - 12 : h)}:${toArabicNum(m.toString().padStart(2, "0"))}`;
};

const formatTimeArabicWithPeriod = (time24: string): string => {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "م" : "ص";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${toArabicNum(h12)}:${toArabicNum(m.toString().padStart(2, "0"))} ${period}`;
};

function CardBlob({ color, opacity = 0.07 }: { color: string; opacity?: number }) {
  return (
    <svg
      className="absolute bottom-0 left-0 w-full h-full pointer-events-none"
      viewBox="0 0 163 191"
      fill="none"
      preserveAspectRatio="xMinYMax slice"
    >
      <path
        d="M-20 191C-20 191 10 140 50 130C90 120 80 80 120 60C160 40 180 80 190 120C200 160 163 191 163 191H-20Z"
        fill={color}
        fillOpacity={opacity}
      />
    </svg>
  );
}

function CardIllustration({
  icon: Icon,
  accentColor,
  bgColor,
}: {
  icon: React.ElementType;
  accentColor: string;
  bgColor: string;
}) {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="absolute w-16 h-16 rounded-full opacity-20"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute w-12 h-12 rounded-full opacity-30"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center relative z-10"
        style={{ backgroundColor: bgColor }}
      >
        <Icon size={22} style={{ color: accentColor }} strokeWidth={1.8} />
      </div>
    </div>
  );
}

const quickCardData = [
  {
    label: "سنن العبادات",
    subtitle: "تعرف على سنن النبي ﷺ",
    icon: Star,
    path: "/sunnah",
    bgColor: "#F2F5EC",
    blobColor: "#2D6B4A",
    accentColor: "#2D6B4A",
    iconBg: "#E3ECDA",
  },
  {
    label: "المتابعة",
    subtitle: "تابع عبادتك اليومية",
    icon: CalendarCheck,
    path: "/prayer-tracker",
    bgColor: "#F8F0E8",
    blobColor: "#7C5C42",
    accentColor: "#7C5C42",
    iconBg: "#ECDCC8",
  },
  {
    label: "صيدلية روحية",
    subtitle: "علاجات من القرآن والسنة",
    icon: HeartPulse,
    path: "/adhkar",
    bgColor: "#FBF5E8",
    blobColor: "#C4A35A",
    accentColor: "#A08030",
    iconBg: "#F5EBCF",
  },
];

const popularCities = [
  { name: 'القاهرة', lat: 30.0444, lng: 31.2357 },
  { name: 'الرياض', lat: 24.7136, lng: 46.6753 },
  { name: 'جدة', lat: 21.4858, lng: 39.1925 },
  { name: 'دبي', lat: 25.2048, lng: 55.2708 },
  { name: 'الكويت', lat: 29.3759, lng: 47.9774 },
  { name: 'عمّان', lat: 31.9454, lng: 35.9284 },
  { name: 'بيروت', lat: 33.8938, lng: 35.5018 },
  { name: 'الإسكندرية', lat: 31.2001, lng: 29.9187 },
];

export function HomeScreen() {
  const navigate = useNavigate();
  const { isMenuOpen, toggleMenu } = useMenu();
  const [tick, setTick] = useState(0);
  const [hijriDate, setHijriDate] = useState("");
  const [gregorianDate, setGregorianDate] = useState("");

  const [locationStatus, setLocationStatus] = useState<'idle' | 'granted' | 'denied' | 'manual'>('idle');
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string> | null>(null);
  const [savedCity, setSavedCity] = useState<{ name: string, lat?: number, lng?: number } | null>(null);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [cityResults, setCityResults] = useState<any[]>([]);
  const [loadingPrayers, setLoadingPrayers] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>(null);

  const fetchPrayerTimes = (lat: number, lng: number) => {
    setLoadingPrayers(true);
    fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=5`)
      .then((r) => r.json())
      .then((json) => {
        if (json.code === 200) {
          setPrayerTimes(json.data.timings);
          const h = json.data.date.hijri;
          const g = json.data.date.gregorian;
          const dayAr = h.weekday.ar;
          setHijriDate(`${dayAr} ${toArabicNum(h.day)} ${h.month.ar} ${toArabicNum(h.year)}`);
          const months: Record<string, string> = {
            January: "يناير", February: "فبراير", March: "مارس", April: "أبريل",
            May: "مايو", June: "يونيو", July: "يوليو", August: "أغسطس",
            September: "سبتمبر", October: "أكتوبر", November: "نوفمبر", December: "ديسمبر",
          };
          setGregorianDate(`${toArabicNum(g.day)} ${months[g.month.en] || g.month.en} ${toArabicNum(g.year)}`);
        }
      })
      .finally(() => setLoadingPrayers(false));
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userLocation");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lat && parsed.lng) {
          setLocationStatus(parsed.type === 'manual' ? 'manual' : 'granted');
          setSavedCity({ name: parsed.name, lat: parsed.lat, lng: parsed.lng });
          fetchPrayerTimes(parsed.lat, parsed.lng);
        } else {
          setLocationStatus('idle');
        }
      } else {
        setLocationStatus('idle');
      }
    } catch {
      setLocationStatus('idle');
    }

    const tickInterval = setInterval(() => setTick((t) => t + 1), 60 * 1000);
    return () => clearInterval(tickInterval);
  }, []);

  const handleLocationRequest = () => {
    setLoadingPrayers(true);
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      setLoadingPrayers(false);
      setShowLocationSheet(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`)
          .then(r => r.json())
          .then(data => {
            const cityName = data.city || data.locality || "موقعي";
            setLocationStatus('granted');
            setSavedCity({ name: cityName, lat: latitude, lng: longitude });
            localStorage.setItem("userLocation", JSON.stringify({ type: 'gps', lat: latitude, lng: longitude, name: cityName }));
            fetchPrayerTimes(latitude, longitude);
          })
          .catch(() => {
            setLocationStatus('granted');
            setSavedCity({ name: "موقعي", lat: latitude, lng: longitude });
            localStorage.setItem("userLocation", JSON.stringify({ type: 'gps', lat: latitude, lng: longitude, name: "موقعي" }));
            fetchPrayerTimes(latitude, longitude);
          });
      },
      () => {
        setLocationStatus('denied');
        setLoadingPrayers(false);
        setShowLocationSheet(true);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setCityResults([]);
      setSearchLoading(false);
      return;
    }
    
    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=20&language=ar&format=json`
      );
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        // Remove duplicates — keep only one result per city name
        const seen = new Set<string>();
        const filtered = data.results
          .filter((r: any) => {
            const key = r.name?.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .slice(0, 6)
          .map((r: any) => ({
            displayName: r.name,
            name: r.name + (r.country ? `، ${r.country}` : ''),
            lat: r.latitude,
            lng: r.longitude,
          }));
        
        setCityResults(filtered);
      } else {
        setCityResults([]);
      }
    } catch (err) {
      setCityResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectCity = (city: { name: string, lat: number, lng: number }) => {
    setLoadingPrayers(true);
    localStorage.setItem("userLocation", JSON.stringify({ type: 'manual', name: city.name, lat: city.lat, lng: city.lng }));
    setShowLocationSheet(false);
    setSavedCity(city);
    setLocationStatus('manual');
    fetchPrayerTimes(city.lat, city.lng);
  };

  const { prayerList, nextPrayer, countdown } = useMemo(() => {
    void tick;
    if (!prayerTimes) return { prayerList: [] as PrayerTimeEntry[], nextPrayer: null as PrayerTimeEntry | null, countdown: "" };

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let foundNext = false;
    const list: PrayerTimeEntry[] = PRAYER_KEYS.map((p) => {
      const raw = (prayerTimes[p.key] || "00:00").split(" ")[0];
      const [h, m] = raw.split(":").map(Number);
      const totalMin = h * 60 + m;
      const passed = totalMin < nowMinutes;
      const isNext = !foundNext && !passed;
      if (isNext) foundNext = true;
      return { name: p.name, key: p.key, time: formatTimeArabic(raw), icon: p.icon, passed: passed && !isNext, isNext, _raw: raw, _totalMin: totalMin };
    });

    let next = list.find((p) => p.isNext) || null;
    if (!next) {
      list.forEach((p) => { p.passed = true; p.isNext = false; });
      list[0].isNext = true;
      list[0].passed = false;
      next = list[0];
    }

    let cd = "";
    if (next) {
      let diff = (next as any)._totalMin - nowMinutes;
      if (diff <= 0) diff += 24 * 60;
      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;
      cd = hrs > 0 ? `بعد ${toArabicNum(hrs)} س ${toArabicNum(mins)} د` : `بعد ${toArabicNum(mins)} ��`;
    }

    return { prayerList: list, nextPrayer: next, countdown: cd };
  }, [prayerTimes, tick]);

  return (
    <div className="min-h-screen pb-6">
      {/* Integrated Primary Header */}
      <FadeIn delay={0}>
        <div className="bg-primary rounded-b-[2rem]">
          {/* App Bar */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="w-8" />
            <h2 className="text-white font-['Cairo']">بيان</h2>
            <motion.button
              className="p-1.5 rounded-full border-none cursor-pointer"
              style={{ color: "rgba(255, 255, 255, 0.75)", backgroundColor: "transparent" }}
              onClick={toggleMenu}
              whileTap={{ scale: 0.85 }}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ type: "spring", damping: 18, stiffness: 200 }}
              >
                <Menu size={20} />
              </motion.div>
            </motion.button>
          </div>

          {/* Greeting */}
          <div className="px-6 pb-8 text-right relative z-0">
            <p className="text-white/60 text-sm">السلام عليكم</p>
            <h1 className="text-white mt-0.5 font-['Cairo']">مسلم</h1>
            <div className="flex flex-col gap-1 mt-3">
              <div className="flex items-center justify-between text-white/50 text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>{hijriDate}</span>
                </div>
                <span>{gregorianDate}</span>
              </div>
              {(locationStatus === 'granted' || locationStatus === 'manual') && savedCity?.name && (
                <button
                  onClick={() => setShowLocationSheet(true)}
                  className="flex items-center gap-1.5 text-white/70 text-xs font-['Cairo'] mt-1 active:opacity-70 transition-opacity self-start ml-auto"
                >
                  <MapPin size={12} />
                  <span>{savedCity.name}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Prayer Times Card */}
      <FadeIn delay={0.08}>
        <div className="px-4 -mt-6">
          {(locationStatus === 'idle' || locationStatus === 'denied') && !loadingPrayers ? (
            <div className="bg-surface-elevated shadow-sm border border-divider/40 rounded-2xl p-6 text-center relative z-10">
              <div className="text-3xl mb-2">📍</div>
              <p className="font-['Cairo'] font-semibold text-text-primary text-base">
                مواقيت الصلاة
              </p>
              <p className="text-text-secondary text-sm mt-1 font-['Cairo']">
                يرجى تحديد موقعك لعرض مواقيت الصلاة
              </p>
              <button
                onClick={handleLocationRequest}
                className="mt-4 bg-primary text-white font-['Cairo'] rounded-xl px-6 py-2.5 text-sm w-full transition-transform active:scale-[0.98]"
              >
                تحديد الموقع
              </button>
            </div>
          ) : (
            <div className="bg-surface-elevated rounded-2xl p-4 shadow-sm border border-divider/40 relative z-10">
              {loadingPrayers || !prayerTimes ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full skeleton" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-16 skeleton rounded" />
                        <div className="h-4 w-12 skeleton rounded" />
                      </div>
                    </div>
                    <div className="space-y-1.5 flex flex-col items-end">
                      <div className="h-7 w-20 skeleton rounded" />
                      <div className="h-3 w-14 skeleton rounded" />
                    </div>
                  </div>
                  <div className="h-px bg-divider my-3" />
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 py-2">
                        <div className="w-4 h-4 skeleton rounded-full" />
                        <div className="h-2.5 w-8 skeleton rounded" />
                        <div className="h-3 w-10 skeleton rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {(() => { const Icon = nextPrayer?.icon || Sun; return <Icon size={16} className="text-primary" />; })()}
                      </div>
                      <div>
                        <p className="text-text-secondary text-xs">الصلاة القادمة</p>
                        <p className="text-text-primary text-sm" style={{ fontWeight: 600 }}>{nextPrayer?.name || "العصر"}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl text-primary font-['Cairo'] tabular-nums" style={{ fontWeight: 700 }}>
                        {nextPrayer ? formatTimeArabicWithPeriod((nextPrayer as any)._raw) : "..."}
                      </p>
                      <p className="text-text-tertiary text-xs">{countdown}</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-divider my-3" />

                  {/* All Prayer Times */}
                  <div className="grid grid-cols-6 gap-1">
                    {prayerList.map((prayer) => {
                      const Icon = prayer.icon;
                      return (
                        <div
                          key={prayer.name}
                          className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                            prayer.isNext
                              ? "bg-primary/8"
                              : prayer.passed
                                ? "opacity-40"
                                : ""
                          }`}
                        >
                          <Icon
                            size={15}
                            className={prayer.isNext ? "text-primary" : "text-text-tertiary"}
                          />
                          <span className="text-[10px] text-text-secondary">{prayer.name}</span>
                          <span
                            className={`text-[11px] tabular-nums ${
                              prayer.isNext ? "text-primary" : "text-text-primary"
                            }`}
                            style={{ fontWeight: prayer.isNext ? 600 : 400 }}
                          >
                            {prayer.time}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </FadeIn>

      {/* Quick Actions */}
      <FadeIn delay={0.16}>
        <div className="px-4 mt-6">
          <h3 className="text-text-primary mb-3 font-['Cairo']">وصول سريع</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* First row: 2 cards */}
            {quickCardData.slice(0, 2).map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.label}
                  onClick={() => navigate(card.path)}
                  className="relative overflow-hidden rounded-[20px] p-0 border-none cursor-pointer text-right transition-transform active:scale-[0.97]"
                  style={{ backgroundColor: card.bgColor, boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 1.5px 6px rgba(0,0,0,0.04)" }}
                >
                  {/* Blob decoration */}
                  <CardBlob color={card.blobColor} />

                  {/* Content */}
                  <div className="relative z-10 p-4 pb-5 flex flex-col h-[150px] justify-between">
                    <p
                      className="font-['Cairo'] text-sm"
                      style={{ color: card.accentColor, fontWeight: 700 }}
                    >
                      {card.label}
                    </p>

                    <div className="flex justify-start mt-auto">
                      <CardIllustration
                        icon={Icon}
                        accentColor={card.accentColor}
                        bgColor={card.iconBg}
                      />
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Second row: 1 card full width */}
            {(() => {
              const card = quickCardData[2];
              const Icon = card.icon;
              return (
                <button
                  key={card.label}
                  onClick={() => navigate(card.path)}
                  className="relative col-span-2 overflow-hidden rounded-[20px] p-0 border-none cursor-pointer text-right transition-transform active:scale-[0.97]"
                  style={{ backgroundColor: card.bgColor, boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 1.5px 6px rgba(0,0,0,0.04)" }}
                >
                  {/* Blob decoration */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 345 120"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 120C0 120 40 70 120 75C200 80 260 40 310 55C360 70 345 120 345 120H0Z"
                      fill={card.blobColor}
                      fillOpacity={0.07}
                    />
                  </svg>

                  {/* Content */}
                  <div className="relative z-10 p-4 flex items-center justify-between h-[110px]">
                    <div className="flex flex-col gap-1">
                      <p
                        className="font-['Cairo'] text-sm"
                        style={{ color: card.accentColor, fontWeight: 700 }}
                      >
                        {card.label}
                      </p>
                      <p
                        className="font-['Cairo'] text-xs"
                        style={{ color: `${card.accentColor}99` }}
                      >
                        {card.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <CardIllustration
                        icon={Icon}
                        accentColor={card.accentColor}
                        bgColor={card.iconBg}
                      />
                    </div>
                  </div>
                </button>
              );
            })()}
          </div>
        </div>
      </FadeIn>

      {/* Daily Dhikr Card */}
      <FadeIn delay={0.24}>
        <div className="px-4 mt-6">
          <div className="bg-secondary rounded-2xl p-5">
            <p className="text-text-primary text-right leading-relaxed font-['Amiri'] text-lg" style={{ lineHeight: '2.1' }}>
              «اللهم صلّ وسلم على سيدنا محمد صلاة تهب لنا بها أكمل المراد وفوق المراد، في دار الدنيا ودار المعاد، وعلى آله وصحبه وبارك وسلم عدد ما علمت وزنة ما علمت وملء ما علمت»
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Location Search Bottom Sheet */}
      <AnimatePresence>
        {showLocationSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-[60]"
              onClick={() => setShowLocationSheet(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-background rounded-t-3xl max-h-[80vh] flex flex-col"
            >
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="w-12 h-1.5 bg-divider rounded-full mx-auto mb-4" />
                <div className="relative mb-6 mt-1">
                  <button onClick={() => setShowLocationSheet(false)} className="absolute right-0 top-0 p-1 text-text-tertiary">
                    <X size={20} />
                  </button>
                  <h2 className="font-['Cairo'] font-bold text-text-primary text-lg text-center mt-2">
                    اختر مدينتك
                  </h2>
                  <p className="text-text-tertiary text-sm text-center mt-1 font-['Cairo']">
                    ابحث باللغة العربية أو الإنجليزية
                  </p>
                </div>

                <div className="relative mb-6">
                  <input
                    placeholder="مثال: القاهرة أو Cairo"
                    value={citySearch}
                    onChange={(e) => {
                      setCitySearch(e.target.value);
                      if (searchTimeout.current) clearTimeout(searchTimeout.current);
                      searchTimeout.current = setTimeout(() => {
                        searchCities(e.target.value);
                      }, 400);
                    }}
                    className="w-full bg-secondary rounded-xl pl-10 pr-10 py-3 text-right font-['Cairo'] outline-none border border-divider/40 focus:border-primary/50 transition-colors"
                    dir="rtl"
                    autoFocus
                  />
                  <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {searchLoading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                  </div>
                </div>

                {citySearch.length < 2 && (
                  <div className="mb-4">
                    <p className="text-sm font-['Cairo'] text-text-secondary mb-3 text-right">المدن الشائعة</p>
                    <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
                      {popularCities.map(city => (
                        <button
                          key={city.name}
                          onClick={() => selectCity(city)}
                          className="bg-secondary border border-divider rounded-full px-4 py-1.5 text-sm font-['Cairo'] text-text-primary transition-colors active:bg-divider"
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {citySearch.length >= 2 && (
                  <div className="flex flex-col">
                    {cityResults.length > 0 ? (
                      cityResults.map((result, i) => (
                        <button
                          key={i}
                          onClick={() => selectCity(result)}
                          className="w-full text-right px-2 py-3 border-b border-divider/40 active:bg-secondary"
                        >
                          <p className="font-['Cairo'] font-semibold text-text-primary text-sm">
                            {result.displayName}
                          </p>
                          <p className="font-['Cairo'] text-text-tertiary text-xs mt-0.5">
                            {result.name}
                          </p>
                        </button>
                      ))
                    ) : (
                      <p className="text-center text-text-tertiary text-sm py-8 font-['Cairo']">
                        لا توجد نتائج، جرب اسماً آخر
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}