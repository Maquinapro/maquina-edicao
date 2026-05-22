import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: pedidos }, { data: editores }, { data: statusOpcoes }] = await Promise.all([
    supabase.from("pedidos").select("*").order("created_at", { ascending: false }),
    supabase.from("editores").select("*").order("nome"),
    supabase.from("status_opcoes").select("*").order("ordem"),
  ]);

  return (
    <div className="min-h-screen bg-creme">
      <Header userEmail={user.email ?? ""} />
      <DashboardClient
        initialPedidos={pedidos ?? []}
        editores={editores ?? []}
        statusOpcoes={statusOpcoes ?? []}
      />
    </div>
  );
}
