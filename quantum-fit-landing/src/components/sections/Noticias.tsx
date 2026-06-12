"use client";

import { useState, useEffect } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { api, type ApiNewsItem } from "@/lib/api";

export default function Noticias() {
  const [news, setNews] = useState<ApiNewsItem[]>([]);

  useEffect(() => {
    api.news.getAll().then((data) => {
      setNews(data.filter((n) => n.isActive));
    }).catch(() => {});
  }, []);

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
          {news.map((n, i) => (
            <ScrollReveal key={n.id} delay={i * 0.1}>
              <article className="flex h-full flex-col group cursor-pointer overflow-hidden rounded-2xl border border-silver transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                {n.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.imageUrl} alt={n.title} className="aspect-video w-full object-cover" />
                ) : (
                  <div className="aspect-video bg-smoke" />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <time className="text-xs text-charcoal/60">{n.publishedAt ? new Date(n.publishedAt).toLocaleDateString("es-AR") : ""}</time>
                  <h3 className="mb-2 mt-2 text-lg font-semibold text-night">{n.title}</h3>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-charcoal">{n.summary}</p>
                  <button className="mt-auto text-sm font-medium text-night underline-offset-2 underline transition-colors hover:text-charcoal">
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
