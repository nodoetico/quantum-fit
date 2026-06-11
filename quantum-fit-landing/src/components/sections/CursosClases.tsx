"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { cursosClases } from "@/data/siteData";

export default function CursosClases() {
  return (
    <section id="clases" className="bg-silver px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-night sm:text-4xl">
            Cursos y Clases
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-base text-charcoal">
            Descubrí nuestra amplia variedad de disciplinas
          </p>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cursosClases.map((curso, i) => (
            <ScrollReveal key={curso.nombre} delay={i * 0.05}>
              <div className="group cursor-pointer overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-[4/3] bg-smoke" />
                <div className="p-5">
                  <h3 className="mb-2 text-lg font-semibold text-night">{curso.nombre}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-charcoal">{curso.descripcion}</p>
                  <button className="text-sm font-medium text-night underline-offset-2 underline transition-colors hover:text-charcoal">
                    Más Información
                  </button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
