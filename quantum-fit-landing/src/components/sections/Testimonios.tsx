"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { testimonios as staticTestimonios } from "@/data/siteData";
import { api, type ApiTestimonial } from "@/lib/api";

export default function Testimonios() {
  const [testimonials, setTestimonials] = useState<ApiTestimonial[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.testimonials.getAll().then((data) => {
      setTestimonials(data.sort((a, b) => a.order - b.order));
    }).catch(() => {});
  }, []);

  const items = testimonials.length > 0 ? testimonials : staticTestimonios.map((t) => ({
    id: t.nombre,
    name: t.nombre,
    text: t.comentario,
    rating: t.calificacion,
    role: "",
    photoUrl: undefined,
    order: 0,
  }));

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  const t = items[current];

  return (
    <section id="testimonios" className="bg-silver px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-night sm:text-4xl">
          Testimonios
        </h2>
        <p className="mb-16 text-base text-charcoal">
          Lo que dicen nuestros alumnos
        </p>

        <div className="relative rounded-2xl bg-white p-8 shadow-sm sm:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-charcoal">
            {t.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.photoUrl} alt={t.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-white">{t.name.charAt(0)}</span>
            )}
          </div>

          <div className="mb-4 flex items-center justify-center gap-1">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} size={18} className="fill-night text-night" />
            ))}
          </div>

          <p className="mb-6 text-lg leading-relaxed text-charcoal">&ldquo;{t.text}&rdquo;</p>

          <p className="font-semibold text-night">{t.name}</p>
          {t.role && <p className="mt-1 text-sm text-charcoal/60">{t.role}</p>}

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="rounded-full border border-silver p-2 transition-colors hover:border-charcoal"
              aria-label="Anterior testimonio"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    i === current ? "w-6 bg-night" : "bg-charcoal/30"
                  }`}
                  aria-label={`Ir al testimonio ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="rounded-full border border-silver p-2 transition-colors hover:border-charcoal"
              aria-label="Siguiente testimonio"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
