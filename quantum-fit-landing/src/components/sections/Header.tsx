"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks, siteInfo as staticSiteInfo } from "@/data/siteData";
import type { NavLink } from "@/data/siteData";
import { api, type ApiSiteConfig } from "@/lib/api";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState<ApiSiteConfig | null>(null);

  useEffect(() => {
    api.site.getConfig().then(setSiteConfig).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const siteInfo = siteConfig || staticSiteInfo;
  const whatsappUrl = siteConfig
    ? `https://wa.me/${siteConfig.whatsapp}?text=Hola%20${encodeURIComponent(siteConfig.siteName)}%2C%20me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n.`
    : staticSiteInfo.whatsappUrl;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#inicio" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-night">Quantum Fit</span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label} className="group relative">
                <button className="flex items-center gap-1 text-sm font-medium text-charcoal transition-colors hover:text-night">
                  {link.label}
                  <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="flex flex-col gap-1 rounded-xl border border-silver bg-white p-2 shadow-lg min-w-[200px]">
                    {link.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        className="rounded-lg px-4 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-silver hover:text-night"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <a
                key={link.label}
                href={link.href!}
                className="text-sm font-medium text-charcoal transition-colors hover:text-night"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-night px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-charcoal"
          >
            Comenzar Ahora
          </a>
        </div>

        <button
          className="lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-silver bg-white lg:hidden"
          >
            <nav className="flex flex-col gap-2 px-6 py-6">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="flex flex-col gap-1">
                    <span className="py-2 text-sm font-semibold text-night">{link.label}</span>
                    <div className="flex flex-col gap-1 pl-4 border-l-2 border-silver">
                      {link.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          onClick={() => setMenuOpen(false)}
                          className="py-2 text-sm font-medium text-charcoal transition-colors hover:text-night"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <a
                    key={link.label}
                    href={link.href!}
                    onClick={() => setMenuOpen(false)}
                    className="py-2 text-sm font-medium text-charcoal transition-colors hover:text-night"
                  >
                    {link.label}
                  </a>
                )
              )}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 rounded-full bg-night px-6 py-3 text-center text-sm font-semibold text-white"
              >
                Comenzar Ahora
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
