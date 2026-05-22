"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface HeaderProps {
  userEmail: string;
}

export default function Header({ userEmail }: HeaderProps) {
  const supabase = createClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className="border-b border-linha bg-marfim px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Máquina de Edição"
            width={56}
            height={56}
            className="rounded-full"
          />
          <div>
            <p className="text-[10px] tracking-widest uppercase text-cinza-poeira font-sans leading-none mb-1">
              Máquina Estúdio
            </p>
            <h1 className="font-serif text-2xl font-semibold tracking-tight leading-none">
              Controle de <em className="not-italic text-terracota">Conteúdo</em>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-publicado inline-block" />
              <span className="text-xs text-cinza-poeira">sincronizado</span>
              <span className="text-xs text-cinza-poeira">·</span>
              <span className="text-xs text-cinza-poeira">{userEmail}</span>
              <span className="text-xs text-cinza-poeira">·</span>
              <button
                onClick={handleLogout}
                className="text-xs text-cinza-poeira hover:text-terracota transition-colors underline-offset-2 hover:underline"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium text-tinta capitalize">{today}</p>
        </div>
      </div>
    </header>
  );
}