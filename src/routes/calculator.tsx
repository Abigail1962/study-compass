import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/calculator")({
  component: CalculatorPage,
});

function CalculatorPage() {
  const [tuition, setTuition] = useState(20000);
  const [rent, setRent] = useState(800);
  const [food, setFood] = useState(400);
  const [other, setOther] = useState(200);
  const [years, setYears] = useState(4);

  const annual = tuition + (rent + food + other) * 12;
  const total = annual * years;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const fields: { label: string; value: number; set: (n: number) => void; suffix: string }[] = [
    { label: "Tuition per year", value: tuition, set: setTuition, suffix: "/ year" },
    { label: "Rent per month", value: rent, set: setRent, suffix: "/ month" },
    { label: "Food per month", value: food, set: setFood, suffix: "/ month" },
    { label: "Other expenses per month", value: other, set: setOther, suffix: "/ month" },
    { label: "Number of years", value: years, set: setYears, suffix: "years" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Cost Calculator</h1>
        <p className="mt-3 text-muted-foreground">Estimate the total cost of your studies.</p>

        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            {fields.map((f) => (
              <div key={f.label}>
                <label className="block text-sm font-medium text-foreground">{f.label}</label>
                <div className="mt-1.5 flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                  <input
                    type="number"
                    min={0}
                    value={f.value}
                    onChange={(e) => f.set(Number(e.target.value) || 0)}
                    className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                  />
                  <span className="px-3 text-xs text-muted-foreground">{f.suffix}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-8 h-fit">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Annual cost
            </h2>
            <p className="mt-2 text-4xl font-bold text-card-foreground">{fmt(annual)}</p>

            <div className="my-6 h-px bg-border" />

            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Total cost ({years} {years === 1 ? "year" : "years"})
            </h2>
            <p className="mt-2 text-4xl font-bold text-primary">{fmt(total)}</p>

            <p className="mt-6 text-xs text-muted-foreground">
              Estimates only. Actual costs vary by city, program, and lifestyle.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
