"use client";

import { MessageCircle } from "lucide-react";
import { siteInfo } from "@/data/siteData";

export default function WhatsAppButton() {
  return (
    <a
      href={siteInfo.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={26} className="transition-transform duration-300 group-hover:scale-110" />
    </a>
  );
}
