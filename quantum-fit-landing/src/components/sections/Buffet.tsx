"use client";

import { useState, useEffect } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { api, type ApiBuffetItem } from "@/lib/api";

export default function Buffet() {
  const [items, setItems] = useState<ApiBuffetItem[]>([]);

  useEffect(() => {
    api.buffet.getAll().then((data) => {
      setItems(data.filter((i) => i.isActive).sort((a, b) => a.order - b.order));
    }).catch(() => {});
  }, []);

  const grouped = items.reduce<Record<string, ApiBuffetItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

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
          {Object.entries(grouped).map(([category, categoryItems], i) => (
            <ScrollReveal key={category} delay={i * 0.1}>
              <div className="flex h-full flex-col rounded-2xl border border-silver transition-all duration-300 hover:shadow-md">
                {categoryItems[0]?.imageUrl && (
                  <div className="overflow-hidden rounded-t-2xl">
                    <img src={categoryItems[0].imageUrl} alt={category} className="h-40 w-full object-cover" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="mb-4 text-lg font-semibold text-night capitalize">{category}</h3>
                  <ul className="flex flex-1 flex-col gap-3">
                    {categoryItems.map((item) => (
                      <li key={item.id} className="text-sm text-charcoal">
                        {item.name}{item.price ? ` — $${item.price}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
