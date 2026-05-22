import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import CadastrosClient from "./CadastrosClient";

export default async function CadastrosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: editores }, { data: statusOpcoes }] = await Promise.all([
    supabase.from("editores").select("*").order("nome"),
    supabase.from("status_opcoes").select("*").order("ordem"),
  ]);

  return (
    <div className="min-h-screen bg-creme">
      <Header userEmail={user.email ?? ""} />
      <CadastrosClient
        initialEditores={editores ?? []}
        initialStatus={statusOpcoes ?? []}
      />
    </div>
  );
}
