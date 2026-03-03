import { FadeIn } from "../ui/FadeIn";

export function SadqaScreen() {
  return (
    <FadeIn delay={0.05}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-4">
        <FadeIn delay={0.12} y={12}>
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-primary"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
        </FadeIn>
        <FadeIn delay={0.2} y={12}>
          <h2 className="text-text-primary">صدقة جارية</h2>
        </FadeIn>
        <FadeIn delay={0.28} y={12}>
          <p className="text-text-secondary text-sm">
            قريباً بإذن الله — ستتمكن من المساهمة في مشاريع الصدقة الجارية
          </p>
        </FadeIn>
      </div>
    </FadeIn>
  );
}