import { motion } from "motion/react";
import svgPaths from "../../../imports/svg-f8pc07kbi2";
import quranSvgPaths from "../../../imports/svg-ee8aq5i5bu";

interface GetStartedScreenProps {
  ready: boolean;
  onContinue: () => void;
}

function BookIllustration() {
  return (
    <svg className="w-full h-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 291.7 178.324">
      <path d={quranSvgPaths.p323b9080} fill="#042030" opacity="0.25" />
      <path d={quranSvgPaths.p28669880} fill="#5C4030" />
      <path d={quranSvgPaths.pe13d600} fill="#3D2B1F" opacity="0.45" />
      <path d={quranSvgPaths.p245f91f0} fill="#3D2B1F" opacity="0.45" />
      <path d={quranSvgPaths.pa7e4440} fill="#DED7D0" />
      <path d={quranSvgPaths.p2b68bb80} fill="#5C4030" />
      <path d={quranSvgPaths.p1a47f200} fill="#5C4030" opacity="0.45" />
      <path d={quranSvgPaths.p2838dc00} fill="#DED7D0" />
      <path d={quranSvgPaths.p219edc00} fill="#5C4030" />
      <path d={quranSvgPaths.p1b31dd80} fill="#5C4030" opacity="0.45" />
      <path d={quranSvgPaths.p3c738c80} fill="white" fillOpacity="0.5" />
      <path d={quranSvgPaths.p25320d80} fill="#F5B304" />
      <path d={quranSvgPaths.p1bbba100} fill="#DED7D0" />
      <path d={quranSvgPaths.p19f9bb80} fill="#FBF5EF" />
      <path d={quranSvgPaths.p1804b300} fill="#DED7D0" />
      <path d={quranSvgPaths.p1815ec00} fill="#5C4030" />
      <path d={quranSvgPaths.p34911b80} opacity="0.2" stroke="#5C4030" strokeLinecap="round" strokeWidth="3" />
      <path d={quranSvgPaths.p2b74c580} opacity="0.2" stroke="#5C4030" strokeLinecap="round" strokeWidth="3" />
      <path d={quranSvgPaths.pf602e80} opacity="0.2" stroke="#5C4030" strokeLinecap="round" strokeWidth="3" />
      <path d={quranSvgPaths.p3e1e9690} opacity="0.2" stroke="#5C4030" strokeLinecap="round" strokeWidth="3" />
      <path d={quranSvgPaths.p415f800} opacity="0.2" stroke="#5C4030" strokeLinecap="round" strokeWidth="3" />
      <path d={quranSvgPaths.p2a555a00} opacity="0.2" stroke="#5C4030" strokeLinecap="round" strokeWidth="3" />
      <path d={quranSvgPaths.pccc7600} fill="#F57F54" />
    </svg>
  );
}

export function GetStartedScreen({ ready, onContinue }: GetStartedScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[190] flex flex-col items-center bg-[#3D2B1F] overflow-y-auto overflow-x-hidden"
      dir="rtl"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
    >
      {/* Decorative circles top-left */}
      <motion.div
        className="absolute top-[-88px] left-[-2px] w-[134px] h-[135px] pointer-events-none"
        style={{ rotate: "16.95deg" }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 107 108">
          <ellipse cx="53.5" cy="54" fill="#7C5C42" fillOpacity="0.38" rx="53.5" ry="54" />
        </svg>
      </motion.div>
      <motion.div
        className="absolute top-[-93px] left-[-94px] w-[172px] h-[172px] pointer-events-none"
        style={{ rotate: "16.95deg" }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
      >
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 138 138">
          <circle cx="69" cy="69" fill="#6B4D36" fillOpacity="0.4" r="69" />
        </svg>
      </motion.div>

      {/* Main content - centered column */}
      <div className="relative flex flex-col items-center w-full max-w-[400px] mx-auto px-6 pt-16 pb-10 flex-1 justify-center">
        {/* Card with illustration */}
        <motion.div
          className="relative w-full rounded-[20px] bg-[#7C5C42] py-8 flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={ready ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Sparkle decorations */}
          <motion.div
            className="absolute"
            style={{ top: "8%", left: "12%", width: 17, height: 19 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
          >
            <svg className="block size-full" fill="none" viewBox="0 0 17 19">
              <path d={svgPaths.p206b4200} fill="#FFD08A" />
            </svg>
          </motion.div>
          <motion.div
            className="absolute"
            style={{ top: "14%", right: "20%", width: 7, height: 8 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
          >
            <svg className="block size-full" fill="none" viewBox="0 0 7 8">
              <path d={svgPaths.p22107300} fill="#FFD08A" />
            </svg>
          </motion.div>
          <motion.div
            className="absolute"
            style={{ bottom: "12%", left: "6%", width: 30, height: 32 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ delay: 0.7, duration: 0.4, ease: "easeOut" }}
          >
            <svg className="block size-full" fill="none" viewBox="0 0 30 32">
              <path d={svgPaths.p36970800} fill="#FFD08A" />
            </svg>
          </motion.div>

          {/* Book illustration - centered in card */}
          <div className="w-[260px] h-[170px] flex items-center justify-center">
            <BookIllustration />
          </div>
        </motion.div>

        {/* Text section */}
        <motion.div
          className="flex flex-col gap-3 items-center text-center mt-8 px-2"
          initial={{ opacity: 0, y: 25 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-['Cairo'] text-[#C4A35A] text-[32px] leading-[1.2]">
            تنويه هام
          </p>
          <p className="font-['Cairo'] text-white/80 text-[17px] leading-[1.7] tracking-[0.4px]">
            هذا التطبيق وسيلة مساعدة ولا يغنيك عن الرجوع
            للشيوخ فحافظ على ذهابك للمسجد و التعلم من الشيوخ
          </p>
        </motion.div>

        {/* Button */}
        <motion.button
          className="mt-8 w-[180px] h-[48px] rounded-[50px] flex items-center justify-center cursor-pointer"
          onClick={onContinue}
          initial={{ opacity: 0, y: 15, scale: 0.9 }}
          animate={ready ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 15, scale: 0.9 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ backgroundColor: "rgba(196, 163, 90, 0.4)" }}
          whileHover={{ scale: 1.05, backgroundColor: "rgba(196, 163, 90, 0.55)" }}
          whileTap={{ scale: 0.92 }}
        >
          <span className="font-['Cairo'] text-white text-[16px]">
            حسناً
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}