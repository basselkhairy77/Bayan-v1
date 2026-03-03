import { useState, useCallback } from "react";
import { AppBar } from "../AppBar";
import { RotateCcw, Save, TreePine } from "lucide-react";
import { FadeIn } from "../ui/FadeIn";

const toArabicNum = (n: number): string => {
  return n.toString().replace(/\d/g, (d) => '٠٢٣٤٥٦٧٨٩'[parseInt(d)]);
};

const tasbeehOptions = [
  { id: "subhanallah", text: "سُبْحَانَ ٱللَّهِ", label: "سبحان الله" },
  { id: "alhamdulillah", text: "ٱلْحَمْدُ لِلَّهِ", label: "الحمد لله" },
  { id: "allahuakbar", text: "ٱللَّهُ أَكْبَرُ", label: "الله أكبر" },
  { id: "lailaha", text: "لَا إِلَـٰهَ إِلَّا ٱللَّهُ", label: "لا إله إلا الله" },
  { id: "hawqala", text: "لَا حَوْلَ وَا لَا قُوَّةَ إِلَّا بِٱللَّهِ", label: "لا حول ولا قوة إلا بالله" },
];

export function TasbeehScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [trees, setTrees] = useState(0);

  const selected = tasbeehOptions[selectedIndex];

  const handleTap = useCallback(() => {
    setCount((prev) => {
      const newCount = prev + 1;
      setTotalCount((t) => t + 1);
      if (newCount > 0 && newCount % 100 === 0) {
        setTrees((t) => t + 1);
      }
      return newCount;
    });
  }, []);

  const handleReset = () => {
    setCount(0);
  };

  const progressPercent = Math.min((count % 33) / 33 * 100, 100);
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="min-h-screen flex flex-col">
      <FadeIn delay={0} y={0}>
        <AppBar title="التسبيح" showBack showMenu />
      </FadeIn>

      {/* Tasbeeh Options */}
      <FadeIn delay={0.06}>
        <div className="px-4 py-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tasbeehOptions.map((option, i) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedIndex(i);
                  setCount(0);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all ${
                  i === selectedIndex
                    ? "bg-primary text-white"
                    : "bg-secondary text-text-secondary border border-divider"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Selected Dhikr Text */}
      <FadeIn delay={0.12}>
        <div className="px-6 py-2 text-center">
          <p className="text-text-primary font-['Amiri'] text-2xl" style={{ lineHeight: '2' }}>
            {selected.text}
          </p>
        </div>
      </FadeIn>

      {/* Counter Circle */}
      <FadeIn delay={0.18}>
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <button
            onClick={handleTap}
            className="relative w-64 h-64 rounded-full flex items-center justify-center transition-transform active:scale-[0.97] focus:outline-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {/* Background ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 260 260">
              <circle
                cx="130"
                cy="130"
                r="120"
                fill="none"
                stroke="#E8DFD1"
                strokeWidth="6"
              />
              <circle
                cx="130"
                cy="130"
                r="120"
                fill="none"
                stroke="#7C5C42"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            </svg>

            {/* Inner circle */}
            <div className="w-52 h-52 rounded-full bg-surface-elevated shadow-sm flex flex-col items-center justify-center border border-divider/30">
              <span className="text-5xl text-text-primary font-['Cairo'] tabular-nums" style={{ fontWeight: 700 }}>
                {toArabicNum(count)}
              </span>
              <span className="text-text-secondary text-sm mt-2">تسبيح</span>
            </div>
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleReset}
              className="w-12 h-12 rounded-full bg-secondary border border-divider flex items-center justify-center text-text-secondary transition-transform active:scale-90"
            >
              <RotateCcw size={20} />
            </button>
            <button className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white transition-transform active:scale-90">
              <Save size={20} />
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Trees Card */}
      <FadeIn delay={0.26}>
        <div className="px-4 mb-4">
          <div className="bg-accent-green rounded-2xl p-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl text-white font-['Cairo']" style={{ fontWeight: 700 }}>
                {toArabicNum(trees)} شجرة في الجنة
              </span>
              <TreePine size={24} className="text-white/80" />
            </div>
            <p className="text-white/60 text-sm mt-1">إن شاء الله</p>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.32}>
        <div className="px-4 pb-6 text-center">
          <p className="text-text-secondary text-sm">
            {toArabicNum(100 - (count % 100))} تسبيح متبقي لزراعة نخلة جديدة
          </p>
          <p className="text-text-tertiary text-sm mt-1">
            إجمالي التسبيحات {toArabicNum(totalCount)}
          </p>
        </div>
      </FadeIn>
    </div>
  );
}