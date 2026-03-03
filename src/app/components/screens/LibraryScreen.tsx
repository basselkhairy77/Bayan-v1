import { useNavigate } from "react-router";
import { AppBar } from "../AppBar";
import {
  BookOpen,
  Video,
  Radio,
  HelpCircle,
  BookMarked,
  Hand,
  ChevronLeft,
  GraduationCap,
  Star,
  Moon,
  MapPin,
  Users,
} from "lucide-react";
import { FadeIn } from "../ui/FadeIn";

const mediaCategories = [
  { label: "دروس", icon: GraduationCap, color: "text-accent-green" },
  { label: "فيديوهات", icon: Video, color: "text-[#E04040]" },
  { label: "بث مباشر", icon: Radio, color: "text-[#E04040]" },
];

const toolItems = [
  { label: "فتوى", icon: HelpCircle, color: "bg-accent-green/10 text-accent-green" },
  { label: "أحاديث", icon: BookMarked, color: "bg-primary/10 text-primary", path: "/hadith" },
  { label: "تسبيح", icon: Hand, color: "bg-[#7B5EA7]/10 text-[#7B5EA7]", path: "/tasbeeh" },
];

const extraFeatures = [
  { label: "اختبار يومي", icon: Star, color: "bg-accent-gold/10 text-accent-gold" },
  { label: "رمضان كريم", icon: Moon, color: "bg-accent-green/10 text-accent-green" },
  { label: "دليل الحج والعمرة", icon: MapPin, color: "bg-primary/10 text-primary" },
  { label: "وضع العائلة", icon: Users, color: "bg-primary-light/10 text-primary-light" },
];

export function LibraryScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <FadeIn delay={0}>
        <AppBar title="المكتبة الدينية" showMenu />
      </FadeIn>

      {/* Hero Section */}
      <FadeIn delay={0.06}>
        <div className="px-4 py-3">
          <div className="bg-primary rounded-2xl p-5">
            <h2 className="text-white font-['Cairo'] text-center">اكتشف المعرفة</h2>
            <div className="mt-4 bg-white/10 rounded-xl p-4 flex items-center gap-3 justify-end">
              <div className="text-right">
                <h4 className="text-white font-['Cairo']">قصص الأنبياء</h4>
                <p className="text-white/60 text-sm mt-0.5">اكتشف الأنبياء</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Media Categories */}
      <FadeIn delay={0.12}>
        <div className="px-4 py-2">
          <h3 className="text-text-primary mb-3 font-['Cairo']">وسائط متعددة</h3>
          <div className="flex gap-3">
            {mediaCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  className="flex-1 bg-surface-elevated rounded-xl p-3 flex flex-col items-center gap-2 border border-divider/50 transition-transform active:scale-[0.97]"
                >
                  <Icon size={24} className={cat.color} />
                  <span className="text-sm text-text-primary" style={{ fontWeight: 500 }}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* Tools & References */}
      <FadeIn delay={0.18}>
        <div className="px-4 py-3">
          <h3 className="text-text-primary mb-3 font-['Cairo']">أدوات ومراجع</h3>
          <div className="space-y-2">
            {toolItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => item.path && navigate(item.path)}
                  className="w-full flex items-center justify-between py-3 px-4 bg-surface-elevated rounded-xl border border-divider/50 transition-colors active:bg-secondary/50"
                >
                  <ChevronLeft size={18} className="text-text-tertiary" />
                  <div className="flex items-center gap-3">
                    <span className="text-text-primary" style={{ fontWeight: 500 }}>{item.label}</span>
                    <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center`}>
                      <Icon size={18} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* Extra Features */}
      <FadeIn delay={0.24}>
        <div className="px-4 py-3 pb-6">
          <h3 className="text-text-primary mb-3 font-['Cairo']">ميزات إضافية</h3>
          <div className="space-y-2">
            {extraFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between py-3 px-4 bg-surface-elevated rounded-xl border border-divider/50 transition-colors active:bg-secondary/50"
                >
                  <ChevronLeft size={18} className="text-text-tertiary" />
                  <div className="flex items-center gap-3">
                    <span className="text-text-primary" style={{ fontWeight: 500 }}>{item.label}</span>
                    <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center`}>
                      <Icon size={18} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}