import { motion, AnimatePresence } from "motion/react";
import {
  Globe,
  Type,
  Moon,
  Compass,
  Timer,
  Bell,
  Info,
  Mail,
  X,
  ChevronLeft,
} from "lucide-react";

const menuItems = [
  {
    label: "اختر اللغة",
    icon: Globe,
    iconBg: "rgba(124, 92, 66, 0.12)",
    iconColor: "rgba(124, 92, 66, 1)",
  },
  {
    label: "حجم الخط",
    icon: Type,
    iconBg: "rgba(196, 163, 90, 0.14)",
    iconColor: "rgba(180, 145, 65, 1)",
  },
  {
    label: "الوضع الداكن",
    icon: Moon,
    iconBg: "rgba(61, 43, 31, 0.10)",
    iconColor: "rgba(61, 43, 31, 0.85)",
  },
  {
    label: "القبلة",
    icon: Compass,
    iconBg: "rgba(45, 107, 74, 0.12)",
    iconColor: "rgba(45, 107, 74, 1)",
  },
  {
    label: "المتابعة",
    icon: Timer,
    iconBg: "rgba(160, 125, 90, 0.14)",
    iconColor: "rgba(160, 125, 90, 1)",
  },
  {
    label: "إعدادات الإشعارات",
    icon: Bell,
    iconBg: "rgba(196, 163, 90, 0.14)",
    iconColor: "rgba(180, 145, 65, 1)",
  },
  {
    label: "سياسة الخصوصية",
    icon: Info,
    iconBg: "rgba(139, 154, 107, 0.15)",
    iconColor: "rgba(115, 130, 85, 1)",
  },
  {
    label: "اتصل بنا",
    icon: Mail,
    iconBg: "rgba(45, 107, 74, 0.12)",
    iconColor: "rgba(45, 107, 74, 1)",
  },
];

interface AppMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppMenu({ isOpen, onClose }: AppMenuProps) {
  return (
    <AnimatePresence mode="sync">
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            className="fixed inset-0 z-[100]"
            style={{
              backgroundColor: "rgba(61, 43, 31, 0.3)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={onClose}
          />

          {/* Drawer panel — slides from the left */}
          <motion.div
            className="fixed top-0 left-0 bottom-0 z-[101] w-[82%] max-w-[320px] flex flex-col"
            style={{
              background: "linear-gradient(180deg, #FFFBF6 0%, #FAF6F1 100%)",
              boxShadow: "8px 0 40px rgba(61, 43, 31, 0.15)",
            }}
            dir="rtl"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300, transition: { type: "tween", duration: 0.2, ease: [0.4, 0, 1, 1] } }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 300,
              mass: 0.8,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <h3
                className="text-text-primary font-['Cairo']"
                style={{ fontWeight: 600 }}
              >
                القائمة
              </h3>
              <motion.button
                className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer"
                style={{ backgroundColor: "rgba(124, 92, 66, 0.08)" }}
                onClick={onClose}
                whileTap={{ scale: 0.88 }}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  damping: 18,
                  stiffness: 200,
                  delay: 0.15,
                }}
              >
                <X size={18} style={{ color: "rgba(124, 92, 66, 1)" }} />
              </motion.button>
            </div>

            {/* Divider */}
            <div
              className="mx-5 h-px"
              style={{ backgroundColor: "rgba(232, 223, 209, 0.6)" }}
            />

            {/* Menu items */}
            <div className="flex-1 overflow-y-auto py-3 px-3">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.label}
                    onClick={onClose}
                    className="flex items-center gap-3.5 w-full px-3 py-3 rounded-2xl border-none cursor-pointer hover:[background-color:rgba(124,92,66,0.05)] active:[background-color:rgba(124,92,66,0.08)] transition-[background-color] duration-200"
                    style={{
                      WebkitTapHighlightColor: "transparent",
                    }}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      damping: 22,
                      stiffness: 250,
                      delay: 0.06 + index * 0.04,
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Icon container */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: item.iconBg }}
                    >
                      <Icon size={19} style={{ color: item.iconColor }} />
                    </div>

                    {/* Label */}
                    <span
                      className="flex-1 text-right text-sm font-['Cairo']"
                      style={{
                        color: "rgba(61, 43, 31, 0.88)",
                        fontWeight: 500,
                      }}
                    >
                      {item.label}
                    </span>

                    {/* Chevron */}
                    <ChevronLeft
                      size={16}
                      style={{ color: "rgba(176, 160, 144, 0.6)" }}
                    />
                  </motion.button>
                );
              })}
            </div>

            {/* Footer */}
            <motion.div
              className="px-5 pb-6 pt-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="h-px mb-4"
                style={{ backgroundColor: "rgba(232, 223, 209, 0.6)" }}
              />
              <p
                className="text-center text-xs font-['Cairo']"
                style={{ color: "rgba(176, 160, 144, 0.7)" }}
              >
                بيان v1.0
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}