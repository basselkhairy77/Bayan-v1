import { useState, useEffect, useCallback } from "react";
import { AppBar } from "../AppBar";
import { FadeIn } from "../ui/FadeIn";
import { Check, Flame } from "lucide-react";

interface SunnahItem {
  id: number;
  name: string;
  category: string;
}

const sunnahList: SunnahItem[] = [
  // صلاة (16)
  { id: 1, name: "صلاة الضحى", category: "صلاة" },
  { id: 2, name: "صلاة الوتر", category: "صلاة" },
  { id: 3, name: "قيام الليل", category: "صلاة" },
  { id: 4, name: "ركعتين بعد الوضوء", category: "صلاة" },
  { id: 5, name: "السنن الرواتب", category: "صلاة" },
  { id: 6, name: "تحية المسجد", category: "صلاة" },
  { id: 40, name: "صلاة الاستخارة", category: "صلاة" },
  { id: 41, name: "صلاة التوبة", category: "صلاة" },
  { id: 42, name: "صلاة الحاجة", category: "صلاة" },
  { id: 43, name: "الصلاة في الصف الأول", category: "صلاة" },
  { id: 44, name: "التبكير إلى المسجد", category: "صلاة" },
  { id: 45, name: "صلاة التراويح", category: "صلاة" },
  { id: 46, name: "صلاة الكسوف والخسوف", category: "صلاة" },
  { id: 47, name: "الدعاء بين الأذان والإقامة", category: "صلاة" },
  { id: 48, name: "صلاة ركعتين قبل الفجر", category: "صلاة" },
  { id: 49, name: "الذهاب للمسجد ماشياً", category: "صلاة" },
  // صيام (14)
  { id: 7, name: "صيام الاثنين والخميس", category: "صيام" },
  { id: 8, name: "صيام ثلاثة أيام من كل شهر", category: "صيام" },
  { id: 9, name: "صيام ست من شوال", category: "صيام" },
  { id: 10, name: "صيام يوم عاشوراء", category: "صيام" },
  { id: 11, name: "تأخير السحور", category: "صيام" },
  { id: 12, name: "تعجيل الإفطار", category: "صيام" },
  { id: 50, name: "صيام يوم عرفة", category: "صيام" },
  { id: 51, name: "الإفطار على تمر", category: "صيام" },
  { id: 52, name: "دعاء الإفطار", category: "صيام" },
  { id: 53, name: "تفطير صائم", category: "صيام" },
  { id: 54, name: "صيام شعبان", category: "صيام" },
  { id: 55, name: "صيام المحرم", category: "صيام" },
  { id: 56, name: "السحور بالتمر واللبن", category: "صيام" },
  { id: 57, name: "صيام الأيام البيض", category: "صيام" },
  // ذكر (16)
  { id: 13, name: "أذكار الصباح", category: "ذكر" },
  { id: 14, name: "أذكار المساء", category: "ذكر" },
  { id: 15, name: "الاستغفار مئة مرة", category: "ذكر" },
  { id: 16, name: "الصلاة على النبي ﷺ", category: "ذكر" },
  { id: 17, name: "سبحان الله وبحمده مئة مرة", category: "ذكر" },
  { id: 18, name: "لا إله إلا الله مئة مرة", category: "ذكر" },
  { id: 58, name: "أذكار بعد الصلاة", category: "ذكر" },
  { id: 59, name: "أذكار النوم", category: "ذكر" },
  { id: 60, name: "أذكار الاستيقاظ", category: "ذكر" },
  { id: 61, name: "الحوقلة عند المصيبة", category: "ذكر" },
  { id: 62, name: "البسملة قبل كل عمل", category: "ذكر" },
  { id: 63, name: "الحمد بعد الطعام", category: "ذكر" },
  { id: 64, name: "دعاء دخول المسجد والخروج", category: "ذكر" },
  { id: 65, name: "التسبيح والتحميد والتكبير ٣٣", category: "ذكر" },
  { id: 66, name: "دعاء الركوب والسفر", category: "ذكر" },
  { id: 67, name: "لا حول ولا قوة إلا بالله", category: "ذكر" },
  // قرآن (14)
  { id: 19, name: "قراءة حزب يومي", category: "قرآن" },
  { id: 20, name: "سورة الكهف يوم الجمعة", category: "قرآن" },
  { id: 21, name: "آية الكرسي بعد كل صلاة", category: "قرآن" },
  { id: 22, name: "سورة الملك قبل النوم", category: "قرآن" },
  { id: 23, name: "سورة البقرة أسبوعياً", category: "قرآن" },
  { id: 68, name: "قراءة سورة يس", category: "قرآن" },
  { id: 69, name: "المعوذتين قبل النوم", category: "قرآن" },
  { id: 70, name: "سورة الواقعة يومياً", category: "قرآن" },
  { id: 71, name: "قراءة سورة الرحمن", category: "قرآن" },
  { id: 72, name: "خواتيم سورة البقرة", category: "قرآن" },
  { id: 73, name: "سورة الدخان ليلة الجمعة", category: "قرآن" },
  { id: 74, name: "تدبر آية يومياً", category: "قرآن" },
  { id: 75, name: "سورة الإخلاص ٣ مرات", category: "قرآن" },
  { id: 76, name: "حفظ آية جديدة أسبوعياً", category: "قرآن" },
  // أخلاق (15)
  { id: 24, name: "السواك", category: "أخلاق" },
  { id: 25, name: "صلة الرحم", category: "أخلاق" },
  { id: 26, name: "إفشاء السلام", category: "أخلاق" },
  { id: 27, name: "إطعام الطعام", category: "أخلاق" },
  { id: 28, name: "زيارة المريض", category: "أخلاق" },
  { id: 29, name: "النوم على وضوء", category: "أخلاق" },
  { id: 77, name: "كظم الغيظ", category: "أخلاق" },
  { id: 78, name: "الابتسامة في وجه أخيك", category: "أخلاق" },
  { id: 79, name: "إماطة الأذى عن الطريق", category: "أخلاق" },
  { id: 80, name: "الكلمة الطيبة", category: "أخلاق" },
  { id: 81, name: "إحسان الظن بالناس", category: "أخلاق" },
  { id: 82, name: "الصدقة ولو بالقليل", category: "أخلاق" },
  { id: 83, name: "ستر المسلم", category: "أخلاق" },
  { id: 84, name: "عيادة المريض والدعاء له", category: "أخلاق" },
  { id: 85, name: "إكرام الضيف", category: "أخلاق" },
  // آداب (15)
  { id: 30, name: "آداب الطعام والشراب", category: "آداب" },
  { id: 31, name: "آداب النوم والاستيقاظ", category: "آداب" },
  { id: 32, name: "آداب دخول المنزل والخروج", category: "آداب" },
  { id: 33, name: "آداب دخول الخلاء", category: "آداب" },
  { id: 34, name: "آداب السلام والمصافحة", category: "آداب" },
  { id: 35, name: "آداب المجلس", category: "آداب" },
  { id: 36, name: "آداب الاستئذان", category: "آداب" },
  { id: 37, name: "آداب النظر وغض البصر", category: "آداب" },
  { id: 38, name: "آداب اللباس والتجمل", category: "آداب" },
  { id: 39, name: "آداب الزيارة", category: "آداب" },
  { id: 86, name: "الأكل باليمين", category: "آداب" },
  { id: 87, name: "الشرب على ثلاث دفعات", category: "آداب" },
  { id: 88, name: "النوم على الجانب الأيمن", category: "آداب" },
  { id: 89, name: "آداب العطاس والتثاؤب", category: "آداب" },
  { id: 90, name: "آداب المشي والطريق", category: "آداب" },
  // دعاء (10)
  { id: 91, name: "دعاء الاستفتاح", category: "دعاء" },
  { id: 92, name: "دعاء لبس الثوب الجديد", category: "دعاء" },
  { id: 93, name: "دعاء نزول المطر", category: "دعاء" },
  { id: 94, name: "دعاء الخروج من المنزل", category: "دعاء" },
  { id: 95, name: "دعاء دخول السوق", category: "دعاء" },
  { id: 96, name: "دعاء ختم القرآن", category: "دعاء" },
  { id: 97, name: "دعاء رؤية الهلال", category: "دعاء" },
  { id: 98, name: "الدعاء للمسلمين بظهر الغيب", category: "دعاء" },
  { id: 99, name: "دعاء الريح والعواصف", category: "دعاء" },
  { id: 100, name: "الدعاء في السجود", category: "دعاء" },
];

