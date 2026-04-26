import { useState, useEffect, useMemo, useCallback } from "react";
import { AppBar } from "../AppBar";
import { FadeIn } from "../ui/FadeIn";
import { Check } from "lucide-react";

const PRAYERS = ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"] as const;
type PrayerName = (typeof PRAYERS)[number];

const TEAL = "#26A69A";
const AMBER = "#D4A843";

const STORAGE_KEY = "prayerTracker";
const HISTORY_KEY = "prayerTrackerHistory";

const toArabicNum = (n: number | string): string =>
  n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function toHijri(date: Date): string {
  const jd = Math.floor(date.getTime() / 86400000 + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  const arabicMonths = [
    "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى",
    "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
  ];
  return `${toArabicNum(day)} ${arabicMonths[Math.max(0, Math.min(11, month - 1))]} ${toArabicNum(year)}`;
}

interface PrayerState {
  ada: boolean;
  onTime: boolean;
}
type PrayersMap = Record<PrayerName, PrayerState>;

function emptyPrayers(): PrayersMap {
  return PRAYERS.reduce((acc, p) => {
    acc[p] = { ada: false, onTime: false };
    return acc;
  }, {} as PrayersMap);
}

interface StoredToday {
  date: string;
  prayers: PrayersMap;
}

function loadToday(): PrayersMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyPrayers();
    const parsed: StoredToday = JSON.parse(raw);
    if (parsed.date !== todayStr()) {
      // Archive yesterday into history
      try {
        const hRaw = localStorage.getItem(HISTORY_KEY);
        const h: Record<string, PrayersMap> = hRaw ? JSON.parse(hRaw) : {};
        h[parsed.date] = parsed.prayers;
        localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
      } catch {}
      return emptyPrayers();
    }
    const merged = emptyPrayers();
    for (const p of PRAYERS) {
      if (parsed.prayers && parsed.prayers[p]) merged[p] = parsed.prayers[p];
    }
    return merged;
  } catch {
    return emptyPrayers();
  }
}

function saveToday(prayers: PrayersMap) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ date: todayStr(), prayers })
  );
}

function loadHistory(): Record<string, PrayersMap> {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function aggregate(days: number, todayPrayers: PrayersMap) {
  const history = loadHistory();
  const today = todayStr();
  history[today] = todayPrayers;
  const now = new Date();
  let ada = 0;
  let onTime = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = history[key];
    if (!entry) continue;
    for (const p of PRAYERS) {
      if (entry[p]?.ada) ada++;
      if (entry[p]?.onTime) onTime++;
    }
  }
  return { ada, onTime, total: days * 5 };
}

function Ring({
  percent,
  color,
  size = 80,
  stroke = 8,
}: {
  percent: number;
  color: string;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, percent)) / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 400ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-['Cairo'] text-base" style={{ fontWeight: 700 }}>
          {toArabicNum(Math.round(percent))}%
        </span>
      </div>
    </div>
  );
}

function MainCheckbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
        checked ? "bg-primary border-primary" : "border-divider bg-transparent"
      }`}
      style={{ animation: checked ? "checkBounce 150ms ease" : undefined }}
    >
      {checked && <Check size={16} color="#fff" strokeWidth={3} />}
    </button>
  );
}

function SubBox({
  checked,
  onClick,
  label,
  variant,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
  variant: "primary" | "amber";
}) {
  const checkedStyle =
    variant === "primary"
      ? { backgroundColor: "var(--primary)", borderColor: "var(--primary)" }
      : { backgroundColor: "rgba(212,168,67,0.2)", borderColor: AMBER };
  const checkColor = variant === "primary" ? "#fff" : AMBER;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
    >
      <span className="text-xs text-text-secondary font-['Cairo']">{label}</span>
      <div
        className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
        style={
          checked
            ? checkedStyle
            : { borderColor: "var(--divider)", backgroundColor: "transparent" }
        }
      >
        {checked && <Check size={12} color={checkColor} strokeWidth={3} />}
      </div>
    </button>
  );
}

type Period = "daily" | "weekly" | "monthly" | "yearly";

const PERIODS: { key: Period; label: string }[] = [
  { key: "yearly", label: "سنوي" },
  { key: "monthly", label: "شهري" },
  { key: "weekly", label: "أسبوعي" },
  { key: "daily", label: "يومي" },
];

export function PrayerTrackerScreen() {
  const [period, setPeriod] = useState<Period>("daily");
  const [prayers, setPrayers] = useState<PrayersMap>(loadToday);

  useEffect(() => {
    saveToday(prayers);
  }, [prayers]);

  const toggleAda = useCallback((p: PrayerName) => {
    setPrayers((prev) => ({ ...prev, [p]: { ...prev[p], ada: !prev[p].ada } }));
  }, []);
  const toggleOnTime = useCallback((p: PrayerName) => {
    setPrayers((prev) => ({ ...prev, [p]: { ...prev[p], onTime: !prev[p].onTime } }));
  }, []);
  const toggleMain = useCallback((p: PrayerName) => {
    setPrayers((prev) => {
      const current = prev[p];
      const both = current.ada && current.onTime;
      return { ...prev, [p]: { ada: !both, onTime: !both } };
    });
  }, []);

  const adaCount = PRAYERS.filter((p) => prayers[p].ada).length;
  const onTimeCount = PRAYERS.filter((p) => prayers[p].onTime).length;

  const stats = useMemo(() => {
    if (period === "daily") return null;
    const days = period === "weekly" ? 7 : period === "monthly" ? 30 : 365;
    return aggregate(days, prayers);
  }, [period, prayers]);

  const hijri = useMemo(() => toHijri(new Date()), []);

  return (
    <div className="min-h-screen bg-surface-warm flex flex-col">
      <AppBar title="المتابعة" showBack backDirection="left" />

      <FadeIn delay={0.06}>
        {/* Period Tabs */}
        <div className="flex flex-row-reverse gap-1 bg-secondary rounded-full p-1 mx-4 mt-3">
          {PERIODS.map((t) => {
            const active = period === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setPeriod(t.key)}
                className={`flex-1 rounded-full px-5 py-2 font-['Cairo'] text-sm transition-colors border-none cursor-pointer ${
                  active ? "bg-primary text-white" : "bg-transparent text-text-secondary"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div key={period} style={{ animation: "fadeIn 250ms ease" }}>
          {period === "daily" && (
            <>
              {/* Hijri Date */}
              <div className="mt-3">
                <p className="text-text-tertiary text-xs text-center font-['Cairo']">
                  التاريخ الهجري
                </p>
                <p
                  className="text-primary font-['Cairo'] text-2xl text-center mt-1 mb-4"
                  style={{ fontWeight: 700 }}
                >
                  {hijri}
                </p>
              </div>

              {/* Stats Rings */}
              <div className="flex flex-row-reverse justify-center gap-8 px-4 py-4">
                <div className="flex flex-col items-center gap-2">
                  <Ring percent={(adaCount / 5) * 100} color={TEAL} />
                  <p className="font-['Cairo'] text-sm text-text-primary" style={{ fontWeight: 600 }}>
                    مؤداة
                  </p>
                  <p className="font-['Cairo'] text-xs text-text-tertiary">
                    {toArabicNum(adaCount)}/{toArabicNum(5)}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Ring percent={(onTimeCount / 5) * 100} color={AMBER} />
                  <p className="font-['Cairo'] text-sm text-text-primary" style={{ fontWeight: 600 }}>
                    في الوقت
                  </p>
                  <p className="font-['Cairo'] text-xs text-text-tertiary">
                    {toArabicNum(onTimeCount)}/{toArabicNum(5)}
                  </p>
                </div>
              </div>

              {/* Prayer List */}
              <h3
                className="text-right font-['Cairo'] text-text-primary px-4 mb-2 mt-2"
                style={{ fontWeight: 700 }}
              >
                مواقيت الصلاة
              </h3>
              <div className="bg-background mx-4 rounded-xl overflow-hidden mb-6">
                {PRAYERS.map((p, idx) => {
                  const state = prayers[p];
                  const both = state.ada && state.onTime;
                  return (
                    <div
                      key={p}
                      className={`px-4 py-3.5 ${
                        idx < PRAYERS.length - 1 ? "border-b border-divider/50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between flex-row-reverse">
                        <p
                          className="font-['Cairo'] text-text-primary text-base text-right"
                          style={{ fontWeight: 600 }}
                        >
                          {p}
                        </p>
                        <MainCheckbox checked={both} onClick={() => toggleMain(p)} />
                      </div>
                      <div className="flex items-center justify-end gap-5 mt-2 flex-row-reverse">
                        <SubBox
                          checked={state.ada}
                          onClick={() => toggleAda(p)}
                          label="مؤداة"
                          variant="primary"
                        />
                        <SubBox
                          checked={state.onTime}
                          onClick={() => toggleOnTime(p)}
                          label="في الوقت"
                          variant="amber"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {period !== "daily" && stats && (
            <div className="px-4 mt-4 pb-8">
              <h3
                className="text-right font-['Cairo'] text-xl mb-4"
                style={{ fontWeight: 700 }}
              >
                إحصائيات{" "}
                {period === "weekly" ? "أسبوعية" : period === "monthly" ? "شهرية" : "سنوية"}
              </h3>

              {[
                { label: "عدد المؤداة", value: stats.ada, color: TEAL },
                { label: "عدد في الوقت", value: stats.onTime, color: AMBER },
              ].map((b) => {
                const pct = stats.total > 0 ? (b.value / stats.total) * 100 : 0;
                return (
                  <div
                    key={b.label}
                    className="bg-background rounded-2xl p-5 mb-4 border border-divider/40"
                  >
                    <p
                      className="font-['Cairo'] text-text-secondary text-sm text-right mb-2"
                      style={{ fontWeight: 600 }}
                    >
                      {b.label}
                    </p>
                    <p
                      className="font-['Cairo'] text-3xl text-center mb-3"
                      style={{ color: b.color, fontWeight: 700 }}
                    >
                      {toArabicNum(b.value)} / {toArabicNum(stats.total)}
                    </p>
                    <div className="bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: b.color,
                          transition: "width 400ms ease",
                        }}
                      />
                    </div>
                    <p className="text-xs text-text-tertiary text-center mt-2 font-['Cairo']">
                      {toArabicNum(pct.toFixed(1))}%
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
