import { Menu as MenuIcon, ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { useMenu } from "./ui/MenuContext";

interface AppBarProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  showSearch?: boolean;
  onSearch?: () => void;
  variant?: "default" | "primary";
}

export function AppBar({
  title,
  showBack = false,
  showMenu = false,
  showSearch = false,
  onSearch,
  variant = "default",
}: AppBarProps) {
  const navigate = useNavigate();
  const { toggleMenu } = useMenu();

  const bgClass = variant === "primary"
    ? "bg-primary text-primary-foreground"
    : "bg-background";
  const iconClass = variant === "primary"
    ? "text-primary-foreground/70 hover:text-primary-foreground"
    : "text-text-secondary hover:text-text-primary";
  const titleClass = variant === "primary"
    ? "text-white"
    : "text-text-primary";

  return (
    <header className={`sticky top-0 z-40 ${bgClass}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1 min-w-[40px]">
          {showSearch && (
            <button className={`p-1.5 rounded-full transition-colors ${iconClass}`} onClick={onSearch}>
              <Search size={20} />
            </button>
          )}
        </div>

        <h2 className={`flex-1 text-center font-['Cairo'] ${titleClass}`}>{title}</h2>

        <div className="flex items-center gap-1 min-w-[40px] justify-end">
          {showBack && (
            <button
              className={`p-1.5 rounded-full transition-colors ${iconClass}`}
              onClick={() => navigate(-1)}
            >
              <ArrowRight size={20} />
            </button>
          )}
          {showMenu && (
            <button
              className={`p-1.5 rounded-full transition-colors ${iconClass} border-none cursor-pointer bg-transparent`}
              onClick={toggleMenu}
            >
              <MenuIcon size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}