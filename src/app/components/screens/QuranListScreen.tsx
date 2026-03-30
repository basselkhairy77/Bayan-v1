import { useNavigate } from "react-router";
import { AppBar } from "../AppBar";
import { ChevronLeft, Bookmark, Search, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { FadeIn } from "../ui/FadeIn";

const surahStartPages: Record<number, number> = {
  1:1, 2:2, 3:50, 4:77, 5:106, 6:128, 7:151, 8:177, 9:187, 10:208,
  11:221, 12:235, 13:249, 14:255, 15:262, 16:267, 17:282, 18:293,
  19:305, 20:312, 21:322, 22:332, 23:342, 24:350, 25:359, 26:367,
  27:377, 28:385, 29:396, 30:404, 31:411, 32:415, 33:418, 34:428,
  35:434, 36:440, 37:446, 38:453, 39:458, 40:467, 41:477, 42:483,
  43:489, 44:496, 45:499, 46:502, 47:507, 48:511, 49:515, 50:518,
  51:520, 52:523, 53:526, 54:528, 55:531, 56:534, 57:537, 58:542,
  59:545, 60:549, 61:551, 62:553, 63:554, 64:556, 65:558, 66:560,
  67:562, 68:564, 69:566, 70:568, 71:570, 72:572, 73:574, 74:575,
  75:577, 76:578, 77:580, 78:582, 79:583, 80:585, 81:586, 82:587,
  83:587, 84:589, 85:590, 86:591, 87:591, 88:592, 89:593, 90:594,
  91:595, 92:595, 93:596, 94:596, 95:597, 96:597, 97:598, 98:598,
  99:599, 100:599, 101:600, 102:600, 103:601, 104:601, 105:601,
  106:602, 107:602, 108:602, 109:603, 110:603, 111:603, 112:604,
  113:604, 114:604
};

interface Surah {
  id: number;
  name: string;
  verses: number;
  type: string;
  page: number;
}

interface QuranBookmark {
  surahNumber: number;
  surahName: string;
  page: number;
  ayah: number;
}

const toArabicNum = (n: number): string => {
  const digits = '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669';
  return n.toString().replace(/\d/g, (d) => digits[parseInt(d)]);
};

export function QuranListScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [savedBookmark, setSavedBookmark] = useState<QuranBookmark | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("quranBookmark");
      if (raw) setSavedBookmark(JSON.parse(raw));
    } catch {}
  }, []);

  const fetchSurahs = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("https://api.alquran.cloud/v1/surah");
      const json = await res.json();
      const refs = json.data as any[];
      setSurahs(
        refs.map((s) => ({
          id: s.number,
          name: (s.name as string)
            .replace(/سُورَةُ\s*/g, '')
            .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08E1\u08E3-\u08FF\uFE70-\uFE7F]/g, '')
            .replace(/ٱ/g, 'ا')
            .trim(),
          verses: s.numberOfAyahs,
          type: s.revelationType === "Meccan" ? "مكية" : "مدنية",
          page: s.page || s.number,
        }))
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurahs();
  }, []);

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
            <div className="text-right">
              <h3 className="text-white font-['Cairo']">معدل الختمة</h3>
              <p className="text-white/70 text-sm mt-0.5">
                صفحة {toArabicNum(savedBookmark?.page || 0)} من {toArabicNum(604)}
              </p>
            </div>
            <div className="relative w-14 h-14">
              {(() => {
                const page = savedBookmark?.page || 0;
                const total = 604;
                const pct = Math.round((page / total) * 100);
                const r = 24;
                const circ = 2 * Math.PI * r;
                return (
                  <>
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                      <circle
                        cx="28" cy="28" r={r} fill="none" stroke="#FFFFFF" strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${circ * (pct / 100)} ${circ * (1 - pct / 100)}`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm text-white" style={{ fontWeight: 600 }}>
                      {toArabicNum(pct)}٪
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Bookmarks */}
      {savedBookmark && (
        <FadeIn delay={0.12}>
          <div className="px-4 mb-2">
            <button
              onClick={() => navigate(`/quran/${savedBookmark.surahNumber}?page=${savedBookmark.page}`)}
              className="w-full bg-accent-gold/10 border border-accent-gold/20 rounded-xl px-4 py-2.5 flex items-center gap-3"
            >
              <Bookmark size={16} className="text-accent-gold" />
              <div className="text-right">
                <p className="text-sm text-text-primary" style={{ fontWeight: 500 }}>{savedBookmark.surahName}</p>
                <p className="text-xs text-text-secondary">
                  آية {toArabicNum(savedBookmark.ayah)} · صفحة {toArabicNum(savedBookmark.page)}
                </p>
              </div>
              <span className="text-xs text-text-tertiary mr-auto">الموضع المحفوظ</span>
            </button>
          </div>
        </FadeIn>
      )}

      {/* Surah List */}
      <FadeIn delay={0.18}>
        <div className="px-4 mt-2">
          {loading ? (
            <div className="flex flex-col gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3.5 border-b border-divider/60 animate-pulse" dir="rtl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-secondary" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-secondary rounded" />
                      <div className="h-3 w-16 bg-secondary rounded" />
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-secondary rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <p className="text-text-secondary text-sm">تعذّر تحميل قائمة السور</p>
              <button
                onClick={fetchSurahs}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm transition-colors active:opacity-80"
              >
                <RefreshCw size={16} />
                إعادة المحاولة
              </button>
            </div>
          ) : (
            filteredSurahs.map((surah) => (
              <button
                key={surah.id}
                onClick={() => navigate(`/quran/${surah.id}?page=${surahStartPages[surah.id] || 1}`)}
                dir="rtl"
                className="w-full flex items-center justify-between py-3.5 border-b border-divider/60 transition-colors active:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    <span className="text-sm text-primary" style={{ fontWeight: 600 }}>{toArabicNum(surah.id)}</span>
                  </div>
                  <div className="text-right">
                    <h4 className="text-text-primary font-['Cairo']">{surah.name}</h4>
                    <p className="text-sm text-text-secondary text-right">
                      {surah.type} - {toArabicNum(surah.verses)} آيات
                    </p>
                  </div>
                </div>
                <ChevronLeft size={18} className="text-text-tertiary" />
              </button>
            ))
          )}
        </div>
      </FadeIn>
    </div>
  );
}