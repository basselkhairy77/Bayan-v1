import { useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { SplashScreen } from "./components/screens/SplashScreen";
import { AnimatePresence } from "motion/react";
import { GetStartedScreen } from "./components/screens/GetStartedScreen";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashDone, setSplashDone] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(true);

  return (
    <>
      <RouterProvider router={router} />
      <AnimatePresence>
        {showGetStarted && (
          <GetStartedScreen
            ready={splashDone}
            onContinue={() => setShowGetStarted(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSplash && (
          <SplashScreen
            onFinish={() => {
              setShowSplash(false);
              setSplashDone(true);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}