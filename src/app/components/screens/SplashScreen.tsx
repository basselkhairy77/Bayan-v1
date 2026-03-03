import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import imgMosque from "figma:asset/6c86ed91fb264e182dcdd061e57a16557d3297eb.png";
import imgQuranIcon from "figma:asset/4d79b8ea16b51462ba3ef8f64d59e57c8183c74d.png";
import svgPaths from "../../../imports/svg-1wpj65zoqf";

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[200] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Background mosque image with warm overlay */}
          <div className="absolute inset-0" aria-hidden="true">
            <img
              alt=""
              className="absolute inset-0 w-full h-full object-cover scale-110"
              src={imgMosque}
            />
            {/* Warm brown overlay matching the app's primary palette */}
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(61,43,31,0.82)] via-[rgba(92,64,48,0.72)] to-[rgba(61,43,31,0.88)]" />
          </div>

          {/* Top decorative glow - warm gold tones */}
          <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[380px] pointer-events-none">
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 554 528"
              preserveAspectRatio="none"
            >
              <g filter="url(#splashGlow)">
                <ellipse
                  cx="277"
                  cy="264"
                  rx="169"
                  ry="156"
                  fill="url(#splashGlowGrad)"
                  fillOpacity="0.35"
                />
              </g>
              <defs>
                <filter
                  id="splashGlow"
                  x="0"
                  y="0"
                  width="554"
                  height="528"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                  <feGaussianBlur stdDeviation="54" result="blur" />
                </filter>
                <linearGradient
                  id="splashGlowGrad"
                  x1="277"
                  y1="108"
                  x2="277"
                  y2="420"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#C4A35A" />
                  <stop offset="1" stopColor="#7C5C42" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Center content */}
          <div className="relative flex flex-col items-center justify-center h-full" dir="rtl">
            {/* Open Quran SVG icon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
            >
              <svg
                className="w-[100px] h-[100px]"
                fill="none"
                viewBox="0 0 100 100"
              >
                <path d={svgPaths.p345eb400} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                <path d={svgPaths.p8639d80} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                <path d={svgPaths.p232b6e00} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                <path d={svgPaths.p1d84b600} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </motion.div>

            {/* Quran icon */}
            <motion.div
              className="w-[120px] h-[120px] -mt-3"
              style={{ filter: "drop-shadow(0px 2px 40px rgba(196, 163, 90, 0.6))" }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
            >
              <img
                alt="بيان"
                className="w-full h-full object-contain pointer-events-none"
                src={imgQuranIcon}
              />
            </motion.div>

            {/* App name */}
            <motion.p
              className="mt-2 text-white text-center font-['Cairo'] text-[44px] leading-[1.2]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7, ease: "easeOut" }}
              dir="auto"
            >
              بيان
            </motion.p>

            {/* Subtle tagline */}
            <motion.p
              className="mt-1 text-center font-['Cairo'] text-[14px]"
              style={{ color: "rgba(255, 255, 255, 0.5)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              dir="auto"
            >
              نور القلوب
            </motion.p>
          </div>

          {/* Bottom indicator bar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-[134px] h-[5px] rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: "rgba(196, 163, 90, 0.6)" }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}