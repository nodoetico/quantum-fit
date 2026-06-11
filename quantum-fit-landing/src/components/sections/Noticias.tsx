"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { noticias } from "@/data/siteData";

export default function Noticias() {
  return (
    <section id="noticias" className="bg-white px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-night sm:text-4xl">
            Noticias
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-base text-charcoal">
            Mantenete al día con las últimas novedades
          </p>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-3">
          {noticias.map((n, i) => (
            <ScrollReveal key={n.titulo} delay={i * 0.1}>
              <article className="group cursor-pointer overflow-hidden rounded-2xl border border-silver transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-video bg-smoke" />
                <div className="p-5">
                  <time className="text-xs text-charcoal/60">{n.fecha}</time>
                  <h3 className="mb-2 mt-2 text-lg font-semibold text-night">{n.titulo}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-charcoal">{n.resumen}</p>
                  <button className="text-sm font-medium text-night underline-offset-2 underline transition-colors hover:text-charcoal">
                    Leer Más
                  </button>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
