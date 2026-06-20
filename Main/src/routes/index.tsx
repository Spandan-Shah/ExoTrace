import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Rocket,
  Radar,
  BrainCircuit,
  Orbit,
  Waves,
  FileDown,
  ArrowRight,
  Telescope,
  Activity,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import heroImg from "@/assets/space-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ExoTrace Transit Detection Dashboard — Detect Exoplanets in TESS Data" },
      {
        name: "description",
        content:
          "Launch an AI pipeline that finds exoplanet transit signals hidden in noisy TESS light curves: preprocessing, BLS detection, phase folding, and neural vetting.",
      },
      { property: "og:title", content: "ExoTrace Transit Detection Dashboard" },
      {
        property: "og:description",
        content: "AI-powered exoplanet transit detection from noisy TESS light curves.",
      },
      { property: "og:image", content: heroImg },
      { name: "twitter:image", content: heroImg },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Waves, title: "Smart Preprocessing", desc: "Sigma-clipping and detrending strip systematics and stellar noise from raw flux." },
  { icon: Radar, title: "BLS Transit Search", desc: "Box Least Squares periodogram surfaces periodic dips with sub-day precision." },
  { icon: Orbit, title: "Phase Folding", desc: "Fold on the best period to reveal the characteristic U-shaped transit." },
  { icon: BrainCircuit, title: "Neural Vetting", desc: "A classifier separates real planets from binaries, blends, and artifacts." },
  { icon: Activity, title: "Parameter Fit", desc: "Recover orbital period, duration, depth and SNR with confidence bands." },
  { icon: FileDown, title: "Mission Reports", desc: "Export CSV, publication plots and a 3-page vetting report in one click." },
];

function Landing() {
  return (
    <div className="star-field min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroImg}
          alt="Galaxy with an exoplanet transiting a distant star"
          width={1920}
          height={1080}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              <Telescope className="h-4 w-4" /> TESS Light Curve Analysis
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-6xl">
              Find new worlds in the <span className="text-gradient">noise of starlight</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              ExoTrace Transit Detection Dashboard detects exoplanet transit signals buried in noisy TESS
              photometry — from raw flux to a fully vetted planet candidate.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="xl" variant="hero">
                <Link to="/dashboard">
                  <Rocket className="h-5 w-5" /> Launch Detection Pipeline
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link to="/dashboard/upload">
                  Upload Light Curve <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Live stat strip */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard label="Predicted Class" value="Planet" accent="violet" hint="Exoplanet Transit" />
            <MetricCard label="Confidence" value="91.4" unit="%" accent="cyan" hint="High confidence" />
            <MetricCard label="Orbital Period" value="3.42" unit="d" accent="cyan" hint="Best BLS period" />
            <MetricCard label="SNR" value="12.8" unit="σ" accent="success" hint="Above threshold" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            The Pipeline
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            Seven stages, one verdict
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every step is observable in the mission console — inspect the data at each stage.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass-card group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:glow-violet"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-cosmic opacity-90">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="glass-card relative overflow-hidden rounded-3xl px-6 py-16 text-center glow-cyan">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gradient-cosmic opacity-20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-gradient-violet opacity-20 blur-3xl" />
          <h2 className="relative font-display text-3xl font-bold sm:text-4xl">
            Ready to vet your first candidate?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-muted-foreground">
            Drop in a TESS light curve or load a sample target and run the full detection pipeline.
          </p>
          <Button asChild size="xl" variant="hero" className="relative mt-8">
            <Link to="/dashboard">
              <Rocket className="h-5 w-5" /> Launch Detection Pipeline
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6">
          ExoTrace Transit Detection Dashboard · Built for the hackathon · Sample data shown
        </div>
      </footer>
    </div>
  );
}
