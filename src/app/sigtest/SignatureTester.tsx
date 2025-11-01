"use client";

import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

type SignatureTesterProps = {
  signature: {
    viewBox: string;
    paths: string[];
    bounds: {
      minX: number;
      minY: number;
      width: number;
      height: number;
    };
  };
};

const DEFAULT_DURATION = 0.85;

export default function SignatureTester({ signature }: SignatureTesterProps) {
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [iteration, setIteration] = useState(0);

  const [order, setOrder] = useState<number[]>(() => signature.paths.map((_, idx) => idx));
  const SKIP_THRESHOLD = 22;
  const EDGE_BIAS = 1.8;

  const orderedPaths = useMemo(() => {
    return order.map((originalIndex) => ({
      d: signature.paths[originalIndex] ?? '',
      originalIndex,
    }));
  }, [order, signature.paths]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [lengths, setLengths] = useState<number[]>([]);

  type Descriptor = {
    index: number;
    length: number;
    start: { x: number; y: number };
    end: { x: number; y: number };
    startNormalized: { x: number; y: number };
    endNormalized: { x: number; y: number };
  };

  const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const computeOrder = (descriptors: Descriptor[]): number[] => {
    if (!descriptors.length) {
      return [];
    }

    const unused = new Set(descriptors.map((descriptor) => descriptor.index));
    const descriptorMap = new Map(descriptors.map((descriptor) => [descriptor.index, descriptor]));

    const pickStart = () => {
      const leftCandidates = descriptors.filter((descriptor) => descriptor.startNormalized.x <= 33.5);
      const candidates = leftCandidates.length ? leftCandidates : descriptors;
      return candidates.reduce((best, descriptor) => {
        const score = descriptor.startNormalized.y + descriptor.startNormalized.x * 0.15;
        const bestScore = best.startNormalized.y + best.startNormalized.x * 0.15;
        return score < bestScore ? descriptor : best;
      }, candidates[0]);
    };

    const orderSequence: number[] = [];
    let current: Descriptor | undefined;

    while (unused.size) {
      if (!current) {
        const next = pickStart();
        orderSequence.push(next.index);
        unused.delete(next.index);
        current = next;
        continue;
      }

      let best: Descriptor | undefined;
      let bestScore = Number.POSITIVE_INFINITY;

      let merged: Descriptor | undefined;

      unused.forEach((candidateIndex) => {
        const candidate = descriptorMap.get(candidateIndex);
        if (!candidate) {
          return;
        }
        const travelDistance = distance(current!.end, candidate.start);
        if (travelDistance < SKIP_THRESHOLD && !merged) {
          merged = {
            ...candidate,
            start: current!.start,
            startNormalized: current!.startNormalized,
          };
          orderSequence.push(candidate.index);
          unused.delete(candidate.index);
          return;
        }

        const edgeWeight =
          1 + Math.pow(Math.abs(candidate.startNormalized.x - 50) / 50, EDGE_BIAS) * 1.4;
        const score = travelDistance * edgeWeight;
        if (score < bestScore) {
          bestScore = score;
          best = candidate;
        }
      });

      if (merged) {
        current = merged;
        continue;
      }

      if (!best) {
        break;
      }

      orderSequence.push(best.index);
      unused.delete(best.index);
      current = best;
    }

    unused.forEach((residual) => {
      orderSequence.push(residual);
    });

    return orderSequence;
  };

  const arraysEqual = (a: number[], b: number[]) =>
    a.length === b.length && a.every((value, idx) => value === b[idx]);

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }
    const nodes = Array.from(
      svgRef.current.querySelectorAll('path[data-role="stroke"]'),
    ) as SVGPathElement[];
    if (!nodes.length) {
      return;
    }

    const descriptors: Descriptor[] = nodes.map((node) => {
      const indexAttr = Number(node.dataset.index);
      const index = Number.isFinite(indexAttr) ? indexAttr : 0;
      const length = node.getTotalLength();
      const startPoint = node.getPointAtLength(0);
      const endPoint = node.getPointAtLength(length);
      const normalize = (point: { x: number; y: number }) => ({
        x: ((point.x - signature.bounds.minX) / signature.bounds.width) * 100,
        y: ((point.y - signature.bounds.minY) / signature.bounds.height) * 100,
      });
      return {
        index,
        length,
        start: { x: startPoint.x, y: startPoint.y },
        end: { x: endPoint.x, y: endPoint.y },
        startNormalized: normalize({ x: startPoint.x, y: startPoint.y }),
        endNormalized: normalize({ x: endPoint.x, y: endPoint.y }),
      };
    });

    const computedOrder = computeOrder(descriptors);
    setOrder((prev) => (arraysEqual(prev, computedOrder) ? prev : computedOrder));

    const descriptorMap = new Map(descriptors.map((descriptor) => [descriptor.index, descriptor]));
    const orderedLengths = computedOrder.map((idx) => descriptorMap.get(idx)?.length ?? 0);
    setLengths(orderedLengths);
  }, [signature, iteration]);

  const totalLength = lengths.reduce((sum, len) => sum + len, 0) || 1;
  const segments = lengths.length
    ? lengths.map((len) => (len === 0 ? 0 : len / totalLength))
    : signature.paths.map(() => 1 / Math.max(1, signature.paths.length));

  const handleReplay = () => {
    setIteration((value) => value + 1);
  };

  const controls = useAnimationControls();

  useEffect(() => {
    if (!lengths.length || lengths.every((value) => value === 0)) {
      return;
    }

    controls.stop();
    controls.set((index: number) => ({ strokeDashoffset: lengths[index] ?? 1 }));

    const timeline: Array<{ index: number; start: number; duration: number }> = [];
    let cursor = 0;
    segments.forEach((portion, idx) => {
      const segDuration = Math.max(0.05, portion * duration);
      timeline.push({ index: idx, start: cursor, duration: segDuration });
      cursor += segDuration;
    });

    const run = async () => {
      await controls.start((index: number) => {
        const segment = timeline.find((entry) => entry.index === index);
        if (!segment) {
          return { strokeDashoffset: 0 };
        }
        return {
          strokeDashoffset: 0,
          transition: {
            duration: segment.duration,
            delay: segment.start,
            ease: [0.42, 0.02, 0.18, 1.01],
          },
        };
      });
    };

    run();

    return () => {
      controls.stop();
    };
  }, [controls, duration, segments, iteration, lengths, signature.paths.length]);

  const handleSlider = (event: ChangeEvent<HTMLInputElement>) => {
    setDuration(Number(event.target.value));
    setIteration((value) => value + 1);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-12 px-6 py-20 text-black">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-wide">Signature Animation Lab</h1>
        <p className="text-sm text-black/60">
          Tune the stroke pacing and replay the animation to explore different drawing feels. Current
          duration: <span className="font-semibold text-black">{duration.toFixed(2)}s</span>
        </p>
      </header>

      <div className="flex flex-col gap-6 rounded-3xl border border-black/10 bg-white p-8 shadow-[0_40px_90px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-4">
          <label className="text-sm uppercase tracking-[0.3em] text-black/70" htmlFor="duration">
            Duration
          </label>
          <input
            id="duration"
            type="range"
            min="0.4"
            max="4.0"
            step="0.05"
            value={duration}
            onChange={handleSlider}
            className="w-56"
          />
          <button
            type="button"
            onClick={handleReplay}
            className="rounded-full border border-black/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-black transition hover:bg-black hover:text-white"
          >
            Replay
          </button>
        </div>

        <div className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-white shadow-inner">
          <svg
            key={iteration}
            ref={svgRef}
            viewBox={signature.viewBox}
            className="h-full w-full"
          >
            {orderedPaths.map((path, index) => {
              const length = lengths[index] ?? 1;
              const maskId = `sig-mask-${iteration}-${index}`;
              const maskStroke = Math.max(18, signature.bounds.width / 80);

              return (
                <g key={`${path.d}-${index}`}>
                  <mask id={maskId} maskUnits="userSpaceOnUse">
                    <motion.path
                      custom={index}
                      animate={controls}
                      initial={{ strokeDasharray: length, strokeDashoffset: length }}
                      d={path.d}
                      fill="none"
                      stroke="white"
                      strokeWidth={maskStroke}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={length}
                      data-index={path.originalIndex}
                    />
                  </mask>
                  <path
                    d={path.d}
                    fill="currentColor"
                    opacity={0.9}
                    mask={`url(#${maskId})`}
                  />
                  <motion.path
                    custom={index}
                    animate={controls}
                    initial={{ strokeDasharray: length, strokeDashoffset: length }}
                    d={path.d}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={length}
                    data-index={path.originalIndex}
                    data-role="stroke"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