const categories = ["الكل", "صلاة", "صيام", "ذكر", "قرآن", "أخلاق", "آداب", "دعاء"];

const TODAY_KEY = "sunnahToday";
const STREAKS_KEY = "sunnahStreaks2";

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

interface StreakData {
  streak: number;
  lastDate: string;
}

function loadToday(): number[] {
  try {
    const raw = localStorage.getItem(TODAY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (parsed.date !== getTodayStr()) return [];
    return parsed.ids || [];
  } catch {
    return [];
  }
}

function saveToday(ids: number[]) {
  localStorage.setItem(TODAY_KEY, JSON.stringify({ date: getTodayStr(), ids }));
}

function loadStreaks(): Record<number, StreakData> {
  try {
    const raw = localStorage.getItem(STREAKS_KEY);
    if (!raw) return {};
    const data: Record<number, StreakData> = JSON.parse(raw);
    const today = getTodayStr();
    const yesterday = getYesterdayStr();
    // Reset streaks for items not done today or yesterday
    const cleaned: Record<number, StreakData> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v.lastDate === today || v.lastDate === yesterday) {
        cleaned[Number(k)] = v;
      }
      // else streak is broken, don't carry it over
    }
    return cleaned;
  } catch {
    return {};
  }
}

function saveStreaks(s: Record<number, StreakData>) {
  localStorage.setItem(STREAKS_KEY, JSON.stringify(s));
}

