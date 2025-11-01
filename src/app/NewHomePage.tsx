"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useAnimationControls,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';

export type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
};

export type ProjectContent = {
  intro: {
    headline: string;
    copy: string;
  };
  projects: Project[];
};

type MountainLayer = {
  id: number;
  src: string;
  depth: number;
  scale: number;
  zIndex: number;
  offset: number;
  compactOffset: number;
  horizontalShift?: number;
  compactHorizontalShift?: number;
};

type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  drift: number;
};

type StarConnection = {
  id: string;
  from: Star;
  to: Star;
  start: number;
  span: number;
};

type ConstellationLayerProps = {
  opacity: MotionValue<number>;
  translate: MotionValue<number>;
  progress: MotionValue<number>;
  projectsRef: MutableRefObject<HTMLDivElement | null>;
  stars: Star[];
  connections: StarConnection[];
};

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = Math.sin(value) * 10000;
    return value - Math.floor(value);
  };
}

function ConstellationLayer({ opacity, translate, progress, stars, connections, projectsRef }: ConstellationLayerProps) {
  const [visibleRange, setVisibleRange] = useState({ top: 0, bottom: 100 });

  useEffect(() => {
    const handleScroll = () => {
      const element = projectsRef.current;
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const { innerHeight } = window;
      const visibleTop = Math.max(0, -rect.top);
      const visibleBottom = Math.min(rect.height, innerHeight - rect.top);

      setVisibleRange({
        top: (visibleTop / rect.height) * 100,
        bottom: (visibleBottom / rect.height) * 100,
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [projectsRef]);

  return (
    <motion.svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      style={{ opacity, y: translate }}
    >
      {connections.map((connection) => (
        <ConstellationSegment
          key={connection.id}
          connection={connection}
          progress={progress}
          visibleRange={visibleRange}
        />
      ))}
      {stars.slice(0, 24).map((star) => (
        <circle
          key={`anchor-${star.id}`}
          cx={star.x}
          cy={star.y}
          r={star.size / 24}
          fill="rgba(255,255,255,0.55)"
        />
      ))}
    </motion.svg>
  );
}

type ConstellationSegmentProps = {
  connection: StarConnection;
  progress: MotionValue<number>;
  visibleRange: { top: number; bottom: number };
};

function ConstellationSegment({ connection, progress, visibleRange }: ConstellationSegmentProps) {
  const start = connection.start;
  const span = Math.max(0.08, connection.span);
  const lineProgress = useTransform(progress, (value) => {
    const normalized = (value - start) / span;
    return Math.max(0, Math.min(1, normalized));
  });
  const tipScale = useTransform(lineProgress, (value) => 0.6 + value * 0.8);
  const tipOpacity = useTransform(lineProgress, (value) => 0.1 + value * 0.9);

  const { top, bottom } = visibleRange;
  const fromVisible = connection.from.y >= top - 8 && connection.from.y <= bottom + 8;
  const toVisible = connection.to.y >= top - 8 && connection.to.y <= bottom + 8;

  if (!fromVisible && !toVisible) {
    return null;
  }

  const minAbsolute = Math.min(connection.from.y, connection.to.y);
  if (minAbsolute > 40) {
    return null;
  }

  const visibleHeight = Math.max(8, bottom - top);
  const minNormalized = (Math.min(connection.from.y, connection.to.y) - top) / visibleHeight;
  if (minNormalized > 0.4) {
    return null;
  }

  return (
    <>
      <motion.line
        x1={connection.from.x}
        y1={connection.from.y}
        x2={connection.to.x}
        y2={connection.to.y}
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={0.22}
        strokeLinecap="round"
        style={{ pathLength: lineProgress }}
      />
      <motion.circle
        cx={connection.to.x}
        cy={connection.to.y}
        r={0.35}
        fill="rgba(255,255,255,1)"
        style={{ scale: tipScale, opacity: tipOpacity }}
      />
      <motion.circle
        cx={connection.from.x}
        cy={connection.from.y}
        r={0.24}
        fill="rgba(255,255,255,0.7)"
        style={{ opacity: tipOpacity }}
      />
    </>
  );
}

type ProjectCardProps = {
  project: Project;
  index: number;
  scrollDirectionRef: MutableRefObject<'up' | 'down'>;
};

function ProjectCard({ project, index, scrollDirectionRef }: ProjectCardProps) {
  const isEven = index % 2 === 0;
  const controls = useAnimationControls();
  const anchorRef = useRef<HTMLAnchorElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const hasHref = project.href && project.href.trim() !== '';
  const inViewRef = hasHref ? anchorRef : divRef;
  const inView = useInView(inViewRef as React.RefObject<HTMLElement>, {
    amount: 0.4,
    margin: '-15% 0px -10% 0px',
  });
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (inView) {
      setHasEntered(true);
      controls.start({
        opacity: 1,
        x: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
      });
    } else if (hasEntered && scrollDirectionRef.current === 'up') {
      controls.start({
        opacity: 0,
        x: isEven ? -60 : 60,
        transition: { duration: 0.55, ease: [0.26, 0.08, 0.25, 1] },
      });
    }
  }, [controls, hasEntered, inView, isEven, scrollDirectionRef]);

  const cardContent = (
    <>
      <div className={`${isEven ? 'order-1 sm:order-1' : 'order-1 sm:order-2'} flex flex-col gap-4`}>
        <h3 className="text-2xl font-semibold text-white sm:text-3xl">{project.title}</h3>
        <p className="text-sm leading-relaxed text-slate-200 sm:text-base">{project.description}</p>
        {hasHref && (
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition group-hover:gap-3">
            Visit project
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
              <path
                d="M5 12h12M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
      <div
        className={`${isEven ? 'order-2 sm:order-2' : 'order-2 sm:order-1'} relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10`}
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>
    </>
  );

  const commonProps = {
    initial: { opacity: 0, x: isEven ? -60 : 60 },
    animate: controls,
    className: "group grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_50px_120px_rgba(14,116,144,0.18)] backdrop-blur-lg sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
  };

  if (hasHref) {
    return (
      <motion.a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        ref={anchorRef}
        {...commonProps}
      >
        {cardContent}
      </motion.a>
    );
  }

  return (
    <motion.div ref={divRef} {...commonProps}>
      {cardContent}
    </motion.div>
  );
}

function createStars(count: number, seed = 4242): Star[] {
  const rand = seededRandom(seed);
  return Array.from({ length: count }).map((_, index) => ({
    id: index,
    x: rand() * 100,
    y: rand() * 100,
    size: 1.2 + rand() * 2.3,
    drift: (rand() - 0.5) * 20,
  }));
}

function createConnections(stars: Star[], maxConstellations = 6, seed = 5151): StarConnection[] {
  const rand = seededRandom(seed);
  const available = new Set(stars.map((star) => star.id));
  const visitedGlobal = new Set<number>();
  const edges: StarConnection[] = [];

  const pickWeighted = (items: Array<{ star: Star; weight: number }>) => {
    if (!items.length) {
      return null;
    }
    const total = items.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
    if (total <= 0) {
      return items[0].star;
    }
    let threshold = rand() * total;
    for (const item of items) {
      threshold -= Math.max(0, item.weight);
      if (threshold <= 0) {
        return item.star;
      }
    }
    return items[items.length - 1].star;
  };

  for (let constellationIndex = 0; constellationIndex < maxConstellations; constellationIndex += 1) {
    const pool = Array.from(available).map((starId) => {
      const star = stars[starId];
      if (visitedGlobal.size === 0) {
        return { star, weight: 1.5 };
      }

      let nearest = Infinity;
      visitedGlobal.forEach((usedId) => {
        const usedStar = stars[usedId];
        const dx = star.x - usedStar.x;
        const dy = star.y - usedStar.y;
        nearest = Math.min(nearest, Math.sqrt(dx * dx + dy * dy));
      });

      const proximityFactor = Math.max(0.18, Math.min(1.2, nearest / 30));
      const edgeBias = 0.7 + Math.pow(Math.abs(star.x - 50) / 50, 1.6) * 1.5;
      return { star, weight: proximityFactor * edgeBias };
    });

    if (pool.length === 0) {
      break;
    }

    const startStar = pickWeighted(pool);
    if (!startStar) {
      break;
    }
    available.delete(startStar.id);
    visitedGlobal.add(startStar.id);

    let current = startStar;
    const visitedLocal = new Set<number>([startStar.id]);
    const maxLength = 3 + Math.floor(rand() * 4);

    for (let segmentIndex = 0; segmentIndex < maxLength; segmentIndex += 1) {
      const candidates = stars
        .filter((candidate) => !visitedLocal.has(candidate.id))
        .map((candidate) => {
          const dx = candidate.x - current.x;
          const dy = candidate.y - current.y;
          const distance = Math.sqrt(dx * dx + dy * dy) + 0.0001;
          return { candidate, distance };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);

      if (candidates.length === 0) {
        break;
      }

      const weighted = candidates.map(({ candidate, distance }, idx) => {
        const distanceFactor = Math.max(0.0003, 1 / Math.pow(distance / 22, 1.45));
        const edgeBias = 0.65 + Math.pow(Math.abs(candidate.x - 50) / 50, 1.4) * 1.8;
        const ordinalBoost = 1 + (5 - idx) * 0.22;
        return {
          star: candidate,
          weight: distanceFactor * edgeBias * ordinalBoost,
        };
      });

      const chosen = pickWeighted(weighted);
      if (!chosen) {
        break;
      }

      const key = `${current.id}-${chosen.id}`;
      const start = Math.min(0.85, constellationIndex * 0.12 + segmentIndex * 0.1 + rand() * 0.08);
      const span = 0.12 + rand() * 0.12;
      edges.push({
        id: key,
        from: current,
        to: chosen,
        start,
        span,
      });

      visitedLocal.add(chosen.id);
      available.delete(chosen.id);
      visitedGlobal.add(chosen.id);
      current = chosen;

      if (rand() < 0.25) {
        break;
      }
    }
  }

  return edges;
}

const MOUNTAIN_LAYERS: MountainLayer[] = [
  {
    id: 5,
    src: '/mountainous/5.svg',
    depth: 0.065,
    scale: 0.84,
    zIndex: 48,
    offset: -8,
    compactOffset: -7,
  },
  {
    id: 4,
    src: '/mountainous/4.svg',
    depth: 0.08,
    scale: 0.89,
    zIndex: 52,
    offset: 6,
    compactOffset: 6,
  },
  {
    id: 3,
    src: '/mountainous/3.svg',
    depth: 0.105,
    scale: 0.94,
    zIndex: 58,
    offset: 2,
    compactOffset: 3,
  },
  {
    id: 2,
    src: '/mountainous/2.svg',
    depth: 0.13,
    scale: 1.0,
    zIndex: 64,
    offset: -21,
    compactOffset: -20,
  },
  {
    id: 1,
    src: '/mountainous/1.svg',
    depth: 0.11,
    scale: 1.132,
    zIndex: 70,
    offset: -14,
    compactOffset: -8,
    horizontalShift: -4,
    compactHorizontalShift: -1.5,
  },
];

export default function NewHomePage({ intro, projects }: ProjectContent) {
  const projectsRef = useRef<HTMLDivElement | null>(null);
  const { scrollY } = useScroll();
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const stars = useMemo(() => createStars(220), []);
  const connections = useMemo(() => createConnections(stars, 44), [stars]);
  const scrollDirection = useRef<'up' | 'down'>('down');

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? latest;
    if (latest < previous) {
      scrollDirection.current = 'up';
    } else if (latest > previous) {
      scrollDirection.current = 'down';
    }
  });

  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const isCompact = viewportWidth !== null && viewportWidth < 1024;

  const { scrollYProgress: projectsScrollProgress } = useScroll({
    target: projectsRef,
    offset: ['start 80%', 'end start'],
  });

  const fractalOpacity = useTransform(projectsScrollProgress, [0, 0.3, 1], [0.1, 0.5, 0.85]);
  const fractalTranslate = useTransform(projectsScrollProgress, [0, 1], [40, -25]);
  const fractalScale = useTransform(projectsScrollProgress, [0, 1], [1.06, 1]);
  const fractalSecondaryTranslate = useTransform(projectsScrollProgress, [0, 1], [28, -16]);
  const constellationOpacity = useTransform(projectsScrollProgress, [0, 0.25, 1], [0, 0.35, 0.6]);
  const constellationProgress = useTransform(projectsScrollProgress, (value) => value);

  const baseDepth = MOUNTAIN_LAYERS[0].depth;
  const layer1Y = useTransform(scrollY, (value) => value * baseDepth);
  const layer2Y = useTransform(scrollY, (value) => value * (baseDepth + 0.015));
  const layer3Y = useTransform(scrollY, (value) => value * (baseDepth + 0.03));
  const layer4Y = useTransform(scrollY, (value) => value * (baseDepth + 0.06));
  const layer5Y = useTransform(scrollY, () => 0);

  const layerTransforms = [layer1Y, layer2Y, layer3Y, layer4Y, layer5Y];

  const parallaxLayers = MOUNTAIN_LAYERS.map((layer, index) => {
    const horizontalShiftVw = isCompact
      ? layer.compactHorizontalShift ?? layer.horizontalShift ?? 0
      : layer.horizontalShift ?? 0;

    const baseShiftPx = viewportWidth !== null ? (horizontalShiftVw * viewportWidth) / 100 : 0;

    return {
      ...layer,
      translateY: layerTransforms[index],
      baseBottom: isCompact ? layer.compactOffset : layer.offset,
      baseShiftPx,
    };
  });

  const mountainContainerWidth = isCompact ? 130 : 118;

  const handleScrollToProjects = () => {
    projectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="pointer-events-none fixed top-8 left-8 z-[120] mix-blend-difference">
        <button
          type="button"
          onClick={handleScrollToProjects}
          className="pointer-events-auto rounded-full border border-current px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-white transition hover:scale-[1.04] hover:bg-white hover:text-black"
        >
          Projects
        </button>
      </div>
      <div className="pointer-events-none fixed top-8 right-8 z-[120] mix-blend-difference">
        <Link
          href="/links"
          className="pointer-events-auto rounded-full border border-current px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-white transition hover:scale-[1.04] hover:bg-white hover:text-black"
        >
          Links
        </Link>
      </div>

      <section className="relative flex min-h-[100vh] flex-col items-center justify-between overflow-visible bg-gradient-to-b from-slate-100 via-slate-200/80 to-[#0f1f3a] pb-28">
        <div className="z-10 mt-20 flex flex-col items-center text-center">
          <Image
            src="/signatures/signature.svg"
            alt="Signature of Eoghan Collins"
            width={380}
            height={140}
            priority
            className="w-[min(90vw,33rem)] object-contain"
          />
          <p className="mt-6 font-sans text-sm font-semibold uppercase tracking-[0.6em] text-slate-900/80 sm:text-base">Founder | Engineer</p>
        </div>

        <div className={`pointer-events-none absolute inset-x-0 bottom-0 ${isCompact ? 'h-[58vh]' : 'h-[64vh]'} z-0`}>
          <div
            className="absolute bottom-0 left-1/2 h-full -translate-x-1/2"
            style={{ width: `${mountainContainerWidth}vw` }}
          >
            <div className="relative h-full w-full">
              {parallaxLayers.map((layer) => (
                <motion.img
                  key={layer.id}
                  src={layer.src}
                  alt="Mountain layer"
                  className="absolute left-0 w-full select-none"
                  style={{
                    y: layer.translateY,
                    scale: layer.scale,
                    zIndex: layer.zIndex,
                    bottom: `${layer.baseBottom}vh`,
                    x: layer.baseShiftPx,
                  }}
                  draggable={false}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-[-5vw] bottom-[-2vh] z-10 h-[18vh] bg-gradient-to-b from-[#0f1f3a]/0 via-[#070910]/85 to-black" />
      </section>

      <section
        ref={projectsRef}
        className="relative z-40 flex flex-col items-center justify-center overflow-hidden py-24 text-white"
        style={{
          backgroundImage: 'linear-gradient(to bottom, #010101 0%, #05070c 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 -translate-y-[16vh] h-[24vh] bg-gradient-to-b from-black via-black/95 to-transparent z-10" />
        <motion.svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          style={{
            opacity: fractalOpacity,
            y: fractalTranslate,
            scale: fractalScale,
          }}
        >
          {stars.map((star) => (
            <circle
              key={star.id}
              cx={star.x}
              cy={star.y}
              r={star.size / 18}
              fill="rgba(255,255,255,0.7)"
            />
          ))}
        </motion.svg>
        <ConstellationLayer
          opacity={constellationOpacity}
          stars={stars}
          connections={connections}
          translate={fractalSecondaryTranslate}
          progress={constellationProgress}
          projectsRef={projectsRef}
        />
        <div className="layout-shell relative z-20 px-6 sm:px-10">
          <header className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">{intro.headline}</h2>
            <p className="mt-4 text-base text-slate-200 sm:text-lg">{intro.copy}</p>
          </header>

          <div className="mt-16 flex flex-col gap-16">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                scrollDirectionRef={scrollDirection}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
