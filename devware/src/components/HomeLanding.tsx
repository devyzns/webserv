import { useUniqueVisitCounter } from "@/hooks/useUniqueVisitCounter";

interface HomeLandingProps {
  onEnterOilEmpire: () => void;
}

const featureCards = [
  {
    eyebrow: "/sellgas",
    title: "Plan every sell",
    copy: "Jump into gas math fast, compare outcomes, and stop guessing your next cashout.",
  },
  {
    eyebrow: "/oilearnings",
    title: "Track oil growth",
    copy: "See how much oil you are making per second and plan upgrades around real numbers.",
  },
  {
    eyebrow: "/layout",
    title: "Design clean layouts",
    copy: "Open the layout designer from one button and map out the build before spending cash.",
  },
];

const toolChips = ["/sellgas", "/oilearnings", "/timetooil", "/buytime", "/layout"];

function formatVisits(totalUniqueVisitors: number | null) {
  if (totalUniqueVisitors === null) return "--";
  return new Intl.NumberFormat().format(totalUniqueVisitors);
}

export default function HomeLanding({ onEnterOilEmpire }: HomeLandingProps) {
  const { totalUniqueVisitors, countedVisit, loading, error } = useUniqueVisitCounter("oil-empire");

  const visitHint = error
    ? "Counter offline until the database and Vercel function are live."
    : loading
      ? "Counting each device once."
      : countedVisit
        ? "This device just counted once."
        : "This device is already in the total.";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl border border-red-500/30 bg-[linear-gradient(135deg,rgba(115,10,10,0.92),rgba(15,15,15,0.96))] flex items-center justify-center shadow-[0_0_25px_rgba(255,70,70,0.2)]">
              <span className="text-lg font-black tracking-[0.35em] text-red-100 pl-1">DV</span>
            </div>
            <div className="absolute -inset-1 rounded-[1.25rem] border border-red-400/10 animate-halo-spin" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-red-200/60">Made by devyzns</p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-[0.25em] text-white">DEVWARES</h1>
          </div>
        </div>

        <div className="self-start sm:self-auto rounded-full border border-red-500/20 bg-black/35 px-4 py-2 text-xs uppercase tracking-[0.28em] text-red-100/70 backdrop-blur">
          Oil Empire exclusive
        </div>
      </header>

      <div className="grid xl:grid-cols-[1.08fr_0.92fr] gap-6">
        <section className="hero-panel rounded-[2rem] p-6 sm:p-8 animate-slide-up">
          <div className="inline-flex items-center rounded-full border border-red-500/20 bg-red-950/30 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-red-100/75">
            Roblox tools hub
          </div>

          <div className="mt-5 max-w-3xl">
            <h2 className="text-4xl sm:text-6xl font-black leading-[0.95] tracking-[0.08em] text-white text-balance">
              One main page. One Oil Empire button. Everything you need behind it.
            </h2>
            <p className="mt-5 max-w-2xl text-sm sm:text-base leading-7 text-zinc-300">
              Launch straight into your Oil Empire workspace with every calculator and the layout designer in one place.
              The homepage stays clean, the tools stay exclusive to Oil Empire, and the visit counter only counts each
              device once.
            </p>
          </div>

          <div className="mt-8 flex flex-col lg:flex-row gap-3">
            <button
              onClick={onEnterOilEmpire}
              className="hero-cta group flex-1 rounded-[1.5rem] px-5 py-4 text-left"
            >
              <span className="block text-xs uppercase tracking-[0.35em] text-red-100/70">Oil Empire</span>
              <span className="mt-2 block text-2xl font-black tracking-[0.12em] text-white">
                Open calculators + layout designer
              </span>
              <span className="mt-3 inline-flex items-center gap-2 text-sm text-red-100/80 transition-transform duration-200 group-hover:translate-x-1">
                Enter workspace
                <span aria-hidden="true">-&gt;</span>
              </span>
            </button>

            <div className="card-glass rounded-[1.5rem] px-5 py-4 lg:max-w-xs">
              <p className="text-[11px] uppercase tracking-[0.32em] text-red-200/55">Credits</p>
              <p className="mt-3 text-2xl font-black tracking-[0.14em] text-white">devyzns</p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Animated home screen, hover-heavy cards, and one focused game workspace.
              </p>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            <div className="metric-card rounded-[1.35rem] p-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-red-100/50">Unique device visits</p>
              <p className="mt-3 text-3xl font-black tracking-[0.14em] text-white animate-number-pop">
                {formatVisits(totalUniqueVisitors)}
              </p>
              <p className="mt-2 text-xs leading-5 text-zinc-400">{visitHint}</p>
            </div>

            <div className="metric-card rounded-[1.35rem] p-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-red-100/50">Main page flow</p>
              <p className="mt-3 text-3xl font-black tracking-[0.14em] text-white">1 click</p>
              <p className="mt-2 text-xs leading-5 text-zinc-400">Home page funnels into the full Oil Empire tools page.</p>
            </div>

            <div className="metric-card rounded-[1.35rem] p-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-red-100/50">Exclusive section</p>
              <p className="mt-3 text-3xl font-black tracking-[0.14em] text-white">5 tools</p>
              <p className="mt-2 text-xs leading-5 text-zinc-400">Sell gas, oil earnings, time to oil, buy time, and layout design.</p>
            </div>
          </div>
        </section>

        <section className="hero-panel rounded-[2rem] p-6 sm:p-7 animate-slide-up">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-red-100/55">Preview</p>
              <h3 className="mt-2 text-2xl font-black tracking-[0.16em] text-white">Oil Empire Suite</h3>
            </div>
            <div className="rounded-full border border-red-500/20 bg-red-950/25 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-red-100/70">
              live hover
            </div>
          </div>

          <div className="relative mt-6 min-h-[22rem]">
            <div className="absolute inset-0 rounded-[1.75rem] border border-red-500/20 bg-[radial-gradient(circle_at_top,rgba(255,80,80,0.18),rgba(15,15,15,0.88)_55%)]" />
            <div className="absolute inset-4 rounded-[1.5rem] border border-white/5 bg-black/45 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.04),transparent)] animate-sheen-slide" />
              <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-red-100/45">home to tools</p>
                  <p className="mt-1 text-lg font-bold tracking-[0.16em] text-white">Enter Oil Empire</p>
                </div>
                <div className="rounded-full border border-red-500/20 bg-red-950/35 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-red-100/70">
                  one route
                </div>
              </div>

              <div className="absolute left-5 right-5 bottom-5 grid grid-cols-2 gap-3">
                {toolChips.map((tool, index) => (
                  <div
                    key={tool}
                    className="float-card rounded-2xl border border-white/8 bg-black/55 px-4 py-4 shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
                    style={{ animationDelay: `${index * 0.55}s` }}
                  >
                    <p className="text-[11px] uppercase tracking-[0.28em] text-red-100/45">tool</p>
                    <p className="mt-2 text-lg font-black tracking-[0.16em] text-white">{tool}</p>
                    <div className="mt-3 h-1.5 rounded-full bg-red-950/70 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-red-300 animate-progress-flow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6 grid md:grid-cols-3 gap-4">
        {featureCards.map((card, index) => (
          <article
            key={card.title}
            className="feature-card rounded-[1.5rem] p-5 animate-slide-up"
            style={{ animationDelay: `${0.08 * index}s` }}
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-red-100/45">{card.eyebrow}</p>
            <h3 className="mt-3 text-xl font-black tracking-[0.12em] text-white">{card.title}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{card.copy}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
