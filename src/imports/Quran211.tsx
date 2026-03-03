import imgVector from "figma:asset/4d79b8ea16b51462ba3ef8f64d59e57c8183c74d.png";

function Group() {
  return (
    <div className="absolute contents inset-[23.5%_24.36%_25.21%_24.36%]" data-name="Group">
      <div className="absolute inset-[23.5%_24.36%_25.21%_24.36%]" data-name="Vector">
        <img alt="" className="absolute block max-w-none size-full" height="120" src={imgVector} width="120" />
      </div>
    </div>
  );
}

export default function Quran() {
  return (
    <div className="relative size-full" data-name="quran (2) 1 1">
      <Group />
    </div>
  );
}