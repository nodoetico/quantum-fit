"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { buffet } from "@/data/siteData";

export default function Buffet() {
  return (
    <section id="buffet" className="bg-white px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-night sm:text-4xl">
            Menú Buffet
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-base text-charcoal">
            Alimentación inteligente para potenciar tu rendimiento
          </p>
        </ScrollReveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {buffet.map((cat, i) => (
            <ScrollReveal key={cat.categoria} delay={i * 0.1}>
              <div className="rounded-2xl border border-silver p-6 transition-all duration-300 hover:shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-night">{cat.categoria}</h3>
                <ul className="flex flex-col gap-3">
                  {cat.items.map((item) => (
                    <li key={item} className="text-sm text-charcoal">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
