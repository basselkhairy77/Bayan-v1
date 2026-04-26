import { Outlet, useLocation, useNavigate, useOutlet } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useCallback } from "react";
import {
  House,
  BookOpenText,
  SquaresFour,
  MoonStars,
  HeartStraight,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { MenuProvider, useMenu } from "./ui/MenuContext";
import { AppMenu } from "./ui/AppMenu";

const navItems: {
  path: string;
  label: string;
  icon: PhosphorIcon;
}[] = [
  { path: "/", label: "الرئيسية", icon: House },
  { path: "/quran", label: "القرآن", icon: BookOpenText },
  { path: "/adhkar", label: "أذكار", icon: MoonStars },
  { path: "/library", label: "المكتبة", icon: SquaresFour },
  { path: "/sadqa", label: "صدقة جارية", icon: HeartStraight },
];

// Maps a pathname to its nav index (-1 if not a main nav route)
function getNavIndex(pathname: string): number {
  if (pathname === "/") return 0;
  const idx = navItems.findIndex(
    (item) => item.path !== "/" && pathname.startsWith(item.path)
  );
  return idx;
}

function BottomNav({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      {/* Glassmorphism container */}
      <div
        className="mx-3 mb-3 rounded-2xl border border-white/20 overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          boxShadow:
            "0 -4px 32px rgba(61, 43, 31, 0.08), 0 2px 16px rgba(61, 43, 31, 0.04)",
        }}
      >
        <div className="flex items-center justify-around py-2 px-1">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className="relative flex flex-col items-center gap-0.5 py-1.5 px-2 min-w-[52px] bg-transparent border-none outline-none cursor-pointer"
              >
                {/* Active pill background */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: "rgba(124, 92, 66, 0.1)" }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  className="relative z-10 flex items-center justify-center"
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -1 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 22,
                  }}
                >
                  <Icon
                    size={22}
                    weight={isActive ? "fill" : "regular"}
                    className="transition-colors duration-300"
                    color={
                      isActive
                        ? "var(--primary)"
                        : "var(--text-tertiary)"
                    }
                  />
                </motion.div>

                {/* Label */}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isActive ? "active" : "inactive"}
                    className="relative z-10 text-[10px] font-['Cairo'] whitespace-nowrap"
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      color: isActive
                        ? "var(--primary)"
                        : "var(--text-tertiary)",
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {item.label}
                  </motion.span>
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// Shared animation for all screens
const screenVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const screenTransition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1],
};

export function Layout() {
  return (
    <MenuProvider>
      <LayoutInner />
    </MenuProvider>
  );
}

function LayoutInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();
  const { isMenuOpen, closeMenu } = useMenu();

  const isReadingScreen = location.pathname.startsWith("/quran/");
  const isDetailScreen = location.pathname.startsWith("/adhkar/");
  const isSunnahScreen = location.pathname === "/sunnah";
  const isPrayerTrackerScreen = location.pathname === "/prayer-tracker";
  const isSubScreen = isReadingScreen || isDetailScreen || isSunnahScreen || isPrayerTrackerScreen;

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative overflow-hidden"
    >
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className={`absolute inset-0 overflow-y-auto ${!isSubScreen ? 'pb-24' : 'flex flex-col'}`}
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={screenTransition}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {!isSubScreen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="relative z-50"
          >
            <BottomNav onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AppMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </div>
  );
}