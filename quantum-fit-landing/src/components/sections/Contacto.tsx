"use client";

import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { api, type ApiContent } from "@/lib/api";

interface FormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
}

const initialForm: FormData = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  asunto: "",
  mensaje: "",
};

export default function Contacto() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [contactContent, setContactContent] = useState<ApiContent | null>(null);

  useEffect(() => {
    api.content.getBySection("contact").then((data) => {
      if (data.length > 0) setContactContent(data[0]);
    }).catch(() => {});
  }, []);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!form.apellido.trim()) newErrors.apellido = "El apellido es obligatorio";
    if (!form.email.trim()) newErrors.email = "El email es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email inválido";
    if (!form.telefono.trim()) newErrors.telefono = "El teléfono es obligatorio";
    if (!form.asunto.trim()) newErrors.asunto = "El asunto es obligatorio";
    if (!form.mensaje.trim()) newErrors.mensaje = "El mensaje es obligatorio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      alert("Consulta enviada con éxito. Nos comunicaremos pronto.");
      setForm(initialForm);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <section id="contacto" className="bg-white px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          {contactContent?.imageUrl && (
            <div className="mb-8 overflow-hidden rounded-2xl">
              <img src={contactContent.imageUrl} alt="" className="max-h-48 w-full object-cover" />
            </div>
          )}
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-night sm:text-4xl">
            {contactContent?.title || "Contacto"}
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-base text-charcoal">
            {contactContent?.description || "Dejanos tu consulta y te responderemos a la brevedad"}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="nombre" className="mb-1 block text-sm font-medium text-night">
                  Nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className={`w-full rounded-xl border ${
                    errors.nombre ? "border-red-500" : "border-silver"
                  } bg-white px-4 py-3 text-sm text-night outline-none transition-colors focus:border-night`}
                  placeholder="Tu nombre"
                />
                {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
              </div>
              <div>
                <label htmlFor="apellido" className="mb-1 block text-sm font-medium text-night">
                  Apellido
                </label>
                <input
                  id="apellido"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  className={`w-full rounded-xl border ${
                    errors.apellido ? "border-red-500" : "border-silver"
                  } bg-white px-4 py-3 text-sm text-night outline-none transition-colors focus:border-night`}
                  placeholder="Tu apellido"
                />
                {errors.apellido && <p className="mt-1 text-xs text-red-500">{errors.apellido}</p>}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-night">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full rounded-xl border ${
                    errors.email ? "border-red-500" : "border-silver"
                  } bg-white px-4 py-3 text-sm text-night outline-none transition-colors focus:border-night`}
                  placeholder="tu@email.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="telefono" className="mb-1 block text-sm font-medium text-night">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  className={`w-full rounded-xl border ${
                    errors.telefono ? "border-red-500" : "border-silver"
                  } bg-white px-4 py-3 text-sm text-night outline-none transition-colors focus:border-night`}
                  placeholder="+54 11 1234-5678"
                />
                {errors.telefono && <p className="mt-1 text-xs text-red-500">{errors.telefono}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="asunto" className="mb-1 block text-sm font-medium text-night">
                Asunto
              </label>
              <select
                id="asunto"
                name="asunto"
                value={form.asunto}
                onChange={handleChange}
                className={`w-full rounded-xl border ${
                  errors.asunto ? "border-red-500" : "border-silver"
                } bg-white px-4 py-3 text-sm text-night outline-none transition-colors focus:border-night`}
              >
                <option value="">Seleccioná un asunto</option>
                <option value="informacion">Información general</option>
                <option value="membresia">Membresía</option>
                <option value="clases">Clases</option>
                <option value="buffet">Buffet</option>
                <option value="otros">Otros</option>
              </select>
              {errors.asunto && <p className="mt-1 text-xs text-red-500">{errors.asunto}</p>}
            </div>

            <div>
              <label htmlFor="mensaje" className="mb-1 block text-sm font-medium text-night">
                Mensaje
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                value={form.mensaje}
                onChange={handleChange}
                rows={5}
                className={`w-full resize-none rounded-xl border ${
                  errors.mensaje ? "border-red-500" : "border-silver"
                } bg-white px-4 py-3 text-sm text-night outline-none transition-colors focus:border-night`}
                placeholder="Escribí tu mensaje..."
              />
              {errors.mensaje && <p className="mt-1 text-xs text-red-500">{errors.mensaje}</p>}
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-night px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-charcoal"
            >
              <Send size={16} />
              Enviar Consulta
            </button>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
