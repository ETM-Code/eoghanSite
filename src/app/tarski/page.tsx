import type { Metadata } from 'next';
import Link from 'next/link';
import type { IconType } from 'react-icons';
import {
  LuActivity,
  LuBatteryCharging,
  LuBot,
  LuCheck,
  LuChartLine,
  LuCircuitBoard,
  LuCpu,
  LuGauge,
  LuHeartPulse,
  LuLayers,
  LuPlane,
  LuRadioReceiver,
  LuScanLine,
  LuSettings,
  LuSignal,
  LuTarget,
  LuWatch,
  LuZap,
} from 'react-icons/lu';

import { FlowDiagram } from '@/components/tarski/FlowDiagram';

export const metadata: Metadata = {
  title: 'Project Tarski | Eoghan Collins',
  description: 'Project Tarski — sub-watt, instant AI experiences coming soon.',
};

const upcomingMilestones = [
  { date: 'Dec 2025', goal: 'Full network simulator', icon: LuCpu },
  { date: 'Mar 2026', goal: 'Neural network demonstrator (MNIST digit recognition)', icon: LuActivity },
  { date: '2027', goal: 'Silicon prototype + pilot partnerships', icon: LuTarget },
];

const applications: { title: string; copy: string; icon: IconType }[] = [
  { title: 'Robotics', copy: 'All-day autonomous operation without recharging', icon: LuBot },
  { title: 'Wearables', copy: 'Week-long battery life with always-on AI', icon: LuWatch },
  { title: 'IoT Sensors', copy: 'Decade-long deployments on coin cells', icon: LuRadioReceiver },
  { title: 'Medical Implants', copy: 'Safe, ultra-low-power diagnostics', icon: LuHeartPulse },
  { title: 'Drones', copy: '10× flight time extension', icon: LuPlane },
];

const stack = [
  {
    title: 'Hardware',
    bullets: [
      'Design: KiCAD (schematic + PCB)',
      'Validation: ngspice (SPICE simulation)',
      'Fabrication: Standard PCB assembly (JLCPCB)',
      'Components: Off-the-shelf op-amps, comparators, passives',
    ],
  },
  {
    title: 'Software',
    bullets: [
      'Simulator: Custom-built in Rust (200× speedup)',
      'Training: Python interface to Rust core',
      'Models: Hardware noise, variation, nonlinearity',
      'Algorithm: Hardware-aware surrogate gradient descent + time-to-event loss',
    ],
  },
];

const energyBars = [
  { label: 'GPT-4 Training', value: 50, unit: 'GWh', timeframe: 'Training 2022–2023', color: 'bg-rose-400' },
  { label: 'ChatGPT Daily Load', value: 45, unit: 'GWh/day', timeframe: '', color: 'bg-sky-300' },
];

const marketTrajectory = [
  { year: 2025, value: 24.9 },
  { year: 2027, value: 41.2 },
  { year: 2030, value: 66.5 },
];

const problemHighlights: { title: string; copy: string; icon: IconType }[] = [
  { title: 'Wearables die fast', copy: 'Batteries drained in hours instead of days.', icon: LuWatch },
  { title: 'IoT sensors stall', copy: 'Recharge trucks, not data streams.', icon: LuRadioReceiver },
  { title: 'Robots idle', copy: 'Charge cycles dominate duty cycles.', icon: LuBot },
  { title: 'Implants risk safety', copy: 'Heat + maintenance windows limit adoption.', icon: LuHeartPulse },
];

const approachPillars: { title: string; copy: string; icon: IconType }[] = [
  { title: 'PCB-first prototyping', copy: '10× faster iteration vs. custom silicon loops.', icon: LuCircuitBoard },
  { title: 'Rust simulator', copy: '200× faster than SPICE with analog physics baked in.', icon: LuChartLine },
  { title: 'Programmable architecture', copy: 'Reconfigure analog fabric for new AI tasks.', icon: LuLayers },
  { title: 'Path to silicon', copy: 'Prove on boards, then shrink to ASIC.', icon: LuTarget },
];

