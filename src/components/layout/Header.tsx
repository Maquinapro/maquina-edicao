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
    <header className="border-b border-linha bg-marfim px-4 py-3">
      <div className="max-w-7xl mx-auto">
        {/* Top row: logo + date */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Máquina de Edição"
              width={44}
              height={44}
              className="rounded-full shrink-0"
            />
            <div>
              <p className="text-[9px] tracking-widest uppercase text-cinza-poeira font-sans leading-none mb-0.5">
                Máquina de Edição
              </p>
              <h1 className="font-serif text-lg sm:text-2xl font-semibold tracking-tight leading-none">
                Controle de <em className="not-italic text-terracota">Conteúdo</em>
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-cinza-tinta capitalize text-right max-w-[120px] sm:max-w-none leading-tight">
            {today}
          </p>
        </div>
        {/* Bottom row: user info */}
        <div className="flex items-center gap-2 pl-14">
          <span className="w-1.5 h-1.5 rounded-full bg-publicado inline-block shrink-0" />
          <span className="text-xs text-cinza-poeira">sincronizado</span>
          <span className="text-xs text-cinza-poeira">·</span>
          <span className="text-xs text-cinza-poeira truncate max-w-[140px] sm:max-w-none">{userEmail}</span>
          <span className="text-xs text-cinza-poeira">·</span>
          <button
            onClick={handleLogout}
            className="text-xs text-cinza-poeira hover:text-terracota transition-colors shrink-0"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}