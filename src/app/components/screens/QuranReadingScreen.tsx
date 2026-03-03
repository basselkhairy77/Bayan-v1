import { useParams, useNavigate } from "react-router";
import { Menu as MenuIcon, Search, ArrowRight, Bookmark, Grid3X3, FileText } from "lucide-react";
import { useState } from "react";
import { FadeIn } from "../ui/FadeIn";
import { useMenu } from "../ui/MenuContext";

const surahData: Record<string, { name: string; verses: string[]; page: number }> = {
  "1": {
    name: "الفاتحة",
    page: 1,
    verses: [
      "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
      "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
      "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
      "مَـٰلِكِ يَوْمِ ٱلدِّينِ",
      "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
      "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
    ],
  },
  "2": {
    name: "البقرة",
    page: 2,
    verses: [
      "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
      "الٓمٓ",
      "ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًۭى لِّلْمُتَّقِينَ",
      "ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَـٰهُمْ يُنفِقُونَ",
      "وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْـَٔاخِرَةِ هُمْ يُوقِنُونَ",
      "أُوْلَـٰٓئِكَ عَلَىٰ هُدًۭى مِّن رَّبِّهِمْ ۖ وَأُوْلَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ",
      "إِنَّ ٱلَّذِينَ كَفَرُوا سَوَآءٌ عَلَيْهِمْ ءَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ",
    ],
  },
};

const defaultSurah = {
  name: "سورة",
  page: 1,
  verses: [
    "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
    "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
    "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
  ],
};

const toArabicNum = (n: number): string => {
  return n.toString().replace(/\d/g, (d) => '٠٢٣٤٥٦٧٨٩'[parseInt(d)]);
};

export function QuranReadingScreen() {
  const { surahId } = useParams();
  const navigate = useNavigate();
  const surah = surahData[surahId || "1"] || defaultSurah;
  const [bookmarked, setBookmarked] = useState(false);
  const { openMenu } = useMenu();

  return (
    <div className="min-h-screen bg-surface-warm flex flex-col">
      {/* Header */}
      <FadeIn delay={0} y={0}>
        <header className="bg-primary text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-full text-white/80">
                <Search size={20} />
              </button>
            </div>
            <div className="text-center">
              <h3 className="font-['Cairo'] text-white">{surah.name}</h3>
              <p className="text-white/60 text-xs">صفحة {toArabicNum(surah.page)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-1.5 rounded-full text-white/80"
                onClick={() => navigate(-1)}
              >
                <ArrowRight size={20} />
              </button>
              <button className="p-1.5 rounded-full text-white/80" onClick={openMenu}>
                <MenuIcon size={20} />
              </button>
            </div>
          </div>
        </header>
      </FadeIn>

      {/* Quran Content */}
      <div className="flex-1 px-6 py-8">
        {surah.verses.map((verse, index) => (
          <FadeIn key={index} delay={0.05 + index * 0.06} y={14}>
            <div className="mb-6">
              {index === 0 && surahId !== "9" ? (
                <div className="bg-primary rounded-full py-3 px-6 mb-6">
                  <p className="text-white text-center font-['Amiri'] text-xl" style={{ lineHeight: '2' }}>
                    {verse} ﴿{toArabicNum(index + 1)}﴾
                  </p>
                </div>
              ) : (
                <p className="text-text-primary text-center font-['Amiri'] text-xl" style={{ lineHeight: '2.4' }}>
                  {verse} ﴿{toArabicNum(index + 1)}﴾
                </p>
              )}
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Bottom Controls */}
      <FadeIn delay={0.3} y={10}>
        <div className="sticky bottom-0 bg-surface-elevated border-t border-divider px-4 py-3">
          <div className="flex items-center justify-around">
            <button className="p-2 text-primary">
              <ChevronNav direction="next" />
            </button>
            <button
              className={`p-2 ${bookmarked ? "text-accent-gold" : "text-text-tertiary"}`}
              onClick={() => setBookmarked(!bookmarked)}
            >
              <Bookmark size={22} fill={bookmarked ? "currentColor" : "none"} />
            </button>
            <button className="p-2 text-text-tertiary">
              <FileText size={22} />
            </button>
            <button className="p-2 text-text-tertiary">
              <Grid3X3 size={22} />
            </button>
            <button className="p-2 text-primary">
              <ChevronNav direction="prev" />
            </button>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

function ChevronNav({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {direction === "next" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}