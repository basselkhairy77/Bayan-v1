import { AppBar } from "../AppBar";
import { BookOpen, ChevronLeft } from "lucide-react";
import { FadeIn } from "../ui/FadeIn";

const hadithBooks = [
  { id: 1, name: "البخاري", chapters: 97, hadiths: 7563, color: "bg-accent-green" },
  { id: 2, name: "مسلم", chapters: 56, hadiths: 5362, color: "bg-primary" },
  { id: 3, name: "الترمذي", chapters: 50, hadiths: 3956, color: "bg-[#7B5EA7]" },
  { id: 4, name: "ابن ماجة", chapters: 37, hadiths: 4341, color: "bg-[#D47B2A]" },
  { id: 5, name: "أبو داود", chapters: 43, hadiths: 5274, color: "bg-primary-dark" },
  { id: 6, name: "النسائي", chapters: 51, hadiths: 5758, color: "bg-accent-olive" },
];

const toArabicNum = (n: number): string => {
  return n.toString().replace(/\d/g, (d) => '٠٢٣٤٥٦٧٨٩'[parseInt(d)]);
};

export function HadithScreen() {
  return (
    <div className="min-h-screen">
      <FadeIn delay={0} y={0}>
        <AppBar title="الأحاديث" showBack showMenu />
      </FadeIn>

      {/* Hero Card */}
      <FadeIn delay={0.06}>
        <div className="px-4 py-3">
          <div className="bg-primary rounded-2xl p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <BookOpen size={24} className="text-white" />
            </div>
            <h2 className="text-white font-['Cairo']">أحاديث نبوية</h2>
            <p className="text-white/60 text-sm mt-1">اختر كتاب أحاديث للتصفح</p>
          </div>
        </div>
      </FadeIn>

      {/* Section Title */}
      <FadeIn delay={0.12}>
        <div className="px-4 py-3">
          <h3 className="text-text-primary font-['Cairo']">كتب الأحاديث</h3>
        </div>
      </FadeIn>

      {/* Books Grid */}
      <FadeIn delay={0.16}>
        <div className="px-4 pb-6">
          <div className="grid grid-cols-2 gap-3">
            {hadithBooks.map((book, i) => (
              <FadeIn key={book.id} delay={0.18 + i * 0.05} y={14}>
                <button
                  className={`${book.color} rounded-2xl p-5 flex flex-col items-center gap-3 transition-transform active:scale-[0.97] w-full`}
                >
                  <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <span className="text-white font-['Cairo']" style={{ fontWeight: 600 }}>
                    {book.name}
                  </span>
                  <div className="flex items-center gap-1 text-white/70 text-sm">
                    <span>تصفح</span>
                    <ChevronLeft size={14} />
                  </div>
                </button>
              </FadeIn>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.5}>
        <div className="px-4 pb-6">
          <div className="bg-secondary rounded-2xl p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl text-primary font-['Cairo']" style={{ fontWeight: 700 }}>٦</p>
                <p className="text-text-secondary text-sm mt-1">كتب متاحة</p>
              </div>
              <div>
                <p className="text-2xl text-primary font-['Cairo']" style={{ fontWeight: 700 }}>٣٢,٢٥٤</p>
                <p className="text-text-secondary text-sm mt-1">حديث شريف</p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}