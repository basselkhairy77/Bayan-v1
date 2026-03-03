import svgPaths from "./svg-c6xup2tbt2";
import img1F211C8D98Bae0A23B26E97F645878A81 from "figma:asset/6c86ed91fb264e182dcdd061e57a16557d3297eb.png";
import imgQuran21 from "figma:asset/094daa11577e6ce8837f6e473ef0e452ad41b45b.png";

function ArcticonsAlQuranIndonesia() {
  return (
    <div className="absolute left-[142px] size-[100px] top-[173px]" data-name="arcticons:al-quran-indonesia">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 100">
        <g id="arcticons:al-quran-indonesia">
          <path d={svgPaths.p345eb400} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
          <path d={svgPaths.p8639d80} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
          <path d={svgPaths.p232b6e00} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
          <path d={svgPaths.p1d84b600} id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
}

function Logo() {
  return (
    <div className="absolute contents left-[132px] top-[237px]" data-name="Logo">
      <div className="absolute left-[132px] shadow-[0px_2px_57px_0px_#65d6fc] size-[120px] top-[237px]" data-name="quran (2) 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgQuran21} />
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[132px] top-[173px]">
      <ArcticonsAlQuranIndonesia />
      <Logo />
      <p className="-translate-x-1/2 absolute font-['Elgharib-:Surah_Name_V4',sans-serif] leading-[normal] left-[calc(50%+4.5px)] not-italic text-[48px] text-center text-white top-[326px]" dir="auto">
        بيان
      </p>
    </div>
  );
}

function TasksBar() {
  return (
    <div className="absolute h-[9px] left-[124px] top-[797px] w-[136px]" data-name="tasks bar">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 136 9">
        <g id="tasks bar">
          <path clipRule="evenodd" d={svgPaths.p11284800} fill="var(--fill-0, white)" fillOpacity="0.25098" fillRule="evenodd" id="tasks bar_2" />
        </g>
      </svg>
    </div>
  );
}

export default function Splash() {
  return (
    <div className="bg-white overflow-clip relative rounded-[35px] size-full" data-name="Splash">
      <div className="absolute h-[848px] left-[-68px] top-[-36px] w-[564px]" data-name="1f211c8d98bae0a23b26e97f645878a8 1">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute max-w-none object-cover opacity-99 size-full" src={img1F211C8D98Bae0A23B26E97F645878A81} />
          <div className="absolute bg-[rgba(4,41,173,0.54)] inset-0" />
        </div>
      </div>
      <Group />
      <TasksBar />
      <div className="absolute h-[312px] left-[19px] top-[-139px] w-[338px]">
        <div className="absolute inset-[-34.62%_-31.95%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 554 528">
            <g filter="url(#filter0_f_1_145)" id="Ellipse 5">
              <ellipse cx="277" cy="264" fill="url(#paint0_linear_1_145)" fillOpacity="0.5" rx="169" ry="156" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="528" id="filter0_f_1_145" width="554" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_1_145" stdDeviation="54" />
              </filter>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_145" x1="277" x2="277" y1="108" y2="420">
                <stop stopColor="#65D6FC" />
                <stop offset="1" stopColor="#5E17EB" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}