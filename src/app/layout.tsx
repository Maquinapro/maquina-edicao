import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Máquina de Edição",
  description: "Controle de conteúdo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
