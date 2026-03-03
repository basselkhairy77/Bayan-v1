import { useParams, useNavigate } from "react-router";
import { ArrowRight, Menu as MenuIcon, Copy, Check, RotateCcw } from "lucide-react";
import { useState } from "react";
import { FadeIn } from "../ui/FadeIn";
import { useMenu } from "../ui/MenuContext";

const toArabicNum = (n: number): string => {
  return n.toString().replace(/\d/g, (d) => '٠٢٣٤٥٦٧٨٩'[parseInt(d)]);
};

const adhkarData: Record<string, { title: string; items: { text: string; count: number }[] }> = {
  morning: {
    title: "الصباح",
    items: [
      {
        text: "«اللَّه لا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ العَظِيم».",
        count: 1,
      },
      {
        text: "«قُلْ هُوَ ٱللَّهُ أَحَدٌ، ٱللَّهُ ٱلصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ».",
        count: 3,
      },
      {
        text: "«قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ ٱلنَّفَّثَتِ فِى ٱلْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ».",
        count: 3,
      },
      {
        text: "«قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ، مَلِكِ ٱلنَّاسِ، إِلَـٰهِ ٱلنَّاسِ، مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ، ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ، مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ».",
        count: 3,
      },
      {
        text: "«أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير».",
        count: 1,
      },
      {
        text: "«اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور».",
        count: 1,
      },
    ],
  },
  evening: {
    title: "المساء",
    items: [
      {
        text: "«اللَّه لا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ العَظِيم».",
        count: 1,
      },
      {
        text: "«أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير».",
        count: 1,
      },
      {
        text: "«اللهم بك أمسينا، وبك أصبحنا، وبك نحيا، وبك نموت، وإليك المصير».",
        count: 1,
      },
    ],
  },
  mosque: {
    title: "المسجد",
    items: [
      {
        text: "«اللهم افتح لي أبواب رحمتك».",
        count: 1,
      },
      {
        text: "«بسم الله والصلاة والسلام على رسول الله، اللهم افتح لي أبواب رحمتك».",
        count: 1,
      },
    ],
  },
  sleep: {
    title: "النوم",
    items: [
      {
        text: "«باسمك اللهم أموت وأحيا».",
        count: 1,
      },
      {
        text: "«اللهم قني عذابك يوم تبعث عبادك».",
        count: 3,
      },
    ],
  },
  prayer: {
    title: "الصلاة",
    items: [
      {
        text: "«سبحان الله».",
        count: 33,
      },
      {
        text: "«الحمد لله».",
        count: 33,
      },
      {
        text: "«الله أكبر».",
        count: 34,
      },
    ],
  },
  general: {
    title: "أذكار عامة",
    items: [
      {
        text: "«لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير».",
        count: 10,
      },
      {
        text: "«سبحان الله وبحمده، سبحان الله العظيم».",
        count: 10,
      },
    ],
  },
};

export function AdhkarDetailScreen() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const data = adhkarData[categoryId || "morning"] || adhkarData.morning;
  const [completedCounts, setCompletedCounts] = useState<Record<number, number>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { openMenu } = useMenu();

  const handleCount = (index: number, maxCount: number) => {
    const current = completedCounts[index] || 0;
    if (current < maxCount) {
      setCompletedCounts({ ...completedCounts, [index]: current + 1 });
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <FadeIn delay={0} y={0}>
        <header className="bg-primary text-white px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <button
              className="p-1.5 rounded-full text-white/80"
              onClick={() => navigate(-1)}
            >
              <ArrowRight size={20} />
            </button>
            <h3 className="font-['Cairo'] text-white">{data.title}</h3>
            <button className="p-1.5 rounded-full text-white/80" onClick={openMenu}>
              <MenuIcon size={20} />
            </button>
          </div>
        </header>
      </FadeIn>

      {/* Adhkar List */}
      <div className="flex-1 px-4 py-4 space-y-4 pb-8">
        {data.items.map((item, index) => {
          const current = completedCounts[index] || 0;
          const isDone = current >= item.count;

          return (
            <FadeIn key={index} delay={0.06 + index * 0.07} y={16}>
              <div
                className={`rounded-2xl p-5 transition-all ${
                  isDone ? "bg-accent-green/10 border border-accent-green/20" : "bg-secondary border border-divider/50"
                }`}
              >
                <p
                  className="text-text-primary text-right font-['Amiri'] text-lg mb-4"
                  style={{ lineHeight: '2.2' }}
                >
                  {item.text}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(item.text, index)}
                      className="flex items-center gap-1 text-sm text-text-secondary px-3 py-1.5 rounded-full bg-surface-elevated border border-divider/50"
                    >
                      {copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedIndex === index ? "تم" : "نسخ"}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleCount(index, item.count)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-all ${
                      isDone
                        ? "bg-accent-green text-white"
                        : "bg-primary text-white active:scale-95"
                    }`}
                  >
                    <RotateCcw size={14} />
                    <span>{toArabicNum(current)} / {toArabicNum(item.count)}</span>
                  </button>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}