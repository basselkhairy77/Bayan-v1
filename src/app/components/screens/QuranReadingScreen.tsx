import { useParams, useNavigate, useSearchParams } from "react-router";
import React from "react";
import { ArrowLeft, Search, Bookmark, ChevronLeft, ChevronRight, RefreshCw, FileText, Image as ImageIcon, Loader2, BookOpen, Copy, Mic, Play, Pause, X } from "lucide-react";
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

interface SavedAyah {
  surahNumber: number;
  ayahNumber: number;
  text: string;
  surahName: string;
}

interface TafseerData {
  text: string;
  loading: boolean;
  error: boolean;
}

const BOOKMARK_KEY = "quranBookmark";
const SAVED_AYAHS_KEY = "savedAyahs";
const TOTAL_PAGES = 604;

// ── Basmala helpers ──────────────────────────────────────────────────────────
const BASMALA_DISPLAY = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

const basmalaVariants = [
  'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
  'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  'بسم الله الرحمن الرحيم',
];

/** Strip HTML tags (used for tajweed edition text) */
const stripTags = (html: string): string => html.replace(/<[^>]*>/g, '');

const stripBasmala = (text: string): string => {
  const clean = stripTags(text);
  for (const b of basmalaVariants) {
    if (clean.includes(b)) return clean.replace(b, '').trim();
  }
  return clean.replace(/^بِسْمِ.*?الرَّحِيمِ\s*/u, '').trim();
};

const hasBasmala = (text: string): boolean => {
  const clean = stripTags(text);
  return basmalaVariants.some(b => clean.includes(b)) ||
    /بسم/.test(clean);
};
// ─────────────────────────────────────────────────────────────────────────────

// ── Tajweed HTML parser ───────────────────────────────────────────────────────
const tajweedClassColors: Record<string, string> = {
  'ham_wasl':            '#AAAAAA',
  'madda_normal':        '#795548',
  'madda_permissible':   '#795548',
  'madda_necessary':     '#795548',
  'madda_obligatory':    '#795548',
  'qalaqah':             '#E74C3C',
  'ikhafa':              '#3498DB',
  'ikhafa_shafawi':      '#3498DB',
  'idgham_ghunnah':      '#27AE60',
  'idgham_wo_ghunnah':   '#2ECC71',
  'idgham_shafawi':      '#27AE60',
  'iqlab':               '#E91E8C',
  'ghunnah':             '#9B59B6',
  'lam_shamsiyah':       '#AAAAAA',
};

function parseTajweedHtml(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements: React.ReactNode[] = [];
  let i = 0;
  doc.body.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) elements.push(<span key={i}>{node.textContent}</span>);
    } else if (node.nodeName === 'TAJWEED') {
      const el = node as Element;
      const cls = el.getAttribute('class') || '';
      const color = tajweedClassColors[cls] || 'inherit';
      elements.push(<span key={i} style={{ color }}>{el.textContent}</span>);
    }
    i++;
  });
  return <>{elements}</>;
}
// ─────────────────────────────────────────────────────────────────────────────

