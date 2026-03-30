import { useParams, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Search, Bookmark, Grid3X3, ChevronLeft, ChevronRight, RefreshCw, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { FadeIn } from "../ui/FadeIn";

type ViewMode = "ayah" | "image";

interface AyahData {
  number: number;
  text: string;
  numberInSurah: number;
  surah: { number: number; name: string };
  page: number;
  juz: number;
}

interface SurahGroup {
  surahNumber: number;
  surahName: string;
  ayahs: AyahData[];
}

interface QuranBookmark {
  surahNumber: number;
  surahName: string;
  page: number;
  ayah: number;
}

const BOOKMARK_KEY = "quranBookmark";
const TOTAL_PAGES = 604;
const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

const toArabicNum = (n: number): string =>
  n.toString().replace(/\d/g, (d) => '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669'[parseInt(d)]);

const cleanSurahName = (name: string): string =>
  name
    .replace(/سُورَةُ\s*/g, '')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08E1\u08E3-\u08FF\uFE70-\uFE7F]/g, '')
    .replace(/ٱ/g, 'ا')
    .trim();

function AyahImage({ surahNumber, ayahNumber }: { surahNumber: number; ayahNumber: number }) {
  const [useFallback, setUseFallback] = useState(false);
  const hiRes = `https://cdn.islamic.network/quran/images/high-resolution/${surahNumber}_${ayahNumber}.png`;
  const loRes = `https://cdn.islamic.network/quran/images/${surahNumber}_${ayahNumber}.png`;
  return (
    <img
      src={useFallback ? loRes : hiRes}
      alt={`${surahNumber}:${ayahNumber}`}
      style={{ width: "100%", display: "block", margin: 0, padding: 0, border: "none" }}
      onError={() => { if (!useFallback) setUseFallback(true); }}
    />
  );
}

