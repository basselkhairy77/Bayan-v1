```
Update HomeScreen.tsx to add smart location-based prayer times:

━━━━━━━━━━━━━━━━━━━━━━━━
1. PRAYER TIMES API
━━━━━━━━━━━━━━━━━━━━━━━━
Use Aladhan API (free, no key needed):
By coordinates: https://api.aladhan.com/v1/timings?latitude={lat}&longitude={lng}&method=5
By city: https://api.aladhan.com/v1/timingsByCity?city={city}&country={country}&method=5

Response prayers needed:
data.data.timings: { Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha }
data.data.date.hijri: { day, month: {ar}, year } → for Hijri date display

Method 5 = Egyptian General Authority of Survey (مناسب لمصر والمنطقة العربية)

━━━━━━━━━━━━━━━━━━━━━━━━
2. STATE
━━━━━━━━━━━━━━━━━━━━━━━━
const [locationStatus, setLocationStatus] = useState<'idle'|'granted'|'denied'|'manual'>('idle')
const [prayerTimes, setPrayerTimes] = useState<Record<string,string> | null>(null)
const [savedCity, setSavedCity] = useState<{name:string, lat?:number, lng?:number} | null>(null)
const [showLocationSheet, setShowLocationSheet] = useState(false)
const [citySearch, setCitySearch] = useState('')
const [cityResults, setCityResults] = useState<any[]>([])
const [loadingPrayers, setLoadingPrayers] = useState(false)

On mount:
- Read localStorage key "userLocation" → if exists, fetch prayer times with saved location
- If not exists, set locationStatus to 'idle'

━━━━━━━━━━━━━━━━━━━━━━━━
3. PRAYER TIMES DISPLAY — WHEN LOCATION IS SET
━━━━━━━━━━━━━━━━━━━━━━━━
Keep the existing prayer times card design exactly as-is.
Replace hardcoded times with API data:

Arabic prayer names mapping:
{ Fajr:'الفجر', Sunrise:'الشروق', Dhuhr:'الظهر', Asr:'العصر', Maghrib:'المغرب', Isha:'العشاء' }

Next prayer calculation:
- Compare current time to each prayer time
- Highlight the next upcoming prayer
- Show "بعد Xس Yد" countdown below the next prayer time
- Update every minute using setInterval

Hijri date: display from API response above the prayer card:
"الأحد ٩ ذوالقعدة ١٤٤٧" style (use API data, not calculated)

━━━━━━━━━━━━━━━━━━━━━━━━
4. NO LOCATION STATE — REPLACE PRAYER CARD
━━━━━━━━━━━━━━━━━━━━━━━━
When locationStatus is 'idle' or 'denied', replace the prayer times card with:

<div className="mx-4 my-3 bg-secondary border border-divider/60 rounded-2xl p-4 text-center">
  <div className="text-3xl mb-2">📍</div>
  <p className="font-['Cairo'] font-semibold text-text-primary text-base">
    مواقيت الصلاة
  </p>
  <p className="text-text-secondary text-sm mt-1 font-['Cairo']">
    يرجى تحديد موقعك لعرض مواقيت الصلاة
  </p>
  <button
    onClick={handleLocationRequest}
    className="mt-3 bg-primary text-white font-['Cairo'] rounded-xl px-6 py-2.5 text-sm w-full"
  >
    تحديد الموقع
  </button>
</div>

━━━━━━━━━━━━━━━━━━━━━━━━
5. LOCATION REQUEST FLOW
━━━━━━━━━━━━━━━━━━━━━━━━
handleLocationRequest():
  1. Call navigator.geolocation.getCurrentPosition()
  
  2. If SUCCESS (user allowed):
     - setLocationStatus('granted')
     - fetch prayer times by lat/lng
     - save to localStorage: "userLocation" = { type:'gps', lat, lng, name:'موقعي' }
  
  3. If ERROR (user denied or unavailable):
     - setLocationStatus('denied')
     - setShowLocationSheet(true)  ← open bottom sheet for manual city selection

━━━━━━━━━━━━━━━━━━━━━━━━
6. CITY SEARCH BOTTOM SHEET
━━━━━━━━━━━━━━━━━━━━━━━━
Show when showLocationSheet is true.

Sheet content:
- Handle bar at top
- Title: "اختر مدينتك" font-Cairo font-bold text-right
- Subtitle: "ابحث باللغة العربية أو الإنجليزية" text-text-tertiary text-sm text-right

Search input:
<input
  placeholder="مثال: القاهرة أو Cairo"
  value={citySearch}
  onChange={(e) => { setCitySearch(e.target.value); searchCities(e.target.value) }}
  className="w-full bg-secondary rounded-xl px-4 py-3 text-right font-['Cairo'] outline-none border border-divider/40 mt-3"
  dir="rtl"
  autoFocus
/>

searchCities(query):
  if query.length < 2 return
  Use OpenStreetMap Nominatim API (free, no key):
  fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&accept-language=ar`)
  
  Map results to: { name: result.display_name (take first part before first comma), lat, lng }

Results list (below input, scrollable max-h-60):
  Each result row:
  <button
    onClick={() => selectCity(result)}
    className="w-full text-right px-2 py-3 border-b border-divider/40 font-['Cairo'] text-text-primary text-sm active:bg-secondary"
  >
    {result.name}
  </button>

If no results and query > 2 chars:
  <p className="text-center text-text-tertiary text-sm py-4 font-['Cairo']">
    لا توجد نتائج، جرب اسماً آخر
  </p>

Preset popular cities (show before user types):
const popularCities = [
  { name: 'القاهرة', lat: 30.0444, lng: 31.2357 },
  { name: 'الرياض', lat: 24.7136, lng: 46.6753 },
  { name: 'جدة', lat: 21.4858, lng: 39.1925 },
  { name: 'دبي', lat: 25.2048, lng: 55.2708 },
  { name: 'الكويت', lat: 29.3759, lng: 47.9774 },
  { name: 'عمّان', lat: 31.9454, lng: 35.9284 },
  { name: 'بيروت', lat: 33.8938, lng: 35.5018 },
  { name: 'الإسكندرية', lat: 31.2001, lng: 29.9187 },
]

Show as horizontal scrollable chips before search results:
  chip style: bg-secondary border border-divider rounded-full px-3 py-1.5 text-sm font-['Cairo'] text-text-primary flex-shrink-0

selectCity(city):
  - setPrayerTimes loading state
  - fetch prayer times: https://api.aladhan.com/v1/timings?latitude={lat}&longitude={lng}&method=5
  - On success: save to localStorage "userLocation" = { type:'manual', name: city.name, lat, lng }
  - setShowLocationSheet(false)
  - setSavedCity(city)
  - setLocationStatus('manual')
  - Display prayer times

━━━━━━━━━━━━━━━━━━━━━━━━
7. SHOW CITY NAME
━━━━━━━━━━━━━━━━━━━━━━━━
When prayer times are loaded, show city name below the Hijri date:
"📍 القاهرة" — text-text-tertiary text-xs font-['Cairo']
Make it tappable → opens location sheet again so user can change city

━━━━━━━━━━━━━━━━━━━━━━━━
8. BOTTOM SHEET STYLE
━━━━━━━━━━━━━━━━━━━━━━━━
Same as other bottom sheets in the app:
- fixed bottom-0 left-0 right-0 z-50
- bg-background rounded-t-3xl
- max-h-[80vh] overflow-y-auto
- p-6
- Backdrop: fixed inset-0 bg-black/40 z-40
- Slide up animation on open (translate-y-0), slide down on close (translate-y-full)
- duration-300 ease-in-out
- Close on backdrop tap
```