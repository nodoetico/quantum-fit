"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { siteInfo as staticSiteInfo } from "@/data/siteData";
import { api, type ApiSiteConfig } from "@/lib/api";

export default function WhatsAppButton() {
  const [siteConfig, setSiteConfig] = useState<ApiSiteConfig | null>(null);

  useEffect(() => {
    api.site.getConfig().then(setSiteConfig).catch(() => {});
  }, []);

  const whatsappUrl = siteConfig
    ? `https://wa.me/${siteConfig.whatsapp}?text=Hola%20${encodeURIComponent(siteConfig.siteName)}%2C%20me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n.`
    : staticSiteInfo.whatsappUrl;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={26} className="transition-transform duration-300 group-hover:scale-110" />
    </a>
  );
}
