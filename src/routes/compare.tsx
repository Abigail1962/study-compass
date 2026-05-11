import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { CheckCircle2, Info, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

// Map string values to numeric scores for the chart
const scoreValue = (val: string) => {
  const v = val.toLowerCase();
  if (v.includes("high") || v.includes("expensive") || v.includes("top")) return 90;
  if (v.includes("moderate") || v.includes("medium")) return 60;
  if (v.includes("low") || v.includes("affordable")) return 30;
  return 50;
};

export const Route = createFileRoute("/compare")({
  component: ComparePage,
});

type ComparisonRow = {
  id: number;
  factor: string;
  asia_value: string;
  na_value: string;
  icon: string;
  display_order: number;
};

function ComparePage() {
  const { data: rows, isLoading, error } = useQuery({
    queryKey: ['comparison_factors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comparison_factors')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as ComparisonRow[];
    }
  });

  const chartData = rows?.map(r => ({
    name: r.factor,
    Asia: scoreValue(r.asia_value),
    "North America": scoreValue(r.na_value)
  })) || [];

  return (
    <div className="min-h-screen bg-background mesh-gradient">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Regional Comparison
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A side-by-side overview of the key factors influencing your study abroad decision.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-primary">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p className="font-medium">Loading comparison data...</p>
          </div>
        ) : error ? (
          <div className="glass p-12 rounded-3xl text-center max-w-lg mx-auto">
            <p className="text-destructive font-bold mb-2">Error Loading Data</p>
            <p className="text-muted-foreground text-sm">Please check your Supabase connection and .env file.</p>
          </div>
        ) : (
          <div className="space-y-12 animate-fade-in-up [animation-delay:200ms]">
            {/* Visual Comparison Chart */}
            <div className="glass rounded-3xl p-8 shadow-xl border border-white/20">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Visual Comparison Index
              </h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
                    />
                    <YAxis hide />
                    <RechartsTooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.8)', 
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend iconType="circle" />
                    <Bar name="Asia" dataKey="Asia" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                    <Bar name="North America" dataKey="North America" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-primary/5">
                    <th className="px-8 py-6 text-sm font-bold uppercase tracking-wider text-primary">Factor</th>
                    <th className="px-8 py-6 text-sm font-bold uppercase tracking-wider text-primary">Asia</th>
                    <th className="px-8 py-6 text-sm font-bold uppercase tracking-wider text-primary">North America</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows?.map((row) => (
                    <tr key={row.id} className="group hover:bg-white/30 transition-colors">
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{row.icon}</span>
                          <span className="font-bold text-foreground text-lg">{row.factor}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="text-muted-foreground font-medium">{row.asia_value}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="mt-1 h-4 w-4 text-blue-500 shrink-0" />
                          <span className="text-muted-foreground font-medium">{row.na_value}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}

        <div className="mt-12 glass p-6 rounded-2xl flex items-center gap-4 animate-fade-in-up [animation-delay:400ms]">
          <div className="bg-primary/10 p-3 rounded-xl">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Values are general estimates based on current trends. Specific costs and opportunities vary by country, city, and university.
          </p>
        </div>
      </main>
    </div>
  );
}
