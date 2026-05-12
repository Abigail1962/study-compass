import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteNav } from "@/components/SiteNav";
import {
  MapPin, GraduationCap, Sparkles, Globe, Loader2, Info, X, Trophy,
  Star, MessageSquare, Send, LogIn, CheckCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";

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

type Review = {
  id: number;
  school_id: number;
  user_id: string;
  major: string;
  graduation_year?: number;
  rating: number;
  review_text: string;
  career_outcome?: string;
  is_approved: boolean;
  created_at: string;
};

type ReviewForm = {
  major: string;
  graduation_year: string;
  rating: number;
  review_text: string;
  career_outcome: string;
};

const BLANK_FORM: ReviewForm = {
  major: "",
  graduation_year: "",
  rating: 5,
  review_text: "",
  career_outcome: "",
};

const schoolImages: Record<string, string> = {
  // Hong Kong
  HKU:   'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?auto=format&fit=crop&q=80&w=800',
  HKUST: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&q=80&w=800',
  // Singapore
  NUS: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=800',
  NTU: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&q=80&w=800',
  // Canada
  'University of Waterloo': 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800',
  UBC: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800',
  'University of Toronto': 'https://images.unsplash.com/photo-1569012871812-f38ee64cd54c?auto=format&fit=crop&q=80&w=800',
  McGill: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',
};

const schoolDescriptions: Record<string, string> = {
  HKUST:
    "Hong Kong University of Science and Technology is a world-class research university known for its entrepreneurial culture and strong industry ties. Perched above Clear Water Bay with panoramic sea views, HKUST offers a vibrant international community and has incubated some of Asia's most successful tech startups.",
  HKU:
    "Founded in 1911, the University of Hong Kong is the city's oldest and most prestigious institution. Its rich academic tradition spans law, medicine, and liberal arts, drawing students from over 100 countries. The Pokfulam campus blends historic colonial architecture with state-of-the-art research facilities.",
  NUS:
    "The National University of Singapore consistently ranks as Asia's top university. With deep ties to Singapore's world-class finance, biotech, and tech sectors, NUS offers unparalleled research opportunities and an alumni network spanning 100+ countries. Its university town campus feels like a city of its own.",
  NTU:
    "Nanyang Technological University is a young, fast-rising institution known for its bold interdisciplinary approach. Its award-winning eco-friendly campus is home to world-leading AI, sustainability, and engineering research groups, and the university has partnerships with hundreds of global companies.",
  "University of Waterloo":
    "The University of Waterloo's co-operative education program is legendary — students alternate academic terms with paid work placements at companies like Google, Microsoft, and Amazon. Its computer science, mathematics, and engineering programs consistently produce some of North America's most sought-after graduates.",
  UBC:
    "The University of British Columbia sits on a stunning peninsula surrounded by mountains and ocean in Vancouver. Known for world-class research in sustainability, life sciences, and creative arts, UBC's diverse campus of 70,000 students creates a uniquely cosmopolitan academic environment with strong Pacific Rim connections.",
  "University of Toronto":
    "The University of Toronto is Canada's leading research powerhouse and a global top-20 university. Home to Geoffrey Hinton's deep learning breakthroughs, U of T has become synonymous with AI research. Its three-campus system in one of the world's most multicultural cities offers unmatched academic breadth.",
  McGill:
    "McGill University blends the intellectual rigour of an Ivy League institution with the vibrant cultural energy of Montreal. Known for its medical school and top-ranked law and music programs, McGill attracts ambitious students who thrive in a bilingual city that seamlessly mixes European charm with North American energy.",
};

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "h-7 w-7" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${cls} ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
        />
      ))}
    </div>
  );
}