// ── Tajweed legend ────────────────────────────────────────────────────────────
const TAJWEED_LEGEND = [
  { color: '#9B59B6', label: 'غنة' },
  { color: '#3498DB', label: 'إخفاء' },
  { color: '#27AE60', label: 'إدغام بغنة' },
  { color: '#2ECC71', label: 'إدغام بلا غنة' },
  { color: '#E91E8C', label: 'إقلاب' },
  { color: '#E74C3C', label: 'قلقلة' },
  { color: '#795548', label: 'مد' },
];
// ─────────────────────────────────────────────────────────────────────────────

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

  // Ayah bottom sheet states
  const [selectedAyah, setSelectedAyah] = useState<AyahData | null>(null);
  const [showAyahSheet, setShowAyahSheet] = useState(false);
  const [savedAyahsIds, setSavedAyahsIds] = useState<Set<number>>(new Set());
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [tafseer, setTafseer] = useState<TafseerData>({ text: "", loading: false, error: false });
  const [copySuccess, setCopySuccess] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewInput, setReviewInput] = useState("");
  const [reviewResult, setReviewResult] = useState<"correct" | "wrong" | null>(null);

  // Font size state
  const [fontSize, setFontSize] = useState(20);

  // Tajweed states
  const [showTajweed, setShowTajweed] = useState(false);
  const [tajweedTexts, setTajweedTexts] = useState<Map<number, string>>(new Map());

  // Page animation states
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Bottom sheet animation states
  const [isAyahSheetVisible, setIsAyahSheetVisible] = useState(false);
  const [isJumpSheetVisible, setIsJumpSheetVisible] = useState(false);

  // Load font size from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("quranFontSize");
    if (saved) setFontSize(parseInt(saved));
  }, []);

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
      const [mainRes, tajweedRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/page/${page}/ar.alafasy`),
        fetch(`https://api.alquran.cloud/v1/page/${page}/quran-tajweed`),
      ]);
      const mainJson = await mainRes.json();
      const tajweedJson = await tajweedRes.json();

      if (mainJson.code !== 200) throw new Error("API error");
      const ayahs: AyahData[] = mainJson.data.ayahs;
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

      // Build tajweed text map — filter out basmala ayahs from non-Fatiha, non-Tawbah surahs
      if (tajweedJson.code === 200) {
        const tajweedMap = new Map<number, string>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filteredTajweedAyahs = tajweedJson.data.ayahs.filter((ta: any) => {
          if (ta.surah.number === 1 || ta.surah.number === 9) return true;
          if (ta.numberInSurah === 1) {
            const plain = stripTags(ta.text);
            return !plain.includes('بسم');
          }
          return true;
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const ta of filteredTajweedAyahs) {
          tajweedMap.set(ta.number, ta.text);
        }
        setTajweedTexts(tajweedMap);
      }
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

  // Load saved ayahs on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_AYAHS_KEY);
      if (raw) {
        const saved: SavedAyah[] = JSON.parse(raw);
        const ids = new Set(saved.map((a) => a.ayahNumber));
        setSavedAyahsIds(ids);
      }
    } catch {}
  }, []);

  const handleNext = () => {
    if (currentPage < TOTAL_PAGES && !isAnimating) {
      setDirection('left');
      setIsAnimating(true);
      setCurrentPage((p) => p + 1);
      setTimeout(() => setIsAnimating(false), 250);
    }
  };
  const handlePrev = () => {
    if (currentPage > 1 && !isAnimating) {
      setDirection('right');
      setIsAnimating(true);
      setCurrentPage((p) => p - 1);
      setTimeout(() => setIsAnimating(false), 250);
    }
  };

  const handleJumpConfirm = () => {
    const num = parseInt(jumpInput, 10);
    if (isNaN(num) || num < 1 || num > TOTAL_PAGES) {
      setJumpError(true);
      return;
    }
    setCurrentPage(num);
    closeJumpSheet();
    setJumpInput("");
  };

  const openJumpSheet = () => {
    setJumpInput("");
    setJumpError(false);
    setShowJumpSheet(true);
    requestAnimationFrame(() => {
      setIsJumpSheetVisible(true);
      setTimeout(() => jumpInputRef.current?.focus(), 100);
    });
  };

  const closeJumpSheet = () => {
    setIsJumpSheetVisible(false);
    setTimeout(() => {
      setShowJumpSheet(false);
      setJumpError(false);
    }, 300);
  };

  const headerName = surahGroups.map((g) => g.surahName).join(" – ");

  const openAyahSheet = (ayah: AyahData) => {
    setSelectedAyah(ayah);
    setShowAyahSheet(true);
    setTafseer({ text: "", loading: false, error: false });
    setCopySuccess(false);
    setReviewMode(false);
    setReviewInput("");
    setReviewResult(null);
    if (currentAudio) {
      currentAudio.pause();
      setAudioPlaying(false);
    }
    requestAnimationFrame(() => setIsAyahSheetVisible(true));
  };

  const closeAyahSheet = () => {
    setIsAyahSheetVisible(false);
    setTimeout(() => {
      setShowAyahSheet(false);
      setSelectedAyah(null);
      if (currentAudio) {
        currentAudio.pause();
        setAudioPlaying(false);
      }
    }, 300);
  };

  const toggleSaveAyah = () => {
    if (!selectedAyah) return;
    try {
      const raw = localStorage.getItem(SAVED_AYAHS_KEY);
      let saved: SavedAyah[] = raw ? JSON.parse(raw) : [];
      const exists = saved.find((a) => a.ayahNumber === selectedAyah.number);
      if (exists) {
        // Remove
        saved = saved.filter((a) => a.ayahNumber !== selectedAyah.number);
      } else {
        // Add
        saved.push({
          surahNumber: selectedAyah.surah.number,
          ayahNumber: selectedAyah.number,
          text: selectedAyah.text,
          surahName: cleanSurahName(selectedAyah.surah.name),
        });
      }
      localStorage.setItem(SAVED_AYAHS_KEY, JSON.stringify(saved));
      const ids = new Set(saved.map((a) => a.ayahNumber));
      setSavedAyahsIds(ids);
    } catch {}
  };

  const toggleAudioPlay = () => {
    if (!selectedAyah) return;
    if (audioPlaying && currentAudio) {
      currentAudio.pause();
      setAudioPlaying(false);
    } else {
      if (currentAudio) {
        currentAudio.pause();
      }
      const url = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${selectedAyah.number}.mp3`;
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => setAudioPlaying(false);
      setCurrentAudio(audio);
      setAudioPlaying(true);
    }
  };

  const fetchTafseer = async () => {
    if (!selectedAyah) return;
    setTafseer({ text: "", loading: true, error: false });
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${selectedAyah.number}/ar.muyassar`);
      const json = await res.json();
      if (json.code !== 200) throw new Error("API error");
      setTafseer({ text: json.data.text, loading: false, error: false });
    } catch {
      setTafseer({ text: "", loading: false, error: true });
    }
  };

  const copyAyah = async () => {
    if (!selectedAyah) return;
    try {
      await navigator.clipboard.writeText(selectedAyah.text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {}
  };

  const startReview = () => {
    setReviewMode(true);
    setReviewInput("");
    setReviewResult(null);
  };

  const checkReview = () => {
    if (!selectedAyah) return;
    const normalized = (s: string) => s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "").replace(/\s+/g, " ").trim();
    if (normalized(reviewInput) === normalized(selectedAyah.text)) {
      setReviewResult("correct");
    } else {
      setReviewResult("wrong");
    }
  };

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
          onClick={handlePrev}
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
          onClick={handleNext}
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
          <span className="font-['Cairo']">آيات</span>
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
          <span className="font-['Cairo']">صفحة</span>
        </button>
      </div>

      {/* Font Size Control — only in ayah mode */}
      {viewMode === "ayah" && (
        <>
          {/* Row 1: font size + tajweed toggle */}
          <div className="flex items-center justify-between gap-3 py-2.5 px-5 border-b border-divider/40 bg-surface-elevated">
            {/* Font size controls */}
            <div className="flex items-center gap-2.5">
              {/* Increase */}
              <button
                onClick={() => {
                  const s = Math.min(32, fontSize + 2);
                  setFontSize(s);
                  localStorage.setItem("quranFontSize", s.toString());
                }}
                className={`flex items-center justify-center w-9 h-9 rounded-full bg-secondary text-text-secondary active:bg-primary active:text-white transition-colors ${fontSize >= 32 ? "opacity-30 cursor-not-allowed" : ""}`}
                style={{ fontFamily: "Amiri, serif" }}
                disabled={fontSize >= 32}
              >
                <span style={{ fontSize: "22px", lineHeight: 1, display: "block", marginTop: "3px" }}>أ</span>
              </button>

              {/* Dot scale */}
              <div className="flex gap-1 items-center">
                {[14, 18, 22, 26, 32].map(size => (
                  <div
                    key={size}
                    className={`rounded-full transition-all ${fontSize >= size ? "bg-primary" : "bg-divider"}`}
                    style={{ width: fontSize >= size ? 8 : 6, height: fontSize >= size ? 8 : 6 }}
                  />
                ))}
              </div>

              {/* Decrease */}
              <button
                onClick={() => {
                  const s = Math.max(14, fontSize - 2);
                  setFontSize(s);
                  localStorage.setItem("quranFontSize", s.toString());
                }}
                className={`flex items-center justify-center w-9 h-9 rounded-full bg-secondary text-text-secondary active:bg-primary active:text-white transition-colors ${fontSize <= 14 ? "opacity-30 cursor-not-allowed" : ""}`}
                style={{ fontFamily: "Amiri, serif" }}
                disabled={fontSize <= 14}
              >
                <span style={{ fontSize: "14px", lineHeight: 1, display: "block", marginTop: "2px" }}>أ</span>
              </button>
            </div>

            {/* Tajweed toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary font-['Cairo']">أحكام التجويد</span>
              <button
                dir="ltr"
                onClick={() => setShowTajweed(v => !v)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0"
                style={{ backgroundColor: showTajweed ? "#7C5C42" : "rgba(0,0,0,0.15)" }}
                role="switch"
                aria-checked={showTajweed}
              >
                <span
                  className="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                  style={{ transform: showTajweed ? "translateX(22px)" : "translateX(2px)" }}
                />
              </button>
            </div>
          </div>

          {/* Row 2: tajweed legend (only when tajweed is on) */}
          {showTajweed && (
            <div
              className="flex gap-2 overflow-x-auto px-4 py-2 border-b border-divider/40 bg-surface-elevated"
              style={{ scrollbarWidth: "none" }}
            >
              {TAJWEED_LEGEND.map(rule => (
                <div key={rule.label} className="flex items-center gap-1 flex-shrink-0">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: rule.color }} />
                  <span className="text-xs text-text-secondary font-['Cairo']">{rule.label}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Content */}
      <div
        key={currentPage}
        className="flex-1 overflow-y-auto pb-24"
        style={{
          animation: direction
            ? `${direction === 'left' ? 'slideInLeft' : 'slideInRight'} 250ms ease-out`
            : 'none',
        }}
      >
        {viewMode === "image" ? (
          /* ===== IMAGE MODE ===== */
          <div style={{ width: "100%", lineHeight: 0, fontSize: 0 }}>
            {loading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="h-5 skeleton rounded w-3/4" />
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
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="h-5 skeleton rounded w-3/4" />
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

                // Use hasBasmala() so bracket markers in tajweed text don't break detection
                const isBismillahAyah = (ayah: AyahData) =>
                  ayah.numberInSurah === 1 && !isTawbah && hasBasmala(ayah.text);

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
                      const showAsBismillah = isBismillahAyah(ayah);
                      const delay = 0.03 + (gi * 4 + ai) * 0.03;

                      // For Surah Al-Fatiha: the whole ayah 1 IS the basmala — show as single card
                      if (showAsBismillah && isFirstSurah) {
                        return (
                          <FadeIn key={ayah.number} delay={delay} y={14}>
                            <div className="bg-primary rounded-2xl py-3 px-6 mb-4">
                              <p className="text-white text-center font-['Amiri'] text-xl" style={{ lineHeight: '2' }}>
                                {showTajweed && tajweedTexts.get(ayah.number)
                                  ? parseTajweedHtml(tajweedTexts.get(ayah.number)!)
                                  : ayah.text}
                                {` ﴿${toArabicNum(ayah.numberInSurah)}﴾`}
                              </p>
                            </div>
                          </FadeIn>
                        );
                      }

                      // For all other surahs (not Tawbah): split basmala card + ayah card
                      if (showAsBismillah) {
                        const bodyText = stripBasmala(ayah.text);
                        return (
                          <FadeIn key={ayah.number} delay={delay} y={14}>
                            {/* Basmala card — standalone, not tappable */}
                            <div className="bg-primary rounded-2xl py-3 px-6 mb-3">
                              <p className="text-white text-center font-['Amiri'] text-xl" style={{ lineHeight: '2' }}>
                                {BASMALA_DISPLAY}
                              </p>
                            </div>
                            {/* Ayah body card — tappable */}
                            {bodyText.length > 0 && (
                              <div
                                onClick={() => openAyahSheet(ayah)}
                                className="w-full bg-background border border-divider/40 rounded-2xl px-5 py-5 mb-2 text-center cursor-pointer active:bg-secondary/50 transition-colors"
                                dir="rtl"
                              >
                                <p
                                  className="leading-loose font-['Amiri'] text-center text-text-primary"
                                  dir="rtl"
                                  style={{ fontSize: `${fontSize}px` }}
                                >
                                  {bodyText}
                                </p>
                                <span
                                  className="block text-center text-primary mt-3"
                                  style={{ fontSize: '18px', fontFamily: 'Amiri, serif' }}
                                >
                                  ﴿{toArabicNum(ayah.numberInSurah)}﴾
                                </span>
                              </div>
                            )}
                          </FadeIn>
                        );
                      }

                      // Regular ayah card
                      const tajweedHtml = tajweedTexts.get(ayah.number);
                      return (
                        <FadeIn key={ayah.number} delay={delay} y={14}>
                          <div
                            onClick={() => openAyahSheet(ayah)}
                            className="w-full bg-background border border-divider/40 rounded-2xl px-5 py-5 mb-2 text-center cursor-pointer active:bg-secondary/50 transition-colors"
                            dir="rtl"
                          >
                            <p
                              className="leading-loose font-['Amiri'] text-center text-text-primary"
                              dir="rtl"
                              style={{ fontSize: `${fontSize}px` }}
                            >
                              {showTajweed && tajweedHtml
                                ? parseTajweedHtml(tajweedHtml)
                                : ayah.text}
                            </p>
                            <span
                              className="block text-center text-primary mt-3"
                              style={{ fontSize: '18px', fontFamily: 'Amiri, serif' }}
                            >
                              ﴿{toArabicNum(ayah.numberInSurah)}﴾
                            </span>
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
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 pointer-events-auto transition-opacity duration-300 ${isJumpSheetVisible ? "opacity-100" : "opacity-0"}`}
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={closeJumpSheet}
          />
          {/* Sheet */}
          <div
            className={`relative w-full max-w-md bg-background rounded-t-3xl p-6 pointer-events-auto transition-transform duration-300 ease-in-out ${isJumpSheetVisible ? "translate-y-0" : "translate-y-full"}`}
          >
            <div className="w-12 h-1.5 bg-divider rounded-full mx-auto mb-4" />
            <div className="relative mb-6 mt-1">
              <button onClick={closeJumpSheet} className="absolute right-0 top-0 p-1 text-text-tertiary">
                <X size={20} />
              </button>
              <h2 className="font-['Cairo'] font-bold text-text-primary text-lg text-center mt-2">
                انتقل إلى صفحة
              </h2>
            </div>
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

      {/* Ayah Bottom Sheet */}
      {showAyahSheet && selectedAyah && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 pointer-events-auto transition-opacity duration-300 ${isAyahSheetVisible ? "opacity-100" : "opacity-0"}`}
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={closeAyahSheet}
          />
          {/* Sheet */}
          <div
            className={`relative w-full bg-background rounded-t-3xl overflow-y-auto pointer-events-auto transition-transform duration-300 ease-in-out ${isAyahSheetVisible ? "translate-y-0" : "translate-y-full"}`}
            style={{ maxHeight: "70vh" }}
          >
            {/* Handle */}
            <div className="w-12 h-1.5 bg-divider rounded-full mx-auto mt-4 mb-4" />

            {/* Header */}
            <div className="relative mb-6 mt-1 px-6 border-b border-divider/40 pb-4">
              <button onClick={closeAyahSheet} className="absolute right-6 top-0 p-1 text-text-tertiary">
                <X size={20} />
              </button>
              <h2 className="font-['Cairo'] font-bold text-text-primary text-sm text-center mt-2">
                سورة {cleanSurahName(selectedAyah.surah.name)} - آية {toArabicNum(selectedAyah.numberInSurah)}
              </h2>
              <p className="text-text-tertiary text-xs text-center mt-1 font-['Amiri'] leading-relaxed" dir="rtl">
                {selectedAyah.text.substring(0, 30)}{selectedAyah.text.length > 30 ? "..." : ""}
              </p>
            </div>

            {/* Review Mode */}
            {reviewMode ? (
              <div className="px-6 py-6">
                <button
                  onClick={() => setReviewMode(false)}
                  className="text-sm text-primary mb-4"
                >
                  ← العودة
                </button>
                <h4 className="text-text-primary font-['Cairo'] text-center mb-4">اكتب الآية من ذاكرتك</h4>
                <textarea
                  value={reviewInput}
                  onChange={(e) => setReviewInput(e.target.value)}
                  placeholder="اكتب الآية هنا..."
                  className="w-full bg-secondary rounded-xl p-4 text-right text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-primary/30 min-h-[120px] font-['Amiri'] leading-loose"
                  dir="rtl"
                />
                <button
                  onClick={checkReview}
                  className="w-full mt-4 bg-primary text-white rounded-xl py-3 font-['Cairo'] active:opacity-80 transition-opacity"
                >
                  تحقق من الإجابة
                </button>
                {reviewResult === "correct" && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                    <p className="text-green-600 font-['Cairo']">✓ أحسنت! الآية صحيحة</p>
                  </div>
                )}
                {reviewResult === "wrong" && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 font-['Cairo'] text-center mb-2">✗ المحاولة غير صحيحة</p>
                    <p className="text-xs text-text-tertiary text-center">الآية الصحيحة:</p>
                    <p className="text-text-primary font-['Amiri'] leading-loose text-center mt-2" dir="rtl">
                      {selectedAyah.text}
                    </p>
                  </div>
                )}
              </div>
            ) : tafseer.text || tafseer.loading ? (
              /* Tafseer View */
              <div className="px-6 py-6">
                <button
                  onClick={() => setTafseer({ text: "", loading: false, error: false })}
                  className="text-sm text-primary mb-4"
                >
                  ← العودة
                </button>
                <h4 className="text-text-primary font-['Cairo'] text-center mb-4">التفسير</h4>
                {tafseer.loading ? (
                  <div className="space-y-3 mt-4">
                    <div className="h-4 skeleton rounded w-full" />
                    <div className="h-4 skeleton rounded w-11/12 ml-auto" />
                    <div className="h-4 skeleton rounded w-4/5 ml-auto" />
                    <div className="h-4 skeleton rounded w-5/6 ml-auto" />
                    <div className="h-4 skeleton rounded w-3/4 ml-auto" />
                  </div>
                ) : (
                  <p className="text-text-secondary font-['Cairo'] leading-relaxed text-right" dir="rtl">
                    {tafseer.text}
                  </p>
                )}
              </div>
            ) : (
              /* Options List */
              <div className="py-2">
                {/* حفظ الآية */}
                <button
                  onClick={toggleSaveAyah}
                  className="w-full flex items-center gap-3 px-6 py-3.5 border-b border-divider/40 active:bg-secondary/30 transition-colors"
                >
                  <Bookmark 
                    size={20} 
                    fill={savedAyahsIds.has(selectedAyah.number) ? "currentColor" : "none"}
                    style={{ color: savedAyahsIds.has(selectedAyah.number) ? "#C4A35A" : "#7C5C42" }}
                  />
                  <span className="flex-1 text-right text-text-primary font-['Cairo']" style={{ color: savedAyahsIds.has(selectedAyah.number) ? "#22c55e" : undefined }}>
                    {savedAyahsIds.has(selectedAyah.number) ? "تم الحفظ ✓" : "حفظ الآية"}
                  </span>
                </button>

                {/* تشغيل الآية */}
                <button
                  onClick={toggleAudioPlay}
                  className="w-full flex items-center gap-3 px-6 py-3.5 border-b border-divider/40 active:bg-secondary/30 transition-colors"
                >
                  {audioPlaying ? (
                    <Pause size={20} style={{ color: "#7C5C42" }} />
                  ) : (
                    <Play size={20} style={{ color: "#7C5C42" }} />
                  )}
                  <span className="flex-1 text-right text-text-primary font-['Cairo']">
                    {audioPlaying ? "إيقاف" : "تشغيل الآية"}
                  </span>
                </button>

                {/* تفسير */}
                <button
                  onClick={fetchTafseer}
                  className="w-full flex items-center gap-3 px-6 py-3.5 border-b border-divider/40 active:bg-secondary/30 transition-colors"
                >
                  <BookOpen size={20} style={{ color: "#7C5C42" }} />
                  <span className="flex-1 text-right text-text-primary font-['Cairo']">
                    تفسير
                  </span>
                </button>

                {/* نسخ الآية */}
                <button
                  onClick={copyAyah}
                  className="w-full flex items-center gap-3 px-6 py-3.5 border-b border-divider/40 active:bg-secondary/30 transition-colors"
                >
                  <Copy size={20} style={{ color: copySuccess ? "#22c55e" : "#7C5C42" }} />
                  <span className="flex-1 text-right text-text-primary font-['Cairo']" style={{ color: copySuccess ? "#22c55e" : undefined }}>
                    {copySuccess ? "تم النسخ ✓" : "نسخ الآية"}
                  </span>
                </button>

                {/* تسميع (مراجعة الحفظ) */}
                <button
                  onClick={startReview}
                  className="w-full flex items-center gap-3 px-6 py-3.5 active:bg-secondary/30 transition-colors"
                >
                  <Mic size={20} style={{ color: "#7C5C42" }} />
                  <span className="flex-1 text-right text-text-primary font-['Cairo']">
                    تسميع (مراجعة الحفظ)
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}