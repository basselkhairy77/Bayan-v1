import { useNavigate } from "react-router";
import { AppBar } from "../AppBar";
import { ChevronLeft, Bookmark, Search, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { FadeIn } from "../ui/FadeIn";

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
                onClick={() => navigate(`/quran/${surah.id}?page=${surah.page}`)}
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