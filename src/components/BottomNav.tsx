import { useLocation, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const tabs = [
  { path: "/", label: "Главная", icon: "Home" },
  { path: "/levels", label: "Уровни", icon: "Layers" },
  { path: "/tests", label: "Тесты", icon: "BookOpen" },
  { path: "/stats", label: "Статистика", icon: "BarChart2" },
  { path: "/profile", label: "Профиль", icon: "User" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-border max-w-md mx-auto">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${active ? "bg-primary/10" : ""}`}>
                <Icon name={tab.icon} size={20} />
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
