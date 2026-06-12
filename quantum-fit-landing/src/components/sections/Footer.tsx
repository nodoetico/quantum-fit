"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { siteInfo as staticSiteInfo, navLinks, sedes as staticSedes } from "@/data/siteData";
import { api, type ApiSiteConfig, type ApiGym } from "@/lib/api";

function IconInstagram({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function IconYoutube({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29.4 29.4 0 0 0 1 12a29.4 29.4 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29.4 29.4 0 0 0 23 12a29.4 29.4 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

export default function Footer() {
  const [siteConfig, setSiteConfig] = useState<ApiSiteConfig | null>(null);
  const [gyms, setGyms] = useState<ApiGym[]>([]);

  useEffect(() => {
    api.site.getConfig().then(setSiteConfig).catch(() => {});
    api.gyms.getAll().then((data) => setGyms(data.filter((g) => g.isActive))).catch(() => {});
  }, []);

  const info = siteConfig || staticSiteInfo;
  const sedesList = gyms.length > 0 ? gyms : staticSedes.map((s) => ({
    name: s.nombre, address: s.direccion, hours: s.horarios, phone: s.telefono, isActive: true,
  } as ApiGym));

  const redes = [
    { label: "Instagram", icon: IconInstagram, href: siteConfig?.instagramUrl || "#" },
    { label: "YouTube", icon: IconYoutube, href: siteConfig?.youtubeUrl || "#" },
  ];
  return (
    <footer className="bg-night px-6 py-16 text-silver">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">{siteConfig ? siteConfig.siteName : staticSiteInfo.name}</h3>
            <p className="mb-4 text-sm leading-relaxed text-silver/70">
              Transformá tu cuerpo. Potenciá tu mente.
            </p>
            <div className="flex gap-3">
              {redes.map((r) => (
                <a
                  key={r.label}
                  href={r.href}
                  aria-label={r.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition-colors hover:border-white/30"
                >
                  <r.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Enlaces</h4>
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-silver/70 transition-colors hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Horarios</h4>
            <ul className="flex flex-col gap-2">
              {sedesList.map((s) => (
                <li key={s.name} className="text-sm text-silver/70">
                  <span className="font-medium text-white">{s.name}:</span>
                  <br />
                  {s.hours}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Contacto</h4>
            <ul className="flex flex-col gap-3">
              {sedesList.map((s) => (
                <li key={s.name}>
                  <div className="flex items-start gap-2 text-sm text-silver/70">
                    <MapPin size={14} className="mt-0.5 shrink-0" />
                    {s.address}
                  </div>
                </li>
              ))}
              <li>
                <div className="flex items-center gap-2 text-sm text-silver/70">
                  <Phone size={14} className="shrink-0" />
                  {info.phone}
                </div>
              </li>
              <li>
                <div className="flex items-center gap-2 text-sm text-silver/70">
                  <Mail size={14} className="shrink-0" />
                  {info.email}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-silver/50">
          &copy; {new Date().getFullYear()} {siteConfig ? siteConfig.siteName : staticSiteInfo.name} &mdash; Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
