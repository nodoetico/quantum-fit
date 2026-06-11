"use client";

import { Smartphone, QrCode } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function DescargaApp() {
  return (
    <section className="bg-night px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <ScrollReveal>
            <div className="flex justify-center">
              <div className="flex h-80 w-48 items-center justify-center rounded-[2.5rem] border-4 border-white/20 bg-smoke">
                <Smartphone size={48} className="text-silver/40" />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Llevá Quantum Fit con vos
            </h2>
            <ul className="mb-8 space-y-3">
              {[
                "Gestioná tu membresía",
                "Reservá tus clases",
                "Seguí tu progreso",
                "Accedé a rutinas exclusivas",
              ].map((b) => (
                <li key={b} className="flex items-center gap-3 text-silver">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  {b}
                </li>
              ))}
            </ul>

            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-smoke px-6 py-4">
                <QrCode size={24} className="text-silver" />
                <span className="text-sm text-silver">Escaneá para descargar la aplicación</span>
              </div>
              <p className="text-xs text-silver/50">QR_PLACEHOLDER</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
