Create a new screen called PrayerTrackerScreen.tsx with route "/prayer-tracker".

━━━━━━━━━━━━━━━━━━━━━━━━
NAVIGATION
━━━━━━━━━━━━━━━━━━━━━━━━
In HomeScreen.tsx, make the "متابعة الصلاة" card (or add one if not present)
navigate to "/prayer-tracker" on click.
Add the route to routes.ts.

━━━━━━━━━━━━━━━━━━━━━━━━
APP BAR
━━━━━━━━━━━━━━━━━━━━━━━━
Use existing AppBar component:
- title: "المتابعة"
- showMenu: true
- No back arrow (it's a main screen)
- bg-primary (brown) — same as other screens

━━━━━━━━━━━━━━━━━━━━━━━━
PERIOD TABS
━━━━━━━━━━━━━━━━━━━━━━━━
Below AppBar, a pill-shaped tab group — RTL order:
[ سنوي ] [ شهري ] [ أسبوعي ] [ يومي ✓ ]

State: const [period, setPeriod] = useState<'daily'|'weekly'|'monthly'|'yearly'>('daily')

Selected tab: bg-primary text-white rounded-full px-5 py-2 font-Cairo
Unselected tab: text-text-secondary bg-transparent px-5 py-2
Container: flex flex-row-reverse gap-1 bg-secondary rounded-full p-1 mx-4 mt-3

━━━━━━━━━━━━━━━━━━━━━━━━
HIJRI DATE (daily view only)
━━━━━━━━━━━━━━━━━━━━━━━━
Show current Hijri date below tabs:
- Label: "التاريخ الهجري" text-text-tertiary text-xs text-center
- Date: calculated dynamically using this formula:
  
  function toHijri(date: Date): string {
    // Simple Hijri approximation
    const jd = Math.floor((date.getTime() / 86400000) + 2440587.5)
    const l = jd - 1948440 + 10632
    const n = Math.floor((l - 1) / 10631)
    const l2 = l - 10631 * n + 354
    const j = Math.floor((10985 - l2) / 5316) * Math.floor(50 * l2 / 17719) +
              Math.floor(l2 / 5670) * Math.floor(43 * l2 / 15238)
    const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor(17719 * j / 50) -
               Math.floor(j / 16) * Math.floor(15238 * j / 43) + 29
    const month = Math.floor(24 * l3 / 709)
    const day = l3 - Math.floor(709 * month / 24)
    const year = 30 * n + j - 30
    const arabicMonths = ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى',
      'جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة']
    return `${toArabicNum(year)}/${toArabicNum(month)}/${toArabicNum(day)}`
  }

Display: text-primary font-Cairo text-2xl font-bold text-center mt-1 mb-4

━━━━━━━━━━━━━━━━━━━━━━━━
STATS CARDS — DAILY VIEW
━━━━━━━━━━━━━━━━━━━━━━━━
Two circular progress rings side by side:

State:
const prayers = ['الفجر','الظهر','العصر','المغرب','العشاء']
const [prayedOnTime, setPrayedOnTime] = useState<Record<string,boolean>>({})
const [prayedAda, setPrayedAda] = useState<Record<string,boolean>>({})

