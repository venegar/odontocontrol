import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Consultorio Odontológico Virtual | Sonrisas Saludables",
  description: "Atención odontológica integral, agendamiento de citas en línea, tratamientos y salud oral.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased selection:bg-dentist-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
