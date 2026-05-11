import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { ArrowRight, Calculator } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Study Compass — Asia vs North America" },
      {
        name: "description",
        content:
          "Compare studying in Asia and North America by cost, academics, career opportunities, and lifestyle. Free cost calculator included.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background mesh-gradient relative overflow-hidden">
      <SiteNav />
      
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-24 md:py-40 flex flex-col items-center text-center">
        <div className="animate-fade-in-up [animation-delay:200ms]">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-8 border border-primary/20 backdrop-blur-sm">
            Empowering International Students
          </span>
        </div>
        
        <h1 className="animate-fade-in-up [animation-delay:400ms] text-5xl md:text-8xl font-bold tracking-tight text-foreground leading-[1.1]">
          Find Your <span className="text-primary">Global</span> Path
        </h1>
        
        <p className="animate-fade-in-up [animation-delay:600ms] mt-8 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          This website helps students compare studying in Asia and North America based on 
          <span className="text-foreground font-medium"> cost, academics, career opportunities,</span> and 
          <span className="text-foreground font-medium"> lifestyle</span>.
        </p>
        
        <div className="animate-fade-in-up [animation-delay:800ms] mt-12 flex flex-wrap justify-center gap-6">
          <Link
            to="/compare"
            className="group hover-lift inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90"
          >
            Compare Now
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/calculator"
            className="hover-lift glass inline-flex items-center justify-center rounded-full px-8 py-4 text-lg font-semibold text-foreground shadow-lg transition-all hover:bg-white/50"
          >
            <Calculator className="mr-2 h-5 w-5" />
            Cost Calculator
          </Link>
        </div>

        <div className="animate-fade-in-up [animation-delay:1000ms] mt-32 grid sm:grid-cols-3 gap-8 text-left w-full">
          {[
            { 
              t: "Cost Analysis", 
              d: "Detailed breakdown of tuition fees and living expenses across regions.",
              icon: "💰"
            },
            { 
              t: "Academic Excellence", 
              d: "Compare world-class universities and their research strengths.",
              icon: "🎓"
            },
            { 
              t: "Career Growth", 
              d: "Insights into job markets, internships, and global opportunities.",
              icon: "🚀"
            },
          ].map((c) => (
            <div key={c.t} className="hover-lift glass rounded-2xl p-8 transition-all">
              <div className="text-3xl mb-4">{c.icon}</div>
              <h3 className="text-xl font-bold text-foreground mb-3">{c.t}</h3>
              <p className="text-muted-foreground leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Decorative blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-0" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -z-0" />
    </div>
  );
}
