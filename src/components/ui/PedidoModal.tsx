"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Pedido, Editor, StatusOpcao } from "@/lib/types";

interface PedidoModalProps {
  pedido?: Pedido | null;
  editores: Editor[];
  statusOpcoes: StatusOpcao[];
  onClose: () => void;
  onSaved: () => void;
}

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function PedidoModal({ pedido, editores, statusOpcoes, onClose, onSaved }: PedidoModalProps) {
  const supabase = createClient();
  const isEdit = !!pedido;

  const [form, setForm] = useState({
    clinica: pedido?.clinica ?? "",
    editor_id: pedido?.editor_id ?? "",
    status: pedido?.status ?? "Em fila",
    data_pedido: pedido?.data_pedido ?? "",
    entrega: pedido?.entrega ?? "",
    qtde: pedido?.qtde ?? 1,
    mes: pedido?.mes ?? MESES[new Date().getMonth()],
    fila_edicao: pedido?.fila_edicao ?? "",
    caminho_arquivo: pedido?.caminho_arquivo ?? "",
    subiu_campanha: pedido?.subiu_campanha ?? false,
    observacao: pedido?.observacao ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clinica) { setError("Informe a clínica."); return; }
    setSaving(true);
    setError("");

    const editor = editores.find((ed) => ed.id === form.editor_id);
    const payload = {
      ...form,
      editor_nome: editor?.nome ?? null,
      qtde: Number(form.qtde),
      data_pedido: form.data_pedido || null,
      entrega: form.entrega || null,
      fila_edicao: form.fila_edicao || null,
      caminho_arquivo: form.caminho_arquivo || null,
      observacao: form.observacao || null,
    };

    if (isEdit) {
      const { error } = await supabase.from("pedidos").update(payload).eq("id", pedido!.id);
      if (error) setError(error.message);
      else { onSaved(); onClose(); }
    } else {
      const { error } = await supabase.from("pedidos").insert(payload);
      if (error) setError(error.message);
      else { onSaved(); onClose(); }
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!pedido || !confirm("Excluir este pedido? Essa ação não pode ser desfeita.")) return;
    await supabase.from("pedidos").delete().eq("id", pedido.id);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-tinta/40 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-linha">
          <h2 className="font-serif text-xl font-semibold">
            {isEdit ? "Editar pedido" : "Novo pedido"}
          </h2>
          <button onClick={onClose} className="text-cinza-poeira hover:text-tinta text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs uppercase tracking-wider text-cinza-tinta mb-1.5 font-medium">Clínica *</label>
              <input className="input" value={form.clinica} onChange={(e) => set("clinica", e.target.value)} placeholder="Ex: Karina - MMatos" required />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-cinza-tinta mb-1.5 font-medium">Editor</label>
              <select className="input" value={form.editor_id} onChange={(e) => set("editor_id", e.target.value)}>
                <option value="">Sem editor</option>
                {editores.filter(ed => ed.ativo).map((ed) => (
                  <option key={ed.id} value={ed.id}>{ed.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-cinza-tinta mb-1.5 font-medium">Status</label>
              <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
                {statusOpcoes.filter(s => s.ativo).map((s) => (
                  <option key={s.id} value={s.nome}>{s.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-cinza-tinta mb-1.5 font-medium">Mês de referência</label>
              <select className="input" value={form.mes} onChange={(e) => set("mes", e.target.value)}>
                {MESES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-cinza-tinta mb-1.5 font-medium">Qtde de vídeos</label>
              <input className="input" type="number" min={1} value={form.qtde} onChange={(e) => set("qtde", e.target.value)} />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-cinza-tinta mb-1.5 font-medium">Data do pedido</label>
              <input className="input" type="date" value={form.data_pedido} onChange={(e) => set("data_pedido", e.target.value)} />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-cinza-tinta mb-1.5 font-medium">Previsão de entrega</label>
              <input className="input" type="date" value={form.entrega} onChange={(e) => set("entrega", e.target.value)} />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-cinza-tinta mb-1.5 font-medium">Fila de edição</label>
              <input className="input" value={form.fila_edicao} onChange={(e) => set("fila_edicao", e.target.value)} placeholder="Ex: ✅" />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-cinza-tinta mb-1.5 font-medium">Caminho do arquivo</label>
              <input className="input" value={form.caminho_arquivo} onChange={(e) => set("caminho_arquivo", e.target.value)} placeholder="Link ou caminho" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs uppercase tracking-wider text-cinza-tinta mb-1.5 font-medium">Observação</label>
              <textarea
                className="input min-h-[80px] resize-y"
                value={form.observacao}
                onChange={(e) => set("observacao", e.target.value)}
                placeholder="Instruções de edição, estilo, detalhes..."
              />
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <input
                id="subiu"
                type="checkbox"
                checked={form.subiu_campanha}
                onChange={(e) => set("subiu_campanha", e.target.checked)}
                className="w-4 h-4 accent-tinta"
              />
              <label htmlFor="subiu" className="text-sm text-cinza-tinta cursor-pointer">Subiu campanha</label>
            </div>
          </div>

          {error && (
            <p className="text-terracota text-sm bg-terracota-claro px-3 py-2 rounded">{error}</p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-linha">
            {isEdit ? (
              <button type="button" onClick={handleDelete} className="btn-danger text-sm">
                Excluir pedido
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? "Salvando..." : isEdit ? "Salvar" : "Criar pedido"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
