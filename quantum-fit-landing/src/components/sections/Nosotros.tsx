"use client";

import { useState, useEffect } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { api, type ApiContent } from "@/lib/api";

export default function Nosotros() {
  const [about, setAbout] = useState<ApiContent[]>([]);

  useEffect(() => {
    api.content.getBySection("about").then(setAbout).catch(() => {});
  }, []);

  const historia = about.find((c) => c.title === "Historia");
  const mision = about.find((c) => c.title === "Misión");
  const vision = about.find((c) => c.title === "Visión");
  const aboutImg = about.find((c) => c.imageUrl)?.imageUrl;

  return (
    <section id="nosotros" className="bg-white px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-night sm:text-4xl">
            Nosotros
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-base text-charcoal">
            Conocé nuestra historia y filosofía
          </p>
        </ScrollReveal>

        {aboutImg && (
          <div className="mb-12 overflow-hidden rounded-2xl">
            <img src={aboutImg} alt="Nosotros" className="max-h-80 w-full object-cover" />
          </div>
        )}

        <div className="grid gap-12 md:grid-cols-2">
          <ScrollReveal delay={0.1}>
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-night">Nuestra Historia</h3>
              <p className="leading-relaxed text-charcoal">
                {historia?.description ||
                  "Quantum Fit nació en 2020 con la visión de crear un espacio donde la tecnología y el entrenamiento se fusionaran para potenciar al máximo el rendimiento de cada persona. Desde entonces, hemos ayudado a cientos de alumnos a alcanzar sus metas fitness."}
              </p>
              <p className="leading-relaxed text-charcoal">
                {historia?.subtitle ||
                  "Contamos con instalaciones de primer nivel, equipamiento de última generación y un equipo de profesionales apasionados por el bienestar y la salud."}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-night">Filosofía</h3>
              <p className="leading-relaxed text-charcoal">
                Creemos en el entrenamiento inteligente. Cada rutina está diseñada con base científica para maximizar resultados en el menor tiempo posible.
              </p>
              <h3 className="text-2xl font-semibold text-night">Misión</h3>
              <p className="leading-relaxed text-charcoal">
                {mision?.description ||
                  "Transformar vidas a través del movimiento, la disciplina y la innovación tecnológica aplicada al fitness."}
              </p>
              <h3 className="text-2xl font-semibold text-night">Visión</h3>
              <p className="leading-relaxed text-charcoal">
                {vision?.description ||
                  "Ser el centro de entrenamiento referente en Latinoamérica por nuestra excelencia, innovación y resultados comprobables."}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
