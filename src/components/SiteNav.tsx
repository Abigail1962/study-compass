import { Link } from "@tanstack/react-router";
import { Compass, LogIn, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

export function SiteNav() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
          <Link to="/admin" className={linkCls} activeProps={{ className: activeCls }}>
            Admin
          </Link>

          <div className="h-4 w-px bg-white/20 ml-4 mr-2" />

          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                  <User className="h-4 w-4" />
                </div>
                <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
        </nav>

        <div className="md:hidden">
          <Compass className="h-6 w-6 text-primary" />
        </div>
      </div>
    </header>
  );
}
