import { Link, useNavigate } from "react-router-dom";
import { FiTrendingUp } from "react-icons/fi";
import ThemeToggle from "@/components/ThemeToggle";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useAuth } from "@/context/AuthContext";

const links = [
  { id: "features", label: "Features" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
];

export default function Navbar() {
  const active = useActiveSection(links.map((link) => link.id));
  const { user } = useAuth();
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    if (window.location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-slate-50/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#050816]/85">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 font-semibold tracking-tight text-slate-950 dark:text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-cyan-300 dark:text-slate-950">
            <FiTrendingUp aria-hidden />
          </span>
          FlowPilot
        </Link>
        <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollTo(link.id)}
              className={`transition hover:text-cyan-700 dark:hover:text-cyan-200 ${
                active === link.id ? "text-cyan-700 dark:text-cyan-200" : ""
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to={user ? "/dashboard" : "/login"}
            className="hidden rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 sm:inline-flex dark:bg-cyan-300 dark:text-slate-950"
          >
            {user ? "Dashboard" : "Start Free"}
          </Link>
        </div>
      </nav>
    </header>
  );
}
