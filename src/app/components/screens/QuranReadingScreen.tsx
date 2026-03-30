import { useParams, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Search, Bookmark, Grid3X3, ChevronLeft, ChevronRight, RefreshCw, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
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
  const [showJumpSheet, setShowJumpSheet] = useState(false);
  const [jumpInput, setJumpInput] = useState("");
  const [jumpError, setJumpError] = useState(false);
  const jumpInputRef = useRef<HTMLInputElement>(null);

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

  const handleJumpConfirm = () => {
    const num = parseInt(jumpInput, 10);
    if (isNaN(num) || num < 1 || num > TOTAL_PAGES) {
      setJumpError(true);
      return;
    }
    setCurrentPage(num);
    setShowJumpSheet(false);
    setJumpInput("");
    setJumpError(false);
  };

  const openJumpSheet = () => {
    setJumpInput("");
    setJumpError(false);
    setShowJumpSheet(true);
    setTimeout(() => jumpInputRef.current?.focus(), 100);
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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-divider py-3 px-6 flex items-center justify-between" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
        <button
          className={`p-2 ${currentPage > 1 ? "text-primary" : "text-text-tertiary opacity-30 cursor-not-allowed pointer-events-none"}`}
          onClick={goPrev}
          disabled={currentPage <= 1}
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
          <button
            onClick={openJumpSheet}
            className="text-sm text-text-secondary underline underline-offset-4 decoration-text-tertiary/40 px-2 py-1 rounded-lg active:bg-secondary/50 transition-colors"
          >
            {toArabicNum(currentPage)} / {toArabicNum(TOTAL_PAGES)}
          </button>
        </div>

        <button
          className={`p-2 ${currentPage < TOTAL_PAGES ? "text-primary" : "text-text-tertiary opacity-30 cursor-not-allowed pointer-events-none"}`}
          onClick={goNext}
          disabled={currentPage >= TOTAL_PAGES}
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
      <div className="flex-1 overflow-y-auto pb-24">
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
                const startsAtBeginning = group.ayahs[0]?.numberInSurah === 1;

                const isBismillahAyah = (ayah: AyahData) =>
                  ayah.numberInSurah === 1 &&
                  !isTawbah &&
                  (ayah.text.startsWith('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ') ||
                   ayah.text.startsWith('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ') ||
                   ayah.text.startsWith('بِسۡمِ ٱللَّهِ'));

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

                    {group.ayahs.map((ayah, ai) => {
                      const showAsBismillahCard = isBismillahAyah(ayah);
                      return (
                        <FadeIn key={ayah.number} delay={0.03 + (gi * 4 + ai) * 0.03} y={14}>
                          <div className="mb-2">
                            {showAsBismillahCard ? (
                              <div className="bg-primary rounded-2xl py-3 px-6 mb-4">
                                <p className="text-white text-center font-['Amiri'] text-xl" style={{ lineHeight: '2' }}>
                                  {ayah.text} {isFirstSurah ? `﴿${toArabicNum(ayah.numberInSurah)}﴾` : ''}
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

      {/* Page Jump Bottom Sheet */}
      {showJumpSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => { setShowJumpSheet(false); setJumpError(false); }}
          />
          <div
            className="relative w-full max-w-md bg-background rounded-t-2xl p-6 animate-slide-up"
            style={{ animation: "slideUp 0.25s ease-out" }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-divider" />
            </div>
            <h3 className="text-center text-text-primary font-['Cairo'] mb-4">انتقل إلى صفحة</h3>
            <input
              ref={jumpInputRef}
              type="number"
              min={1}
              max={604}
              value={jumpInput}
              onChange={(e) => { setJumpInput(e.target.value); setJumpError(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleJumpConfirm(); }}
              placeholder="رقم الصفحة (٢ - ٦٠٤)"
              className="w-full bg-secondary rounded-xl p-3 text-right text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-primary/30"
              dir="rtl"
            />
            {jumpError && (
              <p className="text-red-500 text-xs text-right mt-1.5">يرجى إدخال رقم بين ٢ و ٦٠٤</p>
            )}
            <button
              onClick={handleJumpConfirm}
              className="w-full mt-4 bg-primary text-white rounded-xl py-3 font-['Cairo'] active:opacity-80 transition-opacity"
            >
              انتقل
            </button>
          </div>
        </div>
      )}
    </div>
  );
}