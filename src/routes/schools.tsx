import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { MapPin, GraduationCap, Sparkles, Globe, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/schools")({
  component: SchoolsPage,
});

type Region = "Asia" | "North America";
type School = {
  id: number;
  name: string;
  region: Region;
  country: string;
  strength: string;
  best_for: string;
};

function SchoolsPage() {
  const [filter, setFilter] = useState<"All" | Region>("All");

  const { data: schools, isLoading, error } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as School[];
    }
  });

  const filtered = !schools 
    ? [] 
    : filter === "All" 
      ? schools 
      : schools.filter((s) => s.region === filter);

  return (
    <div className="min-h-screen bg-background mesh-gradient">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-fade-in-up">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Elite Universities
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              Discover world-class institutions across two dynamic continents.
            </p>
          </div>

          <div className="flex gap-2 p-1.5 glass rounded-2xl w-fit">
            {(["All", "Asia", "North America"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all " +
                  (filter === f
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/40")
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-primary">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p className="font-medium">Loading universities...</p>
          </div>
        ) : error ? (
          <div className="glass p-12 rounded-3xl text-center max-w-lg mx-auto">
            <p className="text-destructive font-bold mb-2">Error Loading Data</p>
            <p className="text-muted-foreground text-sm">Please check your Supabase connection and .env file.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((s, i) => (
              <article
                key={s.id}
                style={{ animationDelay: `${i * 100}ms` }}
                className="group hover-lift glass rounded-3xl p-8 transition-all animate-fade-in-up"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="bg-primary/10 p-3 rounded-2xl">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                    {s.region}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                  {s.name}
                </h2>
                
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6 font-medium">
                  <MapPin className="h-4 w-4" />
                  {s.country}
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="h-3 w-3" />
                      Key Strengths
                    </div>
                    <p className="text-sm text-foreground/80 font-medium leading-relaxed">
                      {s.strength}
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                      <Globe className="h-3 w-3" />
                      Best For
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      "{s.best_for}"
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
