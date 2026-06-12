"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { siteInfo as staticSiteInfo } from "@/data/siteData";
import { api, type ApiContent, type ApiSiteConfig } from "@/lib/api";

export default function Hero() {
  const [hero, setHero] = useState<ApiContent | null>(null);
  const [siteConfig, setSiteConfig] = useState<ApiSiteConfig | null>(null);

  useEffect(() => {
    api.content.getBySection("hero").then((items) => {
      if (items.length > 0) setHero(items[0]);
    }).catch(() => {});
    api.site.getConfig().then(setSiteConfig).catch(() => {});
  }, []);

  const title = hero?.title || staticSiteInfo.slogan;
  const description = hero?.subtitle || hero?.description || staticSiteInfo.description;
  const bgImage = hero?.imageUrl || "/imagenes/hero-bg.jpeg";
  const ctaText = hero?.ctaText || "Comenzar Ahora";
  const ctaLink = hero?.ctaLink || "#planes";
  const whatsappUrl = siteConfig
    ? `https://wa.me/${siteConfig.whatsapp}?text=Hola%20${encodeURIComponent(siteConfig.siteName)}%2C%20me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n.`
    : staticSiteInfo.whatsappUrl;

  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-auto mb-10 max-w-2xl text-lg text-silver sm:text-xl"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <a
            href={ctaLink}
            className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-night transition-all hover:bg-silver"
          >
            {ctaText}
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
          >
            Consultar por WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