export function SunnahTrackerScreen() {
  const [completedToday, setCompletedToday] = useState<number[]>(loadToday);
  const [streaks, setStreaks] = useState<Record<number, StreakData>>(loadStreaks);
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  useEffect(() => { saveToday(completedToday); }, [completedToday]);
  useEffect(() => { saveStreaks(streaks); }, [streaks]);

  const toggleSunnah = useCallback((id: number) => {
    const today = getTodayStr();
    setCompletedToday(prev => {
      if (prev.includes(id)) {
        // uncheck — revert today's streak increment
        setStreaks(s => {
          const entry = s[id];
          if (!entry || entry.lastDate !== today) return s;
          const newStreak = entry.streak - 1;
          if (newStreak <= 0) {
            const n = { ...s };
            delete n[id];
            return n;
          }
          return { ...s, [id]: { streak: newStreak, lastDate: getYesterdayStr() } };
        });
        return prev.filter(x => x !== id);
      } else {
        // check — increment streak
        setStreaks(s => {
          const entry = s[id];
          const prevStreak = entry ? entry.streak : 0;
          return { ...s, [id]: { streak: prevStreak + 1, lastDate: today } };
        });
        return [...prev, id];
      }
    });
  }, []);

  const completedCount = completedToday.length;
  const total = sunnahList.length;
  const progress = Math.round((completedCount / total) * 100);
  const maxStreak = Object.values(streaks).reduce((a, b) => Math.max(a, b.streak), 0);

  const filtered = selectedCategory === "الكل"
    ? sunnahList
    : sunnahList.filter(s => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-surface-warm flex flex-col">
      <AppBar title="سنن العبادات" showBack backDirection="left" />

      <div className="flex-1 overflow-y-auto">
        {/* Progress Card */}
        <FadeIn delay={0} y={10}>
          <div className="mx-4 mt-4 bg-primary rounded-2xl p-4">
            <p className="text-white font-['Cairo'] text-right mb-3">
              تابع سننك اليومية ⭐
            </p>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: "#fff" }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                {completedCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-['Cairo']" style={{ backgroundColor: "rgba(72,187,120,0.25)", color: "#68D391" }}>
                    نشط اليوم ✓
                  </span>
                )}
                {maxStreak > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-['Cairo']" style={{ backgroundColor: "rgba(237,137,54,0.25)", color: "#F6AD55" }}>
                    أيام متتالية 🔥
                  </span>
                )}
              </div>
              <span className="text-white/80 text-sm font-['Cairo']">
                {completedCount}/{total}
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Category Filter */}
        <FadeIn delay={0.05} y={8}>
          <div className="mt-4 px-4 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: "none" }}>
            <div className="flex gap-2 w-max" dir="rtl">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-['Cairo'] whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-white"
                      : "border border-divider text-text-secondary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Sunnah List */}
        <div className="px-4 mt-4 pb-6">
          <FadeIn delay={0.1} y={10}>
            <div className="bg-background rounded-xl overflow-hidden">
              {filtered.map((item, idx) => {
                const checked = completedToday.includes(item.id);
                const streak = streaks[item.id]?.streak || 0;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      checked ? "bg-secondary/30" : ""
                    } ${idx < filtered.length - 1 ? "border-b border-divider/60" : ""}`}
                    onClick={() => toggleSunnah(item.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        checked ? "bg-primary border-primary" : "border-divider"
                      }`}
                    >
                      {checked && <Check size={14} color="#fff" strokeWidth={3} />}
                    </div>

                    {/* Name + category */}
                    <div className="flex-1 text-right min-w-0">
                      <p
                        className={`font-['Cairo'] text-sm ${
                          checked ? "line-through opacity-60 text-text-secondary" : "text-text-primary"
                        }`}
                      >
                        {item.name}
                      </p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full inline-block mt-0.5"
                        style={{ backgroundColor: "rgba(107,142,35,0.1)", color: "var(--accent-green)" }}
                      >
                        {item.category}
                      </span>
                    </div>

                    {/* Streak circle */}
                    <div className="w-11 h-11 rounded-full flex flex-col items-center justify-center shrink-0"
                      style={{ backgroundColor: streak > 0 ? "rgba(237,137,54,0.15)" : "var(--secondary)" }}>
                      <Flame size={14} style={{ color: streak > 0 ? "#ED8936" : "var(--text-tertiary)" }} />
                      <span className="text-xs font-['Cairo'] leading-none mt-0.5"
                        style={{ color: streak > 0 ? "#ED8936" : "var(--text-secondary)" }}>
                        {streak}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}