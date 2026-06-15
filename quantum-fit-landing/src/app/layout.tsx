import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quantum Fit | Transformá tu cuerpo. Potenciá tu mente.",
  description:
    "Entrenamiento de última generación para personas que buscan resultados reales. Musculación, Cross Training, Yoga, Pilates y más.",
  openGraph: {
    title: "Quantum Fit | Gimnasio Premium",
    description:
      "Entrenamiento de última generación para personas que buscan resultados reales.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quantum Fit | Gimnasio Premium",
    description:
      "Entrenamiento de última generación para personas que buscan resultados reales.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <noscript>
          <style>{`*[style*="opacity: 0"] { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
