"use client";
import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Pedido, Editor, StatusOpcao } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import PedidoModal from "@/components/ui/PedidoModal";
import Link from "next/link";

interface Props {
  initialPedidos: Pedido[];
  editores: Editor[];
  statusOpcoes: StatusOpcao[];
}

const MESES_ORDER = ["Julho","Agosto","Setembro","Outubro","Novembro","Dezembro","Janeiro","Fevereiro","Março","Abril","Maio","Junho"];

export default function DashboardClient({ initialPedidos, editores, statusOpcoes }: Props) {
  const supabase = createClient();
  const [pedidos, setPedidos] = useState<Pedido[]>(initialPedidos);
  const [activeStatus, setActiveStatus] = useState("Todos");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);

  async function refresh() {
    const { data } = await supabase.from("pedidos").select("*").order("created_at", { ascending: false });
    if (data) setPedidos(data);
  }

  // Metrics
  const metrics = useMemo(() => {
    const total_videos = pedidos.reduce((s, p) => s + p.qtde, 0);
    const em_fila = pedidos.filter((p) => p.status === "Em fila");
    const concluidos = pedidos.filter((p) => p.status === "Concluido").length;
    return {
      total: pedidos.length,
      total_videos,
      em_fila: em_fila.length,
      videos_em_fila: em_fila.reduce((s, p) => s + p.qtde, 0),
      concluidos,
    };
  }, [pedidos]);

  // Tabs counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { Todos: pedidos.length };
    statusOpcoes.forEach((s) => {
      counts[s.nome] = pedidos.filter((p) => p.status === s.nome).length;
    });
    return counts;
  }, [pedidos, statusOpcoes]);

  // Filtered
  const filtered = useMemo(() => {
    return pedidos.filter((p) => {
      const matchStatus = activeStatus === "Todos" || p.status === activeStatus;
      const matchSearch = !search || p.clinica.toLowerCase().includes(search.toLowerCase()) || (p.editor_nome ?? "").toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [pedidos, activeStatus, search]);

  function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }

  function openEdit(p: Pedido) {
    setEditingPedido(p);
    setShowModal(true);
  }

  function openNew() {
    setEditingPedido(null);
    setShowModal(true);
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "TOTAL", value: metrics.total, sub: "pedidos" },
          { label: "VÍDEOS", value: metrics.total_videos, sub: "editados" },
          { label: "EM FILA", value: metrics.em_fila, sub: `${metrics.videos_em_fila} vídeos` },
          { label: "CONCLUÍDOS", value: metrics.concluidos, sub: `${metrics.total ? Math.round(metrics.concluidos/metrics.total*100) : 0}% do total` },
        ].map((m) => (
          <div key={m.label} className="card px-5 py-4">
            <p className="text-[10px] font-semibold tracking-widest text-cinza-poeira mb-1">{m.label}</p>
            <p className="font-serif text-4xl font-semibold tracking-tight text-tinta leading-none mb-1">{m.value}</p>
            <p className="text-xs text-cinza-poeira">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Actions bar */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Novo pedido
        </button>
        <input
          type="text"
          className="input flex-1 max-w-md"
          placeholder="Buscar por clínica ou editor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link href="/cadastros" className="btn-secondary ml-auto">
          Cadastros
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-linha mb-5 overflow-x-auto">
        {["Todos", ...statusOpcoes.map(s => s.nome)].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveStatus(tab)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors -mb-px ${
              activeStatus === tab
                ? "border-tinta text-tinta font-medium"
                : "border-transparent text-cinza-poeira hover:text-cinza-tinta"
            }`}
          >
            {tab}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              activeStatus === tab ? "bg-tinta text-marfim" : "bg-linha-suave text-cinza-poeira"
            }`}>
              {tabCounts[tab] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-cinza-poeira">
          <p className="font-serif text-2xl mb-2">Nenhum pedido encontrado</p>
          <p className="text-sm">Tente mudar o filtro ou criar um novo pedido.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((pedido) => (
            <div key={pedido.id} className="card p-5 hover:border-cinza-poeira transition-colors group">
              {/* top */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  {pedido.mes && (
                    <p className="text-[10px] uppercase tracking-widest text-cinza-poeira mb-1">{pedido.mes}</p>
                  )}
                  <h3 className="font-serif text-lg font-semibold leading-tight text-tinta truncate pr-2">
                    {pedido.clinica}
                  </h3>
                </div>
                <StatusBadge status={pedido.status} statusOpcoes={statusOpcoes} />
              </div>

              {/* meta */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-cinza-poeira mb-3">
                {pedido.editor_nome && (
                  <span>✏️ {pedido.editor_nome}</span>
                )}
                <span>🎬 {pedido.qtde} {pedido.qtde === 1 ? "vídeo" : "vídeos"}</span>
                {pedido.data_pedido && <span>📅 {formatDate(pedido.data_pedido)}</span>}
                {pedido.entrega && <span>🚀 {formatDate(pedido.entrega)}</span>}
              </div>

              {/* checkmarks */}
              <div className="flex gap-3 text-xs mb-3">
                <span className={pedido.fila_edicao?.includes("✅") ? "text-publicado" : "text-cinza-poeira"}>
                  {pedido.fila_edicao?.includes("✅") ? "✅" : "○"} Fila
                </span>
                <span className={pedido.caminho_arquivo?.includes("✅") ? "text-publicado" : "text-cinza-poeira"}>
                  {pedido.caminho_arquivo?.includes("✅") ? "✅" : "○"} Arquivo
                </span>
                <span className={pedido.subiu_campanha ? "text-publicado" : "text-cinza-poeira"}>
                  {pedido.subiu_campanha ? "✅" : "○"} Campanha
                </span>
              </div>

              {/* obs */}
              {pedido.observacao && (
                <p className="text-xs text-cinza-tinta bg-creme rounded px-3 py-2 line-clamp-2 mb-3">
                  {pedido.observacao}
                </p>
              )}

              {/* actions */}
              <div className="flex gap-2 pt-2 border-t border-linha-suave">
                <button
                  onClick={() => openEdit(pedido)}
                  className="flex-1 text-xs text-center py-1.5 rounded border border-linha text-cinza-tinta hover:border-cinza-poeira transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={async () => {
                    const novoStatus = pedido.status === "Em fila" ? "Concluido" : "Em fila";
                    await supabase.from("pedidos").update({ status: novoStatus }).eq("id", pedido.id);
                    refresh();
                  }}
                  className="flex-1 text-xs text-center py-1.5 rounded border border-linha text-cinza-tinta hover:border-cinza-poeira transition-colors"
                >
                  {pedido.status === "Em fila" ? "Concluir" : "Reabrir"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <PedidoModal
          pedido={editingPedido}
          editores={editores}
          statusOpcoes={statusOpcoes}
          onClose={() => { setShowModal(false); setEditingPedido(null); }}
          onSaved={refresh}
        />
      )}
    </main>
  );
}
