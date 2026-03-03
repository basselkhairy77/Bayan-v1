import { useNavigate } from "react-router";
import { AppBar } from "../AppBar";
import { ChevronLeft, Bookmark, Search } from "lucide-react";
import { useState } from "react";
import { FadeIn } from "../ui/FadeIn";

const surahs = [
  { id: 1, name: "الفاتحة", verses: 7, type: "مكية", page: 1 },
  { id: 2, name: "البقرة", verses: 286, type: "مدنية", page: 2 },
  { id: 3, name: "آل عمران", verses: 200, type: "مدنية", page: 50 },
  { id: 4, name: "النساء", verses: 176, type: "مدنية", page: 77 },
  { id: 5, name: "المائدة", verses: 120, type: "مدنية", page: 106 },
  { id: 6, name: "الأنعام", verses: 165, type: "مكية", page: 128 },
  { id: 7, name: "الأعراف", verses: 206, type: "مكية", page: 151 },
  { id: 8, name: "الأنفال", verses: 75, type: "مدنية", page: 177 },
  { id: 9, name: "التوبة", verses: 129, type: "مدنية", page: 187 },
  { id: 10, name: "يونس", verses: 109, type: "مكية", page: 208 },
  { id: 11, name: "هود", verses: 123, type: "مكية", page: 221 },
  { id: 12, name: "يوسف", verses: 111, type: "مكية", page: 235 },
  { id: 13, name: "الرعد", verses: 43, type: "مدنية", page: 249 },
  { id: 14, name: "إبراهيم", verses: 52, type: "مكية", page: 255 },
  { id: 15, name: "الحجر", verses: 99, type: "مكية", page: 262 },
  { id: 16, name: "النحل", verses: 128, type: "مكية", page: 267 },
  { id: 17, name: "الإسراء", verses: 111, type: "مكية", page: 282 },
  { id: 18, name: "الكهف", verses: 110, type: "مكية", page: 293 },
  { id: 19, name: "مريم", verses: 98, type: "مكية", page: 305 },
  { id: 20, name: "طه", verses: 135, type: "مكية", page: 312 },
  { id: 21, name: "الأنبياء", verses: 112, type: "مكية", page: 322 },
  { id: 22, name: "الحج", verses: 78, type: "مدنية", page: 332 },
  { id: 23, name: "المؤمنون", verses: 118, type: "مكية", page: 342 },
  { id: 24, name: "النور", verses: 64, type: "مدنية", page: 350 },
  { id: 25, name: "الفرقان", verses: 77, type: "مكية", page: 359 },
  { id: 26, name: "الشعراء", verses: 227, type: "مكية", page: 367 },
  { id: 27, name: "النمل", verses: 93, type: "مكية", page: 377 },
  { id: 28, name: "القصص", verses: 88, type: "مكية", page: 385 },
  { id: 29, name: "العنكبوت", verses: 69, type: "مكية", page: 396 },
  { id: 30, name: "الروم", verses: 60, type: "مكية", page: 404 },
];

const bookmarks = [
  { surah: "النساء", ayah: 1, page: 77 },
  { surah: "الفاتحة", ayah: 1, page: 1 },
];

const toArabicNum = (n: number): string => {
  return n.toString().replace(/\d/g, (d) => '٠٢٣٤٥٦٧٨٩'[parseInt(d)]);
};

export function QuranListScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filteredSurahs = searchQuery
    ? surahs.filter((s) => s.name.includes(searchQuery))
    : surahs;

  return (
    <div className="min-h-screen">
      <FadeIn delay={0}>
        <AppBar title="القرآن" showMenu showSearch onSearch={() => setShowSearch(!showSearch)} />
      </FadeIn>

      {/* Search bar */}
      {showSearch && (
        <div className="px-4 py-3 bg-background">
          <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5">
            <Search size={18} className="text-text-tertiary" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent flex-1 outline-none text-text-primary placeholder:text-text-tertiary text-sm"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Progress Card */}
      <FadeIn delay={0.06}>
        <div className="px-4 py-3">
          <div className="bg-primary rounded-2xl p-4 flex items-center justify-between">
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                <circle
                  cx="28" cy="28" r="24" fill="none" stroke="#FFFFFF" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 24 * 0.16} ${2 * Math.PI * 24 * 0.84}`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm text-white" style={{ fontWeight: 600 }}>
                ٢٠٪
              </span>
            </div>
            <div className="text-right">
              <h3 className="text-white font-['Cairo']">معدل الختم</h3>
              <p className="text-white/70 text-sm mt-0.5">صفحة ٩٥ من ٦٠٤</p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Bookmarks */}
      <FadeIn delay={0.12}>
        <div className="px-4 mb-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {bookmarks.map((bm, i) => (
              <div
                key={i}
                className="flex-shrink-0 bg-accent-green/10 border border-accent-green/20 rounded-xl px-4 py-2.5 flex items-center gap-3"
              >
                <Bookmark size={16} className="text-accent-green" />
                <div>
                  <p className="text-sm text-text-primary" style={{ fontWeight: 500 }}>{bm.surah}</p>
                  <p className="text-xs text-text-secondary">
                    آية {toArabicNum(bm.ayah)} · صفحة {toArabicNum(bm.page)}
                  </p>
                </div>
                <span className="text-xs text-text-tertiary mr-2">الموضع المحفوظ · {toArabicNum(i + 1)}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Surah List */}
      <FadeIn delay={0.18}>
        <div className="px-4 mt-2">
          {filteredSurahs.map((surah) => (
            <button
              key={surah.id}
              onClick={() => navigate(`/quran/${surah.id}`)}
              className="w-full flex items-center justify-between py-3.5 border-b border-divider/60 transition-colors active:bg-secondary/50"
            >
              <ChevronLeft size={18} className="text-text-tertiary" />
              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="text-right">
                  <h4 className="text-text-primary font-['Cairo']">{surah.name}</h4>
                  <p className="text-sm text-text-secondary">
                    {surah.type} · {toArabicNum(surah.verses)} آيات
                  </p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-sm text-primary" style={{ fontWeight: 600 }}>{toArabicNum(surah.id)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}