function SchoolsPage() {
  const [filter, setFilter] = useState<"All" | Region>("All");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewForm>(BLANK_FORM);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const { data: schools, isLoading, error } = useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("*").order("name");
      if (error) throw error;
      return data as School[];
    },
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", selectedSchool?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("school_id", selectedSchool!.id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
    enabled: !!selectedSchool,
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("Not logged in");
      const { error } = await supabase.from("reviews").insert({
        school_id: selectedSchool!.id,
        user_id: session.user.id,
        major: reviewForm.major,
        graduation_year: reviewForm.graduation_year ? parseInt(reviewForm.graduation_year) : null,
        rating: reviewForm.rating,
        review_text: reviewForm.review_text,
        career_outcome: reviewForm.career_outcome || null,
        is_approved: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", selectedSchool?.id] });
      setReviewForm(BLANK_FORM);
      setShowReviewForm(false);
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 6000);
    },
  });

  const handleCloseModal = () => {
    setSelectedSchool(null);
    setShowReviewForm(false);
    setReviewSubmitted(false);
    setReviewForm(BLANK_FORM);
  };

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : null;

  const filtered = !schools
    ? []
    : filter === "All"
    ? schools
    : schools.filter((s) => s.region === filter);

  return (
    <div className="min-h-screen bg-background mesh-gradient">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-6 py-20">
        {/* Header */}
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

        {/* School grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-primary">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p className="font-medium">Loading universities...</p>
          </div>
        ) : error ? (
          <div className="glass p-12 rounded-3xl text-center max-w-lg mx-auto">
            <p className="text-destructive font-bold mb-2">Error Loading Data</p>
            <p className="text-muted-foreground text-sm">
              Please check your Supabase connection and .env file.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((s, i) => (
              <article
                key={s.id}
                style={{ animationDelay: `${i * 100}ms` }}
                className="group hover-lift glass rounded-3xl overflow-hidden transition-all animate-fade-in-up flex flex-col h-full"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      s.image_url ||
                      schoolImages[s.name] ||
                      "https://images.unsplash.com/photo-1541339907198-e08756ebafe1?auto=format&fit=crop&q=80"
                    }
                    alt={s.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
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
                    {s.logo_url && (
                      <img
                        src={s.logo_url}
                        alt="logo"
                        className="w-6 h-6 object-contain opacity-80"
                      />
                    )}
                    <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">
                      {s.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6 font-medium">
                    <MapPin className="h-4 w-4" />
                    {s.country}
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="h-3 w-3" />
                      Key Strengths
                    </div>
                    <p className="text-sm text-foreground/80 font-medium leading-relaxed line-clamp-2">
                      {s.key_strengths}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSchool(s)}
                    className="mt-8 w-full py-3 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2"
                  >
                    <Info className="h-4 w-4" />
                    View Details & Reviews
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ── Modal ── */}
      {selectedSchool && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={handleCloseModal}
          />
          <div className="relative glass w-full max-w-3xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Fixed image header */}
            <div className="h-60 relative flex-shrink-0">
              <img
                src={
                  selectedSchool.image_url ||
                  schoolImages[selectedSchool.name] ||
                  "https://images.unsplash.com/photo-1541339907198-e08756ebafe1?auto=format&fit=crop&q=80"
                }
                alt={selectedSchool.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              {selectedSchool.logo_url && (
                <div className="absolute bottom-0 left-10 transform translate-y-1/2 w-20 h-20 rounded-2xl bg-white p-3 shadow-2xl border border-white/20">
                  <img
                    src={selectedSchool.logo_url}
                    alt="logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-10 pb-10 pt-14 bg-background/90 backdrop-blur-2xl">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase">
                  {selectedSchool.region}
                </span>
                {selectedSchool.ranking && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                    <Trophy className="h-3 w-3" />
                    {selectedSchool.ranking}
                  </span>
                )}
                {avgRating !== null && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-600 text-[10px] font-bold">
                    <Star className="h-3 w-3 fill-amber-400" />
                    {avgRating.toFixed(1)} · {reviews!.length} review
                    {reviews!.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <h2 className="text-4xl font-bold mb-2 tracking-tight">{selectedSchool.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground mb-8">
                <MapPin className="h-5 w-5" />
                <span className="font-medium text-lg">{selectedSchool.country}</span>
              </div>

              {/* Key info grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
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

              {/* Description */}
              <div className="space-y-3 pb-8 border-b border-border/30">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <Info className="h-3 w-3" />
                  About
                </div>
                <p className="text-muted-foreground leading-relaxed text-base">
                  {schoolDescriptions[selectedSchool.name] ||
                    selectedSchool.description ||
                    "Detailed information about this institution coming soon."}
                </p>
              </div>

              {/* ── Reviews Section ── */}
              <div className="pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-xl text-foreground">Student Reviews</h3>
                  </div>
                  {avgRating !== null && (
                    <div className="flex items-center gap-2">
                      <StarRow rating={Math.round(avgRating)} size="md" />
                      <span className="font-bold text-foreground">{avgRating.toFixed(1)}</span>
                      <span className="text-muted-foreground text-sm">({reviews!.length})</span>
                    </div>
                  )}
                </div>

                {/* Review list */}
                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin h-6 w-6 text-primary" />
                  </div>
                ) : reviews && reviews.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="p-5 rounded-2xl bg-muted/30 border border-border/30"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground text-sm">
                              {r.major}
                            </span>
                            {r.graduation_year && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                Class of {r.graduation_year}
                              </span>
                            )}
                          </div>
                          <StarRow rating={r.rating} size="sm" />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {r.review_text}
                        </p>
                        {r.career_outcome && (
                          <p className="mt-3 text-xs text-primary font-semibold flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5" />
                            {r.career_outcome}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 mb-4">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No reviews yet.</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">
                      Be the first to share your experience!
                    </p>
                  </div>
                )}

                {/* Success banner */}
                {reviewSubmitted && (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-sm font-medium mb-4">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    Review submitted! Thank you for sharing your experience.
                  </div>
                )}

                {/* CTA: logged-in vs guest */}
                {session ? (
                  showReviewForm ? (
                    <div className="space-y-5 p-6 rounded-2xl border border-primary/20 bg-primary/5">
                      <h4 className="font-bold text-foreground">Share Your Experience</h4>

                      {/* Star picker */}
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Rating
                        </label>
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                            >
                              <Star
                                className={`h-7 w-7 transition-colors ${
                                  n <= reviewForm.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground/30 hover:text-amber-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Major */}
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Major / Program *
                        </label>
                        <input
                          type="text"
                          value={reviewForm.major}
                          onChange={(e) =>
                            setReviewForm((f) => ({ ...f, major: e.target.value }))
                          }
                          placeholder="e.g. Computer Science"
                          className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Graduation Year
                          </label>
                          <input
                            type="number"
                            value={reviewForm.graduation_year}
                            onChange={(e) =>
                              setReviewForm((f) => ({ ...f, graduation_year: e.target.value }))
                            }
                            placeholder="e.g. 2024"
                            min={2000}
                            max={2035}
                            className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Career Outcome
                          </label>
                          <input
                            type="text"
                            value={reviewForm.career_outcome}
                            onChange={(e) =>
                              setReviewForm((f) => ({ ...f, career_outcome: e.target.value }))
                            }
                            placeholder="e.g. SWE at Google"
                            className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>

                      {/* Review text */}
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Your Review *
                        </label>
                        <textarea
                          value={reviewForm.review_text}
                          onChange={(e) =>
                            setReviewForm((f) => ({ ...f, review_text: e.target.value }))
                          }
                          placeholder="Share your experience — courses, campus life, professors, career support, what surprised you..."
                          rows={4}
                          className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                      </div>

                      {submitReview.isError && (
                        <p className="text-sm text-destructive font-medium">
                          Failed to submit. Please try again.
                        </p>
                      )}

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => submitReview.mutate()}
                          disabled={
                            !reviewForm.major ||
                            !reviewForm.review_text ||
                            submitReview.isPending
                          }
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                        >
                          {submitReview.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          Submit Review
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-5 rounded-xl border border-input text-sm font-medium hover:bg-accent transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(true)}
                      className="w-full py-3.5 rounded-xl border-2 border-dashed border-primary/30 text-primary text-sm font-bold hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Write a Review
                    </button>
                  )
                ) : (
                  <Link
                    to="/login"
                    className="w-full py-3.5 rounded-xl border-2 border-dashed border-muted-foreground/20 text-muted-foreground text-sm font-medium hover:bg-accent transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Log in to write a review
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
