"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ofertas as staticOfertas } from "@/data/siteData";
import { api, type ApiPlan } from "@/lib/api";

export default function Ofertas() {
  const [plans, setPlans] = useState<ApiPlan[]>([]);

  useEffect(() => {
    api.plans.getAll().then((data) => {
      setPlans(data.filter((p) => p.isActive).sort((a, b) => a.order - b.order));
    }).catch(() => {});
  }, []);

  const display = plans.length > 0 ? plans : staticOfertas.map((o) => ({
    id: o.nombre,
    name: o.nombre,
    price: parseInt(o.precio.replace(/[^0-9]/g, "")),
    period: "mes",
    currency: "ARS",
    features: o.beneficios,
    isFeatured: o.destacado,
    isActive: true,
    order: 0,
    description: "",
  }));

  return (
    <section id="ofertas" className="bg-white px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-night sm:text-4xl">
            Ofertas y Promociones
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-base text-charcoal">
            Elegí el plan que mejor se adapte a tus objetivos
          </p>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {display.map((plan, i) => (
            <ScrollReveal key={plan.id || plan.name} delay={i * 0.1}>
              <div
                className={`relative flex h-full flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  plan.isFeatured
                    ? "border-night bg-night text-white"
                    : "border-silver bg-white text-night"
                }`}
              >
                {plan.isFeatured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1 text-xs font-semibold text-night shadow-sm">
                    Recomendado
                  </span>
                )}
                <h3 className="mb-2 text-lg font-semibold">{plan.name}</h3>
                <p className={`mb-6 text-3xl font-bold ${plan.isFeatured ? "text-white" : "text-night"}`}>
                  ${plan.price.toLocaleString('es-AR')}
                </p>
                <ul className="mb-8 flex flex-1 flex-col gap-3">
                  {plan.features.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <Check
                        size={16}
                        className={`mt-0.5 shrink-0 ${
                          plan.isFeatured ? "text-silver" : "text-night"
                        }`}
                      />
                      <span className={plan.isFeatured ? "text-silver" : "text-charcoal"}>{b}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`mt-auto rounded-full py-2.5 text-sm font-semibold transition-all ${
                    plan.isFeatured
                      ? "bg-white text-night hover:bg-silver"
                      : "bg-night text-white hover:bg-charcoal"
                  }`}
                >
                  Elegir Plan
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
