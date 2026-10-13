"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { ArrowBtn, OutlineBtn } from "../ui/Button";
import { useEffect, useRef, useState } from "react";

interface Metric {
  text: string;
  target: number;
  suffix: string;
}

const metrics: Metric[] = [
  { text: "Learners supported", target: 10000, suffix: "+" },
  { text: "Conversations powered by AI", target: 15000, suffix: "+" },
  { text: "Educator satisfaction", target: 98, suffix: "%" },
];

function formatCount(value: number, suffix: string): string {
  if (suffix === "+" && value >= 1000) {
    const k = value / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k+`;
  }
  return `${value}${suffix}`;
}

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setCount(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, start]);

  return count;
}

function AnimatedMetric({ metric }: { metric: Metric }) {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const count = useCountUp(metric.target, 2000, started);

  return (
    <div
      ref={ref}
      className="flex w-full max-w-[260px] flex-col items-center justify-center gap-1 px-1.5 py-1 sm:flex-col sm:gap-1 sm:px-4 sm:py-3"
    >
      <p className="text-lg font-semibold text-neutral-900 sm:text-3xl">
        {formatCount(count, metric.suffix)}
      </p>
      <p className="text-[10px] leading-tight text-neutral-500 sm:text-sm">
        {metric.text}
      </p>
    </div>
  );
}

const HeroSection = () => {
  return (
    <section className="relative isolate flex w-full flex-col items-center gap-4 overflow-hidden px-4 py-10 text-center sm:gap-6 sm:px-8 sm:py-16  lg:gap-8 lg:px-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[30%] bg-gradient-to-t from-blue-50/30 to-white"
      />
      <h1 className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-4xl md:text-5xl text-center">
        Built for Bootcamps and{" "}
        <span className="text-primary-500">Learning</span> Communities
      </h1>
      <p className="max-w-[95%] text-xs text-neutral-600 sm:max-w-[90%] sm:text-base md:max-w-[65%] lg:max-w-[45%] lg:text-lg">
        Talk about structured channels, cohort communication, and affordable
        pricing.
      </p>
      <div className="flex w-full max-w-md flex-row items-center justify-center gap-2 sm:gap-3">
        <ArrowBtn
          text="Try for free"
          linkToHome
          loggedInText="Go to Dashboard"
          className="justify-center"
        />
        <OutlineBtn text="Contact sales" href="/contact-sales" />
      </div>
      <div className="flex w-full max-w-[90%] flex-col items-center justify-center gap-1 text-center text-xs text-neutral-500 sm:max-w-2xl sm:flex-row sm:gap-2 sm:text-sm">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5" aria-hidden="true">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star key={i} color="gold" fill="gold" size={16} />
              ))}
          </div>
          <span className="font-medium text-neutral-600">4.9</span>
        </div>
        <span className="hidden sm:inline" aria-hidden="true">
          |
        </span>
        <p className="leading-relaxed sm:leading-normal">
          Trusted by most modern educators and learners worldwide
        </p>
      </div>
      <div className="grid w-full max-w-4xl grid-cols-3 place-items-center gap-1.5 sm:gap-6 md:gap-10">
        {metrics.map((metric, i) => (
          <AnimatedMetric key={i} metric={metric} />
        ))}
      </div>{" "}
      <div className="w-full max-w-6xl overflow-hidden rounded-2xl">
        <div className="relative aspect-[16/10]  w-full sm:aspect-[16/9] lg:aspect-[2/1] ">
          <Image
            src="/images/homepage/hero-img.png"
            alt="Preview of the learning communication interface"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 1200px"
            className="object-contain object-center "
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
