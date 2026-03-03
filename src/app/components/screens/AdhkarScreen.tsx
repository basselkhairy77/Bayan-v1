import { useNavigate } from "react-router";
import { AppBar } from "../AppBar";
import { Sun, Moon, Landmark, BedDouble, Heart, HandHelping } from "lucide-react";
import { FadeIn } from "../ui/FadeIn";

const categories = [
  {
    id: "morning",
    name: "الصباح",
    icon: Sun,
    color: "bg-[#C4A35A]",
    count: 27,
  },
  {
    id: "evening",
    name: "المساء",
    icon: Moon,
    color: "bg-primary",
    count: 25,
  },
  {
    id: "mosque",
    name: "المسجد",
    icon: Landmark,
    color: "bg-accent-green",
    count: 8,
  },
  {
    id: "sleep",
    name: "النوم",
    icon: BedDouble,
    color: "bg-primary-light",
    count: 15,
  },
  {
    id: "prayer",
    name: "الصلاة",
    icon: Heart,
    color: "bg-[#8B6B4A]",
    count: 12,
  },
  {
    id: "general",
    name: "أذكار عامة",
    icon: HandHelping,
    color: "bg-accent-olive",
    count: 20,
  },
];

export function AdhkarScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <FadeIn delay={0}>
        <AppBar title="أذكار" showMenu />
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <FadeIn key={cat.id} delay={0.1 + i * 0.06} y={16}>
                  <button
                    onClick={() => navigate(`/adhkar/${cat.id}`)}
                    className={`${cat.color} rounded-2xl p-5 flex flex-col items-center gap-3 transition-transform active:scale-[0.97] aspect-square justify-center w-full`}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Icon size={24} className="text-white" />
                    </div>
                    <span className="text-white font-['Cairo']" style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                      {cat.name}
                    </span>
                    <span className="text-white/60 text-sm">
                      {cat.count} ذكر
                    </span>
                  </button>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}