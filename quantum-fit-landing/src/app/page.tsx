import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import Nosotros from "@/components/sections/Nosotros";
import Features from "@/components/sections/Features";
import CursosClases from "@/components/sections/CursosClases";
import Ofertas from "@/components/sections/Ofertas";
import Galeria from "@/components/sections/Galeria";
import Buffet from "@/components/sections/Buffet";
import Testimonios from "@/components/sections/Testimonios";
import Noticias from "@/components/sections/Noticias";
import DescargaApp from "@/components/sections/DescargaApp";
import Ubicaciones from "@/components/sections/Ubicaciones";
import Contacto from "@/components/sections/Contacto";
import Footer from "@/components/sections/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Nosotros />
        <CursosClases />
        <Ofertas />
        <Galeria />
        <Buffet />
        <Testimonios />
        <Noticias />
        <DescargaApp />
        <Ubicaciones />
        <Contacto />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
