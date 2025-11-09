'use client';

import Image from 'next/image';
import { LuArrowDown } from 'react-icons/lu';

const flowSteps = [
  {
    title: 'Simulation',
    description: 'Rust physics engine runs 200× faster than SPICE with analog noise baked in.',
    image: '/tarski-images/simulation.png',
  },
  {
    title: 'Training',
    description: 'Hardware-aware learning tunes weights that tolerate drift, offsets, and stochasticity.',
    image: '/tarski-images/training.png',
  },
  {
    title: 'PCB',
    description: 'PCB-first architecture lets us validate in weeks before taping out silicon.',
    image: '/tarski-images/pcb.png',
  },
  {
    title: 'Silicon',
    description: 'Proven analog blocks transition to ASIC form factors for deployment.',
    image: '/tarski-images/silicon.png',
  },
];

export function FlowDiagram() {
  return (
    <div className="flex flex-col items-center gap-10">
      {flowSteps.map((step, index) => (
        <div key={step.title} className="flex flex-col items-center text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">{step.title}</p>
          <div className="mt-3 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-4">
            <Image
              src={step.image}
              alt={step.title}
              width={640}
              height={360}
              className="h-64 w-full object-contain"
              sizes="(max-width: 768px) 100vw, 640px"
            />
          </div>
          <p className="mt-4 max-w-lg text-sm text-slate-200">{step.description}</p>
          {index < flowSteps.length - 1 && <LuArrowDown className="mt-6 h-6 w-6 text-emerald-300" />}
        </div>
      ))}
    </div>
  );
}
