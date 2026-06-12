"use client";

import { useState, useEffect } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { api, type ApiContent } from "@/lib/api";

export default function Features() {
  const [features, setFeatures] = useState<ApiContent[]>([]);

  useEffect(() => {
    api.content.getBySection("features").then(setFeatures).catch(() => {});
  }, []);

  if (features.length === 0) return null;

  return (
    <section id="features" className="bg-silver px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-night sm:text-4xl">
            ¿Por qué Quantum Fit?
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-base text-charcoal">
            Tecnología, gamificación y comunidad en un solo lugar
          </p>
        </ScrollReveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features
            .filter((f) => f.isActive)
            .sort((a, b) => a.order - b.order)
            .map((feature, i) => (
              <ScrollReveal key={feature.id} delay={i * 0.1}>
                <div className="flex h-full flex-col rounded-2xl border border-silver bg-white p-6 transition-all duration-300 hover:shadow-md">
                  {feature.imageUrl && (
                    <div className="mb-4 overflow-hidden rounded-xl">
                      <img src={feature.imageUrl} alt="" className="h-44 w-full object-cover" />
                    </div>
                  )}
                  <h3 className="mb-3 text-xl font-semibold text-night">{feature.title}</h3>
                  <p className="flex-1 text-sm leading-relaxed text-charcoal">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
        </div>
      </div>
    </section>
  );
}
