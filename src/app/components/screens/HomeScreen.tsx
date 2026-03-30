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
} from "lucide-react";
import { motion } from "motion/react";
import { FadeIn } from "../ui/FadeIn";
import { useMenu } from "../ui/MenuContext";
import { useState, useEffect, useMemo } from "react";

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

/* Decorative blob SVG for card backgrounds */
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

/* Illustrated icon component for cards */
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
    path: "/quran",
    bgColor: "#F2F5EC",
    blobColor: "#2D6B4A",
    accentColor: "#2D6B4A",
    iconBg: "#E3ECDA",
  },
  {
    label: "المتابعة",
    subtitle: "تابع عبادتك اليومية",
    icon: CalendarCheck,
    path: "/tasbeeh",
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

export function HomeScreen() {
  const navigate = useNavigate();
  const { isMenuOpen, toggleMenu } = useMenu();
  const [timings, setTimings] = useState<Record<string, string> | null>(null);
  const [tick, setTick] = useState(0);
  const [hijriDate, setHijriDate] = useState("");
  const [gregorianDate, setGregorianDate] = useState("");

  useEffect(() => {
    const fetchTimings = () => {
      fetch("https://api.aladhan.com/v1/timingsByCity?city=cairo&country=egypt")
        .then((r) => r.json())
        .then((json) => {
          if (json.code === 200) {
            setTimings(json.data.timings);
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
        .catch(() => {});
    };
    fetchTimings();
    const apiInterval = setInterval(fetchTimings, 5 * 60 * 1000);
    const tickInterval = setInterval(() => setTick((t) => t + 1), 60 * 1000);
    return () => { clearInterval(apiInterval); clearInterval(tickInterval); };
  }, []);

  const { prayerList, nextPrayer, countdown } = useMemo(() => {
    void tick; // dependency to recalc every minute
    if (!timings) return { prayerList: [] as PrayerTimeEntry[], nextPrayer: null as PrayerTimeEntry | null, countdown: "" };

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let foundNext = false;
    const list: PrayerTimeEntry[] = PRAYER_KEYS.map((p) => {
      const raw = (timings[p.key] || "00:00").split(" ")[0];
      const [h, m] = raw.split(":").map(Number);
      const totalMin = h * 60 + m;
      const passed = totalMin <= nowMinutes;
      const isNext = !foundNext && !passed;
      if (isNext) foundNext = true;
      return { name: p.name, key: p.key, time: formatTimeArabic(raw), icon: p.icon, passed: passed && !isNext, isNext, _raw: raw, _totalMin: totalMin };
    });

    const next = list.find((p) => p.isNext) || null;
    let cd = "";
    if (next) {
      const diff = (next as any)._totalMin - nowMinutes;
      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;
      cd = hrs > 0 ? `بعد ${toArabicNum(hrs)} س ${toArabicNum(mins)} د` : `بعد ${toArabicNum(mins)} د`;
    }

    return { prayerList: list, nextPrayer: next, countdown: cd };
  }, [timings, tick]);

  return (
    <div className="min-h-screen">
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
          <div className="px-6 pb-8">
            <p className="text-white/60 text-sm text-right">السلام عليكم</p>
            <h1 className="text-white mt-0.5 text-right font-['Cairo']">مسلم</h1>
            <div className="flex items-center justify-between mt-3 text-white/50 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>{hijriDate}</span>
              </div>
              <span>{gregorianDate}</span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Prayer Times Card */}
      <FadeIn delay={0.08}>
        <div className="px-4 -mt-6">
          <div className="bg-surface-elevated rounded-2xl p-4 shadow-sm border border-divider/40">
            {/* Current/Next Prayer */}
            {!timings ? (
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-16 bg-secondary rounded" />
                      <div className="h-4 w-12 bg-secondary rounded" />
                    </div>
                  </div>
                  <div className="space-y-1.5 flex flex-col items-end">
                    <div className="h-7 w-20 bg-secondary rounded" />
                    <div className="h-3 w-14 bg-secondary rounded" />
                  </div>
                </div>
                <div className="h-px bg-divider my-3" />
                <div className="grid grid-cols-6 gap-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 py-2">
                      <div className="w-4 h-4 bg-secondary rounded-full" />
                      <div className="h-2.5 w-8 bg-secondary rounded" />
                      <div className="h-3 w-10 bg-secondary rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
            <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sun size={16} className="text-primary" />
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
                  style={{ backgroundColor: card.bgColor }}
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
                  style={{ backgroundColor: card.bgColor }}
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
        <div className="px-4 mt-6 mb-6">
          <div className="bg-secondary rounded-2xl p-5">
            <p className="text-text-primary text-right leading-relaxed font-['Amiri'] text-lg" style={{ lineHeight: '2.1' }}>
              «اللهم صلّ وسلم على سيدنا محمد صلاة تهب لنا بها أكمل المراد وفوق المراد، في دار الدنيا ودار المعاد، وعلى آله وصحبه وبارك وسلم عدد ما علمت وزنة ما علمت وملء ما علمت»
            </p>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}