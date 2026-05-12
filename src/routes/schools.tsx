import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { MapPin, GraduationCap, Sparkles, Globe, Loader2, Info, X, Trophy } from "lucide-react";
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
  key_strengths: string;
  best_for: string;
  image_url?: string;
  logo_url?: string;
  ranking?: string;
  description?: string;
};

function SchoolsPage() {
  const [filter, setFilter] = useState<"All" | Region>("All");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

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
                className="group hover-lift glass rounded-3xl overflow-hidden transition-all animate-fade-in-up flex flex-col h-full"
              >
                {/* School Image Header with Logo Overlay */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={s.image_url || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe1?auto=format&fit=crop&q=80'} 
                    alt={s.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Floating Logo */}
                  {s.logo_url && (
                    <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-white/90 backdrop-blur-md p-2 shadow-xl border border-white/20 transform -translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <img src={s.logo_url} alt="logo" className="w-full h-full object-contain" />
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                      {s.region}
                    </span>
                    {s.ranking && (
                      <div className="flex items-center gap-1 text-white text-[10px] font-bold">
                        <Trophy className="h-3 w-3 text-amber-400" />
                        {s.ranking}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Inline Logo for context */}
                    {s.logo_url && (
                      <img src={s.logo_url} alt="logo" className="w-6 h-6 object-contain opacity-80" />
                    )}
                    <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">
                      {s.name}
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6 font-medium">
                    <MapPin className="h-4 w-4" />
                    {s.country}
                  </div>

                  <div className="space-y-6 flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="h-3 w-3" />
                        Key Strengths
                      </div>
                      <p className="text-sm text-foreground/80 font-medium leading-relaxed line-clamp-2">
                        {s.key_strengths}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedSchool(s)}
                    className="mt-8 w-full py-3 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2"
                  >
                    <Info className="h-4 w-4" />
                    View Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* School Detail Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setSelectedSchool(null)} />
          <div className="relative glass w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setSelectedSchool(null)}
              className="absolute top-6 right-6 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="h-72 relative">
              <img 
                src={selectedSchool.image_url || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe1?auto=format&fit=crop&q=80'} 
                alt={selectedSchool.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              
              {/* Large Logo in Modal */}
              {selectedSchool.logo_url && (
                <div className="absolute bottom-0 left-10 transform translate-y-1/2 w-24 h-24 rounded-3xl bg-white p-4 shadow-2xl border border-white/20">
                  <img src={selectedSchool.logo_url} alt="logo" className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            <div className="p-10 pt-16 relative bg-background/90 backdrop-blur-2xl rounded-t-[3rem]">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase">
                  {selectedSchool.region}
                </span>
                {selectedSchool.ranking && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                    <Trophy className="h-3 w-3" />
                    {selectedSchool.ranking}
                  </span>
                )}
              </div>

              <h2 className="text-4xl font-bold mb-2 tracking-tight">{selectedSchool.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground mb-8">
                <MapPin className="h-5 w-5" />
                <span className="font-medium text-lg">{selectedSchool.country}</span>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-3 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    Expertise
                  </div>
                  <p className="text-foreground leading-relaxed font-semibold">
                    {selectedSchool.key_strengths}
                  </p>
                </div>
                <div className="space-y-3 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                  <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider">
                    <Globe className="h-3 w-3" />
                    Best For
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{selectedSchool.best_for}"
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-6">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <Info className="h-3 w-3" />
                  About Institution
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedSchool.description || 'Information about the university campus, research facilities, and student life.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
