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

const prayerTimes = [
  { name: "الفجر", time: "٤:٥٨", icon: Star, passed: true },
  { name: "الشروق", time: "٦:١٧", icon: Sunrise, passed: true },
  { name: "الظهر", time: "١٢:٠٩", icon: Sun, passed: true },
  { name: "العصر", time: "٣:٢٤", icon: Sun, passed: false, isNext: true },
  { name: "المغرب", time: "٥:٥٠", icon: Sunset, passed: false },
  { name: "العشاء", time: "٧:١٢", icon: CloudMoon, passed: false },
];

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
      {/* Decorative circles behind icon */}
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
                <span>الإثنين ٦ رمضان ١٤٤٧</span>
              </div>
              <span>٢٣ فبراير ٢٠٢٦</span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Prayer Times Card */}
      <FadeIn delay={0.08}>
        <div className="px-4 -mt-6">
          <div className="bg-surface-elevated rounded-2xl p-4 shadow-sm border border-divider/40">
            {/* Current/Next Prayer */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sun size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs">الصلاة القادمة</p>
                  <p className="text-text-primary text-sm" style={{ fontWeight: 600 }}>العصر</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-2xl text-primary font-['Cairo'] tabular-nums" style={{ fontWeight: 700 }}>
                  ٣:٢٤ م
                </p>
                <p className="text-text-tertiary text-xs">بعد ٢ س ٣ د</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-divider my-3" />

            {/* All Prayer Times */}
            <div className="grid grid-cols-6 gap-1">
              {prayerTimes.map((prayer) => {
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