export function QuranReadingScreen() {
  const { surahId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialPage = Number(searchParams.get("page")) || Number(surahId) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [viewMode, setViewMode] = useState<ViewMode>("ayah");
  const [surahGroups, setSurahGroups] = useState<SurahGroup[]>([]);
  const [juz, setJuz] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Check bookmark
  const checkBookmark = useCallback((page: number) => {
    try {
      const raw = localStorage.getItem(BOOKMARK_KEY);
      if (raw) {
        const bm: QuranBookmark = JSON.parse(raw);
        setBookmarked(bm.page === page);
      } else {
        setBookmarked(false);
      }
    } catch {
      setBookmarked(false);
    }
  }, []);

  const toggleBookmark = () => {
    if (bookmarked) {
      localStorage.removeItem(BOOKMARK_KEY);
      setBookmarked(false);
    } else if (surahGroups.length > 0) {
      const firstGroup = surahGroups[0];
      const bm: QuranBookmark = {
        surahNumber: firstGroup.surahNumber,
        surahName: firstGroup.surahName,
        page: currentPage,
        ayah: firstGroup.ayahs[0]?.numberInSurah ?? 1,
      };
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bm));
      setBookmarked(true);
    }
  };

  const fetchPage = async (page: number) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/page/${page}/ar.alafasy`);
      const json = await res.json();
      if (json.code !== 200) throw new Error("API error");
      const ayahs: AyahData[] = json.data.ayahs;
      if (ayahs.length > 0) setJuz(ayahs[0].juz);

      const groups: SurahGroup[] = [];
      let current: SurahGroup | null = null;
      for (const ayah of ayahs) {
        if (!current || current.surahNumber !== ayah.surah.number) {
          current = {
            surahNumber: ayah.surah.number,
            surahName: cleanSurahName(ayah.surah.name),
            ayahs: [],
          };
          groups.push(current);
        }
        current.ayahs.push(ayah);
      }
      setSurahGroups(groups);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(currentPage);
    checkBookmark(currentPage);
  }, [currentPage, checkBookmark]);

  // Reset image loading state when page or mode changes
  useEffect(() => {
    if (viewMode === "image") {
      setImageLoading(true);
      setImageError(false);
    }
  }, [currentPage, viewMode]);

  const goNext = () => {
    if (currentPage < TOTAL_PAGES) setCurrentPage((p) => p + 1);
  };
  const goPrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const headerName = surahGroups.map((g) => g.surahName).join(" – ");

  return (
    <div className="min-h-screen bg-surface-warm flex flex-col">
      {/* Header */}
      <FadeIn delay={0} y={0}>
        <header className="bg-primary text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <button className="p-1.5 rounded-full text-white/80">
              <Search size={20} />
            </button>
            <div className="text-center flex-1">
              <h3 className="font-['Cairo'] text-white">
                {loading ? "..." : headerName}
              </h3>
              <p className="text-white/60 text-xs">
                صفحة {toArabicNum(currentPage)} · الجزء {toArabicNum(juz)}
              </p>
            </div>
            <button
              className="p-1.5 rounded-full text-white/80"
              onClick={() => navigate("/quran")}
            >
              <ArrowLeft size={20} />
            </button>
          </div>
        </header>
      </FadeIn>

      {/* Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-elevated border-b border-divider">
        <button
          className={`p-2 ${currentPage < TOTAL_PAGES ? "text-primary" : "text-text-tertiary/30"}`}
          onClick={goNext}
          disabled={currentPage >= TOTAL_PAGES}
        >
          <ChevronRight size={22} />
        </button>

        <button
          className={`p-2 ${bookmarked ? "text-accent-gold" : "text-text-tertiary"}`}
          onClick={toggleBookmark}
        >
          <Bookmark size={22} fill={bookmarked ? "currentColor" : "none"} />
        </button>

        <div className="text-center px-2">
          <span className="text-sm text-text-secondary">
            {toArabicNum(currentPage)} / {toArabicNum(TOTAL_PAGES)}
          </span>
        </div>

        <button
          className={`p-2 ${currentPage > 1 ? "text-primary" : "text-text-tertiary/30"}`}
          onClick={goPrev}
          disabled={currentPage <= 1}
        >
          <ChevronLeft size={22} />
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-center gap-1 py-2 bg-surface-elevated border-b border-divider">
        <button
          onClick={() => setViewMode("ayah")}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-colors"
          style={{
            backgroundColor: viewMode === "ayah" ? "rgba(124,92,66,0.15)" : "transparent",
            color: viewMode === "ayah" ? "#7C5C42" : "#999",
          }}
        >
          <FileText size={16} />
          <span className="font-['Cairo']">نص</span>
        </button>
        <button
          onClick={() => setViewMode("image")}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-colors"
          style={{
            backgroundColor: viewMode === "image" ? "rgba(124,92,66,0.15)" : "transparent",
            color: viewMode === "image" ? "#7C5C42" : "#999",
          }}
        >
          <ImageIcon size={16} />
          <span className="font-['Cairo']">صورة</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === "image" ? (
          /* ===== IMAGE MODE ===== */
          <div style={{ width: "100%", lineHeight: 0, fontSize: 0 }}>
            {loading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex flex-col items-center gap-2">
                    <div className="h-5 bg-secondary rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-text-secondary text-sm">تعذّر تحميل الصفحة</p>
                <button
                  onClick={() => fetchPage(currentPage)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm active:opacity-80"
                >
                  <RefreshCw size={16} />
                  إعادة المحاولة
                </button>
              </div>
            ) : (
              surahGroups.map((group) => {
                return (
                  <div key={group.surahNumber} style={{ width: "100%", lineHeight: 0, fontSize: 0 }}>
                    {group.ayahs.map((ayah) => (
                      <AyahImage key={ayah.number} surahNumber={ayah.surah.number} ayahNumber={ayah.numberInSurah} />
                    ))}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* ===== AYAH MODE ===== */
          <div className="px-6 py-8">
            {loading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex flex-col items-center gap-2">
                    <div className="h-5 bg-secondary rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-text-secondary text-sm">تعذّر تحميل الصفحة</p>
                <button
                  onClick={() => fetchPage(currentPage)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm active:opacity-80"
                >
                  <RefreshCw size={16} />
                  إعادة المحاولة
                </button>
              </div>
            ) : (
              surahGroups.map((group, gi) => {
                const isFirstSurah = group.surahNumber === 1;
                const isTawbah = group.surahNumber === 9;
                const showBismillah = !isFirstSurah && !isTawbah && group.ayahs[0]?.numberInSurah === 1;
                const startsAtBeginning = group.ayahs[0]?.numberInSurah === 1;

                return (
                  <div key={group.surahNumber} className="mb-6">
                    {startsAtBeginning && (
                      <FadeIn delay={0.04 * gi} y={10}>
                        <div className="bg-primary/10 border border-primary/20 rounded-xl py-3 px-5 mb-4 text-center">
                          <p className="text-primary font-['Cairo'] text-lg">
                            سورة {group.surahName}
                          </p>
                        </div>
                      </FadeIn>
                    )}

                    {showBismillah && (
                      <FadeIn delay={0.04 * gi + 0.02} y={10}>
                        <div className="bg-primary rounded-full py-3 px-6 mb-5">
                          <p className="text-white text-center font-['Amiri'] text-xl" style={{ lineHeight: '2' }}>
                            {BISMILLAH}
                          </p>
                        </div>
                      </FadeIn>
                    )}

                    {group.ayahs.map((ayah, ai) => {
                      const isFatihaBismillah = isFirstSurah && ayah.numberInSurah === 1;
                      return (
                        <FadeIn key={ayah.number} delay={0.03 + (gi * 4 + ai) * 0.03} y={14}>
                          <div className="mb-2">
                            {isFatihaBismillah ? (
                              <div className="bg-primary rounded-full py-3 px-6 mb-4">
                                <p className="text-white text-center font-['Amiri'] text-xl" style={{ lineHeight: '2' }}>
                                  {ayah.text} ﴿{toArabicNum(ayah.numberInSurah)}﴾
                                </p>
                              </div>
                            ) : (
                              <p
                                className="text-text-primary text-center font-['Amiri'] text-xl"
                                style={{ lineHeight: '2.4' }}
                              >
                                {ayah.text} ﴿{toArabicNum(ayah.numberInSurah)}﴾
                              </p>
                            )}
                          </div>
                        </FadeIn>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}