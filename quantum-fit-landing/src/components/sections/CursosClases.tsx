"use client";

import { useState, useEffect } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { api, type ApiCourse, type ApiContent } from "@/lib/api";

export default function CursosClases() {
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [sectionContent, setSectionContent] = useState<ApiContent | null>(null);

  useEffect(() => {
    api.courses.getAll().then((data) => {
      setCourses(data.sort((a, b) => a.order - b.order));
    }).catch(() => {});
    api.content.getBySection("clases").then((data) => {
      if (data.length > 0) setSectionContent(data[0]);
    }).catch(() => {});
  }, []);

  return (
    <section id="clases" className="bg-silver px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          {sectionContent?.imageUrl && (
            <div className="mb-8 overflow-hidden rounded-2xl">
              <img src={sectionContent.imageUrl} alt="" className="max-h-64 w-full object-cover" />
            </div>
          )}
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-night sm:text-4xl">
            {sectionContent?.title || "Cursos y Clases"}
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-base text-charcoal">
            {sectionContent?.description || "Descubrí nuestra amplia variedad de disciplinas"}
          </p>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((curso, i) => (
            <ScrollReveal key={curso.id} delay={i * 0.05}>
              <div className="flex h-full flex-col group cursor-pointer overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                {curso.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={curso.imageUrl} alt={curso.name} className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="aspect-[4/3] bg-smoke" />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-2 text-lg font-semibold text-night">{curso.name}</h3>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-charcoal">{curso.description}</p>
                  <button className="mt-auto text-sm font-medium text-night underline-offset-2 underline transition-colors hover:text-charcoal">
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
