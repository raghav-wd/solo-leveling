import { NavLink, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LevelEstimationPage } from "./pages/LevelEstimationPage";
import { SettingsPage } from "./pages/SettingsPage";
import { GoalsPage } from "./pages/GoalsPage";
import { HistoryPage } from "./pages/HistoryPage";

function NavIcon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const navItems = [
  {
    to: "/",
    label: "Home",
    icon: "M3 11.5 12 4l9 7.5M6 9.5V20h12V9.5",
  },
  {
    to: "/level-estimation",
    label: "Level Estimation",
    icon: "M5 19h14M7 16V9m5 7V6m5 10v-4",
  },
  {
    to: "/settings",
    label: "Settings",
    icon: "M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5zM19 12h2M3 12h2m11.95-4.95 1.4-1.4M5.65 18.35l1.4-1.4m0-9.9-1.4-1.4m12.7 12.7-1.4-1.4M12 3v2m0 14v2",
  },
  {
    to: "/goals",
    label: "Goals",
    icon: "M5 12.5 9.5 17 19 7.5",
  },
  {
    to: "/history",
    label: "History",
    icon: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0a9 9 0 0 1 18 0z",
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6">
        <h1 className="text-xl font-semibold tracking-wide text-slate-100">
          Solo Progression System
        </h1>
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                  isActive
                    ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-100"
                    : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-slate-100"
                }`
              }
            >
              <NavIcon path={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/level-estimation" element={<LevelEstimationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
    </div>
  );
}
