import { createBrowserRouter, redirect } from "react-router";
import { Layout } from "./components/Layout";
import { HomeScreen } from "./components/screens/HomeScreen";
import { QuranListScreen } from "./components/screens/QuranListScreen";
import { QuranReadingScreen } from "./components/screens/QuranReadingScreen";
import { AdhkarScreen } from "./components/screens/AdhkarScreen";
import { AdhkarDetailScreen } from "./components/screens/AdhkarDetailScreen";
import { TasbeehScreen } from "./components/screens/TasbeehScreen";
import { HadithScreen } from "./components/screens/HadithScreen";
import { LibraryScreen } from "./components/screens/LibraryScreen";
import { SadqaScreen } from "./components/screens/SadqaScreen";
import { SunnahTrackerScreen } from "./components/screens/SunnahTrackerScreen";
import { PrayerTrackerScreen } from "./components/screens/PrayerTrackerScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomeScreen },
      { path: "home", loader: () => redirect("/") },
      { path: "quran", Component: QuranListScreen },
      { path: "quran/:surahId", Component: QuranReadingScreen },
      { path: "adhkar", Component: AdhkarScreen },
      { path: "adhkar/:categoryId", Component: AdhkarDetailScreen },
      { path: "tasbeeh", Component: TasbeehScreen },
      { path: "hadith", Component: HadithScreen },
      { path: "library", Component: LibraryScreen },
      { path: "sunnah", Component: SunnahTrackerScreen },
      { path: "prayer-tracker", Component: PrayerTrackerScreen },
      { path: "sadqa", Component: SadqaScreen },
      { path: "*", loader: () => redirect("/") },
    ],
  },
]);