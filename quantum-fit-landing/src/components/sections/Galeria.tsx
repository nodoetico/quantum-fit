"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { api, type ApiGalleryImage } from "@/lib/api";

export default function Galeria() {
  const [images, setImages] = useState<ApiGalleryImage[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    api.gallery.getAll().then((data) => {
      setImages(data.filter((i) => i.isActive !== false).sort((a, b) => a.order - b.order));
    }).catch(() => {});
  }, []);

  const items = images.length > 0
    ? images
    : Array.from({ length: 8 }, (_, i) => ({
        id: `placeholder-${i}`,
        url: "",
        alt: `Galería Quantum Fit ${i + 1}`,
        order: i,
      }));

  return (
    <section id="galeria" className="bg-smoke px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Galería
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-base text-silver">
            Conocé nuestras instalaciones
          </p>
        </ScrollReveal>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {items.map((img, i) => (
            <ScrollReveal key={img.id} delay={i * 0.05}>
              <button
                onClick={() => setSelected(i)}
                className="mb-4 w-full overflow-hidden rounded-2xl transition-all duration-300 hover:opacity-90"
              >
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt={img.alt || ""} className="w-full aspect-square object-cover" />
                ) : (
                  <div className="aspect-square w-full bg-charcoal" />
                )}
              </button>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelected(null)}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute right-6 top-6 text-white transition-colors hover:text-silver"
              aria-label="Cerrar galería"
            >
              <X size={32} />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {items[selected]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={items[selected].url} alt={items[selected].alt || ""} className="max-h-[85vh] w-auto object-contain" />
              ) : (
                <div className="aspect-[4/3] w-full max-w-3xl bg-charcoal" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