Left ring — "مؤداة" (teal/green color: #26A69A):
  count = prayers.filter(p => prayedAda[p]).length
  percent = count / 5 * 100
  label below: "مؤداة" + "{count}/{5}"
  ring color: #26A69A (teal)

Right ring — "في الوقت" (golden color: #D4A843):
  count = prayers.filter(p => prayedOnTime[p]).length  
  percent = count / 5 * 100
  label below: "في الوقت" + "{count}/{5}"
  ring color: #D4A843 (golden/amber)

Ring SVG (same pattern as معدل الختمة card in QuranListScreen):
  size: w-20 h-20
  background stroke: rgba(0,0,0,0.08)
  colored stroke: the respective color
  center text: "{percent}%" font-bold text-base

Layout: flex flex-row-reverse justify-center gap-8 px-4 py-4

━━━━━━━━━━━━━━━━━━━━━━━━
PRAYER LIST — DAILY VIEW
━━━━━━━━━━━━━━━━━━━━━━━━
Section title: "مواقيت الصلاة" text-right font-Cairo font-bold text-text-primary px-4 mb-2

For each prayer in ['الفجر','الظهر','العصر','المغرب','العشاء']:

Row structure (RTL):
┌─────────────────────────────────────────┐
│ [main checkbox]  اسم الصلاة            │
│                                          │
│        [مؤداة ☑]      [في الوقت ☑]     │
└─────────────────────────────────────────┘

Main checkbox (large, left side):
  - Circle shape: w-7 h-7 rounded-full
  - Unchecked: border-2 border-divider bg-transparent
  - Checked: bg-primary border-primary with white checkmark ✓ inside
  - Checked when BOTH مؤداة AND في الوقت are true
  - Clicking main checkbox toggles both sub-checkboxes ON/OFF

Prayer name (right side):
  - font-Cairo font-semibold text-text-primary text-base text-right
  
Sub-checkboxes row below name (two checkboxes inline, RTL):
  Right: "مؤداة" label + square checkbox
    checked state → bg-primary border-primary ✓ white
  Left: "في الوقت" label + square checkbox  
    checked state → bg-amber-500/20 border-amber-500 ✓ amber

  Square checkbox: w-5 h-5 rounded-md border-2
  Label: text-xs text-text-secondary ml-1 font-Cairo

Each prayer row separated by: border-b border-divider/50
Row padding: px-4 py-3.5

STORAGE: save to localStorage key "prayerTracker" as:
{
  date: "YYYY-MM-DD",
  prayers: { الفجر: { ada: bool, onTime: bool }, ... }
}
Reset daily when date changes.

━━━━━━━━━━━━━━━━━━━━━━━━
WEEKLY/MONTHLY/YEARLY VIEWS
━━━━━━━━━━━━━━━━━━━━━━━━
When period is not 'daily', show a stats summary screen:

Title: "إحصائيات {أسبوعية|شهرية|سنوية}" — text-right font-Cairo font-bold text-xl px-4 mt-4

Two stat blocks (stacked vertically, centered):

Block 1 — "عدد المؤداة":
  Value: "{completedAda} / {totalPossible}" in teal color (#26A69A) text-3xl font-bold
  Progress bar below: bg-secondary rounded-full h-2, fill color #26A69A
  Percentage text below bar: "X.X%" text-xs text-text-tertiary

Block 2 — "عدد في الوقت":  
  Value: "{completedOnTime} / {totalPossible}" in amber color (#D4A843) text-3xl font-bold
  Progress bar below: bg-secondary rounded-full h-2, fill color #D4A843
  Percentage text below bar: "X.X%" text-xs text-text-tertiary

Calculate from localStorage "prayerTracker" history:
  weekly = last 7 days × 5 prayers = 35 total possible
  monthly = last 30 days × 5 = 150 total
  yearly = last 365 days × 5 = 1825 total

If no history data: show 0/0 and 0.0%

━━━━━━━━━━━━━━━━━━━━━━━━
ANIMATIONS
━━━━━━━━━━━━━━━━━━━━━━━━
- Wrap content in <FadeIn delay={0.06}> same as other screens
- Tab switch: fade transition on content change
  use key={period} on content div to trigger re-render animation
- Checkbox toggle: scale bounce:
  transform: scale(1.1) then scale(1) on check, duration 150ms

━━━━━━━━━━━━━━━━━━━━━━━━
COLORS — USE APP VARIABLES
━━━━━━━━━━━━━━━━━━━━━━━━
- bg-primary (brown) for AppBar and selected tab
- bg-secondary for unselected tabs container
- text-primary for section titles
- text-text-secondary for labels
- border-divider for separators
- Teal (#26A69A) for مؤداة stats — inline style
- Amber (#D4A843) for في الوقت stats — inline style
- Font: font-['Cairo'] throughout

━━━━━━━━━━━━━━━━━━━━━━━━
HELPER
━━━━━━━━━━━━━━━━━━━━━━━━
Reuse toArabicNum() from QuranListScreen for all numbers displayed.