import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Tag } from "lucide-react";
import { ArticuloBlog } from "@/modules/blog/types";

const articulosDemo: ArticuloBlog[] = [
  {
    id: "1",
    slug: "como-cuidar-el-esmalte-dental",
    titulo: "5 consejos prácticos para cuidar y proteger el esmalte dental",
    extracto: "El esmalte es la capa protectora externa de tus dientes. Descubre cómo mantenerlo fuerte frente al desgaste diario y los ácidos.",
    contenido: "",
    categoria: "Higiene",
    autor: "Dr. Carlos Ruiz",
    fechaPublicacion: "12 de Octubre, 2026",
  },
  {
    id: "2",
    slug: "mitos-comunes-sobre-la-ortodoncia",
    titulo: "Mitos y realidades sobre los tratamientos de ortodoncia",
    extracto: "¿Duele ponerse brackets? ¿Solo sirven para niños? Respondemos las dudas más frecuentes sobre la alineación dental moderna.",
    contenido: "",
    categoria: "Ortodoncia",
    autor: "Dra. Laura Vega",
    fechaPublicacion: "5 de Octubre, 2026",
  },
  {
    id: "3",
    slug: "importancia-de-la-limpieza-dental-periodica",
    titulo: "¿Por qué debes realizarte una profilaxis dental cada 6 meses?",
    extracto: "Incluso con un cepillado riguroso, el sarro acumulado requiere atención profesional para prevenir la gingivitis.",
    contenido: "",
    categoria: "Salud General",
    autor: "Dr. Carlos Ruiz",
    fechaPublicacion: "28 de Septiembre, 2026",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="bg-white border-b py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a Inicio</span>
          </Link>
          <span className="font-bold text-slate-800">Blog de Salud Oral</span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dentist-50 text-dentist-700 text-xs font-semibold mb-3 border border-dentist-200">
            <BookOpen className="h-4 w-4" />
            Educación y Consejos para tu Sonrisa
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Artículos y Consejos Dentales</h1>
          <p className="text-slate-600 mt-2 text-sm">
            Aprende cómo mantener una higiene bucal impecable y conoce los últimos avances en odontología.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {articulosDemo.map((articulo) => (
            <article 
              key={articulo.id} 
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span className="inline-flex items-center gap-1 font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                    <Tag className="h-3 w-3" />
                    {articulo.categoria}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {articulo.fechaPublicacion}
                  </span>
                </div>
                <h2 className="font-bold text-lg text-slate-900 leading-snug hover:text-dentist-600 transition-colors">
                  {articulo.titulo}
                </h2>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  {articulo.extracto}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{articulo.autor}</span>
                <span className="text-dentist-600 font-semibold cursor-pointer hover:underline">
                  Leer artículo →
                </span>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Consultorio Odontológico. Artículos informativos con fines educativos.
      </footer>
    </div>
  );
}
