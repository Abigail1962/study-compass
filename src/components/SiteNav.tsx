import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

export function SiteNav() {
  const linkCls =
    "text-sm font-semibold text-muted-foreground hover:text-primary transition-all relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full py-1";
  const activeCls = "text-primary after:w-full";

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground group">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground transition-transform group-hover:rotate-12">
            <Compass className="h-5 w-5" />
          </div>
          Study<span className="text-primary font-black">Compass</span>
        </Link>
        
        <nav className="hidden md:flex gap-8 items-center">
          <Link to="/" className={linkCls} activeProps={{ className: activeCls }} activeOptions={{ exact: true }}>
            Home
          </Link>
          <Link to="/compare" className={linkCls} activeProps={{ className: activeCls }}>
            Compare
          </Link>
          <Link to="/schools" className={linkCls} activeProps={{ className: activeCls }}>
            Schools
          </Link>
          <Link to="/calculator" className={linkCls} activeProps={{ className: activeCls }}>
            Calculator
          </Link>
        </nav>

        <div className="md:hidden">
          {/* Mobile menu toggle could go here, but keeping it simple for now */}
          <Compass className="h-6 w-6 text-primary" />
        </div>
      </div>
    </header>
  );
}