const analogNeuronSteps: { title: string; copy: string; icon: IconType }[] = [
  { title: 'Input', copy: 'Weighted analog voltages — no ADC/quantization overhead.', icon: LuSignal },
  { title: 'Integration', copy: 'Op-amp + capacitor accumulates charge like a dendrite.', icon: LuGauge },
  { title: 'Activation', copy: 'Comparator spikes once thresholds are met.', icon: LuActivity },
  { title: 'Output', copy: 'Continuous-valued signal cascades forward (<1 mW per neuron).', icon: LuBatteryCharging },
  { title: 'Network power', copy: '1000 analog neurons ≈1W vs. 100W digital.', icon: LuZap },
];

const trainingTactics: { title: string; copy: string; icon: IconType }[] = [
  {
    title: 'ADC telemetry + finetuning',
    copy: 'Embedded ADCs stream live voltages/current into our Rust stack so each deployed board gets hardware-specific finetuning.',
    icon: LuScanLine,
  },
  {
    title: 'Component-aware programming',
    copy: 'We program against measured tolerances, automatically compensating for drift, mismatch, and variation across neurons.',
    icon: LuSettings,
  },
];

const tractionHighlights: { title: string; copy: string; icon: IconType }[] = [
  { title: 'Single-neuron prototype', copy: 'Under construction on breadboard with analog integrate-and-fire core.', icon: LuCircuitBoard },
  { title: 'SPICE validation', copy: 'Noise + temperature sweeps confirm circuit stability across tolerances.', icon: LuGauge },
  { title: 'KiCAD layout', copy: 'Multi-neuron PCB routing in progress for lab bring-up.', icon: LuLayers },
  { title: 'Rust simulator', copy: 'Framework operational, streaming hardware params into training loop.', icon: LuChartLine },
];

type TrendDatum = { year: number; value: number };

