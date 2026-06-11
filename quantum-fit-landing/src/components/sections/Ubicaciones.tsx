"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock, Phone } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { sedes as staticSedes } from "@/data/siteData";
import { api, type ApiGym } from "@/lib/api";

export default function Ubicaciones() {
  const [gyms, setGyms] = useState<ApiGym[]>([]);

  useEffect(() => {
    api.gyms.getAll().then((data) => {
      setGyms(data.filter((g) => g.isActive));
    }).catch(() => {});
  }, []);

  const display = gyms.length > 0 ? gyms : staticSedes.map((s) => ({
    id: s.nombre,
    name: s.nombre,
    address: s.direccion,
    phone: s.telefono,
    hours: s.horarios,
    isActive: true,
  }));

  const googleMapsUrl = (name: string) =>
    `https://www.google.com/maps?q=${encodeURIComponent(name + " Buenos Aires")}&output=embed`;

  return (
    <section className="bg-silver px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-night sm:text-4xl">
            Ubicaciones
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-base text-charcoal">
            Encontranos en nuestras dos sedes
          </p>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-2">
          {display.map((gym, i) => (
            <ScrollReveal key={gym.id} delay={i * 0.15}>
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="h-48 w-full bg-charcoal">
                  <iframe
                    src={googleMapsUrl(gym.name)}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={gym.name}
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-4 text-xl font-semibold text-night">{gym.name}</h3>
                  <div className="flex flex-col gap-3">
                    {gym.address && (
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="mt-0.5 shrink-0 text-charcoal" />
                        <span className="text-sm text-charcoal">{gym.address}</span>
                      </div>
                    )}
                    {gym.hours && (
                      <div className="flex items-start gap-3">
                        <Clock size={18} className="mt-0.5 shrink-0 text-charcoal" />
                        <span className="text-sm text-charcoal">{gym.hours}</span>
                      </div>
                    )}
                    {gym.phone && (
                      <div className="flex items-start gap-3">
                        <Phone size={18} className="mt-0.5 shrink-0 text-charcoal" />
                        <span className="text-sm text-charcoal">{gym.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