function EnergyChart({
  data,
}: {
  data: { label: string; value: number; unit: string; timeframe: string; color: string }[];
}) {
  const maxValue = Math.max(...data.map((item) => item.value));
  const axisMax = Math.max(60, Math.ceil(maxValue / 10) * 10);
  const tickCount = 4;
  const tickValues = Array.from({ length: tickCount }, (_, index) =>
    Math.round(axisMax - (axisMax / (tickCount - 1)) * index),
  );

  return (
    <div>
      <div className="relative h-64 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 pl-16 pr-6 pb-6 pt-6">
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-[1.25] border-b border-white/5 bg-red-500/15" />
          <div className="flex-[1] border-b border-white/5 bg-yellow-400/15" />
          <div className="flex-[1] bg-emerald-400/15" />
        </div>
        <div className="absolute left-8 top-6 bottom-6 w-px bg-white/10" aria-hidden />
        <div className="absolute left-3 top-6 bottom-6 flex flex-col justify-between text-xs font-semibold text-white/60">
          {tickValues.map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>
        <span className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs uppercase tracking-[0.4em] text-white/60 z-20">
          GWh
        </span>
        <div className="absolute left-16 right-6 top-6 bottom-6 z-10 flex items-end justify-around gap-6">
          {data.map((item) => (
            <div key={item.label} className="flex h-full w-32 items-end justify-center">
              <div
                className={`w-14 rounded-none ${item.color} shadow-[0_8px_30px_rgba(15,23,42,0.45)]`}
                style={{ height: `${(item.value / axisMax) * 100}%` }}
                aria-label={`${item.label}: ${item.value.toLocaleString()} ${item.unit}`}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {data.map((item) => (
          <div key={`${item.label}-meta`} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">{item.label}</p>
            {item.timeframe ? <p className="text-sm text-slate-300">{item.timeframe}</p> : null}
            <p className="text-lg font-semibold text-white">{item.value.toLocaleString()} {item.unit}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-300">
        GPT-4&apos;s training used enough energy to power a city for days. That power is now used daily to run these models.
      </p>
    </div>
  );
}

function TrendChart({ data, id }: { data: TrendDatum[]; id: string }) {
  const width = 320;
  const height = 180;
  const maxValue = Math.max(...data.map((point) => point.value));
  const minYear = data[0].year;
  const maxYear = data[data.length - 1].year;
  const points = data
    .map((point) => {
      const x = ((point.year - minYear) / (maxYear - minYear)) * (width - 60) + 30;
      const y = height - (point.value / maxValue) * (height - 60) - 30;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `30,${height - 30} ${points} ${width - 30},${height - 30}`;
  const titleId = `${id}-title`;
  const gradientId = `${id}-area`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full" role="img" aria-labelledby={titleId}>
      <title id={titleId}>Edge AI market trajectory</title>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(16,185,129,0.6)" />
          <stop offset="100%" stopColor="rgba(16,185,129,0.05)" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke="rgba(16,185,129,0.8)"
        strokeWidth={4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <polygon points={areaPoints} fill={`url(#${gradientId})`} />
      {data.map((point) => {
        const x = ((point.year - minYear) / (maxYear - minYear)) * (width - 60) + 30;
        const y = height - (point.value / maxValue) * (height - 60) - 30;
        return (
          <g key={point.year}>
            <circle cx={x} cy={y} r={5} fill="#22d3ee" />
            <text x={x} y={y - 12} fill="white" fontSize="12" textAnchor="middle">
              {`$${point.value.toFixed(1)}B`}
            </text>
            <text x={x} y={height - 10} fill="rgba(226,232,240,0.7)" fontSize="11" textAnchor="middle">
              {point.year}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function TarskiPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute left-1/2 top-[-20%] h-[120vh] w-[140vw] -translate-x-1/2 rotate-6 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.35),_transparent_55%)] blur-3xl" />
        <div className="absolute right-[-25%] bottom-[-15%] h-[90vh] w-[120vw] bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.22),_transparent_62%)] blur-3xl" />
        <div
          className="absolute inset-0 opacity-20 mix-blend-soft-light"
          style={{
            backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-20 px-6 py-16 sm:py-20">
        <header className="flex flex-col gap-8">
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            aria-label="Back to landing page"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 rotate-180">
              <path
                d="M5 12h12M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Home
          </Link>

          <div className="rounded-[32px] border border-white/15 bg-white/5 p-10 shadow-[0_40px_120px_rgba(59,130,246,0.25)] backdrop-blur-2xl">
            <div className="flex flex-wrap items-start justify-between gap-6 text-xs uppercase tracking-[0.3em] text-emerald-300/80">
              <span>PROJECT TARSKI</span>
              <span>Analog Neuromorphic Computing</span>
            </div>
            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">Analog Neuromorphic Computing</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
                  Analog Neuromorphic Computing for Ultra-Low-Power AI
                </h1>
              </div>
              <p className="text-lg text-slate-200 lg:max-w-sm">
                Sub-watt, instant AI experiences. Analog hardware delivering 100× power reduction for edge intelligence.
              </p>
            </div>
          </div>
        </header>

        <section className="space-y-10">
          <div className="flex items-center gap-4 text-emerald-300">
            <LuBatteryCharging className="h-8 w-8" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/60">The Problem</p>
              <h2 className="text-3xl font-semibold tracking-tight text-white">AI&apos;s power crisis — visualized</h2>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">GWh draw</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Training vs. daily inference</h3>
              <div className="mt-6">
                <EnergyChart data={energyBars} />
              </div>
            </article>
            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Market demand</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Edge AI locked by watts</h3>
              <div className="mt-6">
                <TrendChart data={marketTrajectory} id="market" />
              </div>
              <p className="mt-4 text-sm text-slate-200">$24.9B → $66.5B market growth throttled by digital efficiency limits.</p>
            </article>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {problemHighlights.map((item) => (
              <article key={item.title} className="flex gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <item.icon className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <h4 className="text-white">{item.title}</h4>
                  <p className="text-sm text-slate-200">{item.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-10">
          <div className="flex items-center gap-4 text-sky-300">
            <LuCpu className="h-8 w-8" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/60">Solution</p>
              <h2 className="text-3xl font-semibold tracking-tight text-white">True analog computing</h2>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <div className="flex items-center gap-3 text-slate-200">
                <LuCircuitBoard className="h-6 w-6" />
                <h3 className="text-xl font-semibold text-white">Digital AI (today)</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                <li>• Binary switching, energy burned every clock.</li>
                <li>• 100W+ per inference workload.</li>
                <li>• Heat + battery budgets kill edge deployments.</li>
              </ul>
            </article>
            <article className="rounded-3xl border border-emerald-300/30 bg-emerald-400/10 p-8">
              <div className="flex items-center gap-3 text-emerald-100">
                <LuBatteryCharging className="h-6 w-6" />
                <h3 className="text-xl font-semibold">Analog neuromorphic (Project Tarski)</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-emerald-50">
                <li>• Continuous-value circuits — energy only on state change.</li>
                <li>• &lt;1W for the same task.</li>
                <li>• 100× reduction by leaning on physics, not optimization.</li>
              </ul>
            </article>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-lg font-semibold uppercase tracking-[0.3em] text-white/70">Why it works</h3>
            <p className="mt-4 text-slate-200">
              Your brain runs on 20 watts and still outperforms supercomputers on perception tasks. We build the same way: circuits that compute in analog, tolerate noise, and only sip power when information changes.
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {approachPillars.map((pillar) => (
                <article key={pillar.title} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <pillar.icon className="h-5 w-5 text-emerald-300" />
                    </div>
                    <h4 className="text-white">{pillar.title}</h4>
                  </div>
                  <p className="mt-3 text-sm text-slate-200">{pillar.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="flex items-center gap-4 text-purple-200">
            <LuChartLine className="h-8 w-8" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/60">Flow</p>
              <h2 className="text-3xl font-semibold tracking-tight text-white">Simulation → Training → PCB → Silicon</h2>
            </div>
          </div>
          <FlowDiagram />
        </section>

        <section className="space-y-10">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-sky-300/80">Traction</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Real progress</h2>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-xl font-semibold text-white">Current progress</h3>
              <ul className="mt-6 space-y-4">
                {tractionHighlights.map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <item.icon className="h-5 w-5 text-emerald-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-sm text-slate-200">{item.copy}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-xl font-semibold text-white">Next milestones</h3>
              <div className="relative mt-6 pl-10">
                <div className="absolute left-4 top-0 h-full w-px bg-white/10" aria-hidden />
                <ul className="space-y-6">
                  {upcomingMilestones.map((milestone) => (
                    <li key={milestone.date} className="relative">
                      <span className="absolute left-[-6px] top-1 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/40 bg-slate-950">
                        <milestone.icon className="h-4 w-4 text-emerald-200" />
                      </span>
                      <div className="pl-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">{milestone.date}</p>
                        <p className="text-lg text-white">{milestone.goal}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-lg font-semibold uppercase tracking-[0.3em] text-white/70">Previous work</h3>
            <div className="mt-4 grid gap-6 md:grid-cols-3">
              <article>
                <h4 className="text-white">GridAI</h4>
                <p className="text-sm text-slate-200">Optimized Ireland&apos;s energy grid using high-performance Rust (2.5M sim-years/hr).</p>
              </article>
              <article>
                <h4 className="text-white">Tyndall Institute</h4>
                <p className="text-sm text-slate-200">Laser power transmission research (26% efficiency achieved).</p>
              </article>
              <article>
                <h4 className="text-white">Patch</h4>
                <p className="text-sm text-slate-200">Co-founded concussion sensor startup with WiFi mesh (6,000 samples/s).</p>
              </article>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">Applications</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white">Unlocking impossible use cases</h2>
            <p className="text-lg text-slate-200">Target industries: $2-5B serviceable market in power-critical edge AI.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {applications.map((app) => (
              <article key={app.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <app.icon className="h-6 w-6 text-emerald-200" />
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">{app.title}</p>
                </div>
                <p className="mt-3 text-lg text-white">{app.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-200">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Analog integrate-and-fire neurons</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {analogNeuronSteps.map((step) => (
              <article key={step.title} className="flex gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <step.icon className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <h4 className="text-white">{step.title}</h4>
                  <p className="text-sm text-slate-200">{step.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-orange-200">The challenge</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Analog hardware is noisy</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-xl font-semibold text-white">Problem</h3>
              <p className="mt-3 text-slate-200">
                Component tolerances, temperature drift, and manufacturing variation make analog circuits unpredictable.
              </p>
            </article>
            <article className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-8">
              <h3 className="text-xl font-semibold text-emerald-100">Hardware-aware training</h3>
              <div className="mt-4 grid gap-4">
                {trainingTactics.map((tactic) => (
                  <div key={tactic.title} className="flex gap-4 rounded-2xl border border-emerald-200/30 bg-emerald-300/10 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-200/30 bg-emerald-400/10">
                      <tactic.icon className="h-5 w-5 text-emerald-50" />
                    </div>
                    <div>
                      <h4 className="text-white">{tactic.title}</h4>
                      <p className="text-sm text-emerald-50">{tactic.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-emerald-50">
                Result: neural networks behave like biological brains — noisy neurons, reliable systems.
              </p>
            </article>
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-sky-200">Technology stack</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Prototype fast, transition to silicon</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {stack.map((layer) => (
              <article key={layer.title} className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <h3 className="text-xl font-semibold text-white">{layer.title}</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-200">
                  {layer.bullets.map((bullet) => (
                    <li key={bullet}>• {bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="text-sm text-slate-300">
            Most neuromorphic projects use exotic custom fabrication (6-12 month cycles, €50K+ per iteration). We prototype on PCB in weeks for &lt;€5K, then transition proven designs to silicon.
          </p>
        </section>

        <section className="space-y-10">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">Competitive landscape</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white">Analog-first advantage</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-semibold text-white">Digital neuromorphic</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                <li>• Intel Loihi 2: 1,152-chip Hala Point system, 1,000× efficiency vs GPUs on niche tasks, but research-only and still digital.</li>
                <li>• BrainChip Akida: 500× lower energy yet fully digital, so still limited by switching power.</li>
              </ul>
            </article>
            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-semibold text-white">Analog neuromorphic</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                <li>• Mostly university research with slow, expensive custom fabrication.</li>
                <li>• Limited programmability and commercial focus.</li>
              </ul>
              <p className="mt-4 text-white">Our advantage:</p>
              <p className="text-sm text-slate-200">True analog + PCB-first iteration speed + programmable architecture + commercial focus.</p>
            </article>
          </div>
        </section>

        <footer className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/80 via-slate-800/60 to-slate-900/80 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">Next</p>
          <p className="mt-2 text-2xl font-semibold text-white">Partner with Project Tarski</p>
          <p className="mt-3 text-slate-200">
            We&apos;re building the ultra-low-power compute substrate for edge AI. Let&apos;s collaborate on pilots, silicon transition, or frontier research.
          </p>
          <p className="mt-6 text-sm text-white/70">
            Email: <a href="mailto:eoghancollins0@gmail.com" className="text-emerald-200 underline decoration-dotted underline-offset-4">eoghancollins0@gmail.com</a>
          </p>
        </footer>
      </div>
    </main>
  );
}
