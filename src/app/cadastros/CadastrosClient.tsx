"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Editor, StatusOpcao } from "@/lib/types";
import Link from "next/link";

interface Props {
  initialEditores: Editor[];
  initialStatus: StatusOpcao[];
}

export default function CadastrosClient({ initialEditores, initialStatus }: Props) {
  const supabase = createClient();
  const [editores, setEditores] = useState<Editor[]>(initialEditores);
  const [statusList, setStatusList] = useState<StatusOpcao[]>(initialStatus);
  const [tab, setTab] = useState<"editores" | "status">("editores");

  // Editor form
  const [editorForm, setEditorForm] = useState({ nome: "", email: "" });
  const [editorError, setEditorError] = useState("");
  const [editorLoading, setEditorLoading] = useState(false);

  // Status form
  const [statusForm, setStatusForm] = useState({ nome: "", cor: "#8B8478", cor_bg: "#EBE6DA", ordem: "0" });
  const [statusError, setStatusError] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  // Editing states
  const [editingEditor, setEditingEditor] = useState<Editor | null>(null);
  const [editingStatus, setEditingStatus] = useState<StatusOpcao | null>(null);

  async function refreshEditores() {
    const { data } = await supabase.from("editores").select("*").order("nome");
    if (data) setEditores(data);
  }

  async function refreshStatus() {
    const { data } = await supabase.from("status_opcoes").select("*").order("ordem");
    if (data) setStatusList(data);
  }

  // --- EDITORES ---
  async function saveEditor(e: React.FormEvent) {
    e.preventDefault();
    if (!editorForm.nome || !editorForm.email) { setEditorError("Preencha nome e e-mail."); return; }
    setEditorLoading(true); setEditorError("");

    if (editingEditor) {
      const { error } = await supabase.from("editores").update({
        nome: editorForm.nome, email: editorForm.email
      }).eq("id", editingEditor.id);
      if (error) setEditorError(error.message);
      else { setEditingEditor(null); setEditorForm({ nome: "", email: "" }); await refreshEditores(); }
    } else {
      // Invite user via Supabase Auth (admin API needed for production, simplified here)
      const { error } = await supabase.from("editores").insert({
        nome: editorForm.nome, email: editorForm.email
      });
      if (error) setEditorError(error.message);
      else { setEditorForm({ nome: "", email: "" }); await refreshEditores(); }
    }
    setEditorLoading(false);
  }

  async function toggleEditorAtivo(ed: Editor) {
    await supabase.from("editores").update({ ativo: !ed.ativo }).eq("id", ed.id);
    await refreshEditores();
  }

  async function deleteEditor(id: string) {
    if (!confirm("Excluir este editor?")) return;
    await supabase.from("editores").delete().eq("id", id);
    await refreshEditores();
  }

  function startEditEditor(ed: Editor) {
    setEditingEditor(ed);
    setEditorForm({ nome: ed.nome, email: ed.email });
  }

  // --- STATUS ---
  async function saveStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!statusForm.nome) { setStatusError("Informe o nome do status."); return; }
    setStatusLoading(true); setStatusError("");

    if (editingStatus) {
      const { error } = await supabase.from("status_opcoes").update({
        nome: statusForm.nome, cor: statusForm.cor, cor_bg: statusForm.cor_bg, ordem: Number(statusForm.ordem)
      }).eq("id", editingStatus.id);
      if (error) setStatusError(error.message);
      else { setEditingStatus(null); setStatusForm({ nome: "", cor: "#8B8478", cor_bg: "#EBE6DA", ordem: "0" }); await refreshStatus(); }
    } else {
      const { error } = await supabase.from("status_opcoes").insert({
        nome: statusForm.nome, cor: statusForm.cor, cor_bg: statusForm.cor_bg, ordem: Number(statusForm.ordem)
      });
      if (error) setStatusError(error.message);
      else { setStatusForm({ nome: "", cor: "#8B8478", cor_bg: "#EBE6DA", ordem: "0" }); await refreshStatus(); }
    }
    setStatusLoading(false);
  }

  async function toggleStatusAtivo(s: StatusOpcao) {
    await supabase.from("status_opcoes").update({ ativo: !s.ativo }).eq("id", s.id);
    await refreshStatus();
  }

  async function deleteStatus(id: string) {
    if (!confirm("Excluir este status?")) return;
    await supabase.from("status_opcoes").delete().eq("id", id);
    await refreshStatus();
  }

  function startEditStatus(s: StatusOpcao) {
    setEditingStatus(s);
    setStatusForm({ nome: s.nome, cor: s.cor, cor_bg: s.cor_bg, ordem: String(s.ordem) });
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-3xl font-semibold tracking-tight">
            Cadastros
          </h2>
          <p className="text-sm text-cinza-poeira mt-1">Gerencie editores e opções de status</p>
        </div>
        <Link href="/dashboard" className="btn-secondary">← Voltar</Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-linha mb-6">
        {(["editores", "status"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm capitalize border-b-2 -mb-px transition-colors ${
              tab === t ? "border-tinta text-tinta font-medium" : "border-transparent text-cinza-poeira hover:text-cinza-tinta"
            }`}
          >
            {t === "editores" ? "Editores" : "Status"}
          </button>
        ))}
      </div>

      {/* EDITORES */}
      {tab === "editores" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <div className="card p-6">
            <h3 className="font-serif text-lg font-semibold mb-4">
              {editingEditor ? "Editar editor" : "Novo editor"}
            </h3>
            <form onSubmit={saveEditor} className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-cinza-tinta mb-1.5 font-medium">Nome</label>
                <input className="input" placeholder="Ex: Karina" value={editorForm.nome} onChange={e => setEditorForm(f => ({...f, nome: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-cinza-tinta mb-1.5 font-medium">E-mail</label>
                <input className="input" type="email" placeholder="karina@estudio.com" value={editorForm.email} onChange={e => setEditorForm(f => ({...f, email: e.target.value}))} />
              </div>
              {editorError && <p className="text-terracota text-xs bg-terracota-claro px-3 py-2 rounded">{editorError}</p>}
              <div className="flex gap-2 pt-1">
                {editingEditor && (
                  <button type="button" onClick={() => { setEditingEditor(null); setEditorForm({ nome: "", email: "" }); }} className="btn-secondary flex-1">Cancelar</button>
                )}
                <button type="submit" disabled={editorLoading} className="btn-primary flex-1 disabled:opacity-50">
                  {editorLoading ? "Salvando..." : editingEditor ? "Salvar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="space-y-2">
            {editores.length === 0 && (
              <div className="card p-6 text-center text-cinza-poeira text-sm">Nenhum editor cadastrado.</div>
            )}
            {editores.map((ed) => (
              <div key={ed.id} className={`card p-4 flex items-center justify-between ${!ed.ativo ? "opacity-50" : ""}`}>
                <div>
                  <p className="font-medium text-sm text-tinta">{ed.nome}</p>
                  <p className="text-xs text-cinza-poeira">{ed.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleEditorAtivo(ed)} className="text-xs text-cinza-poeira hover:text-cinza-tinta border border-linha rounded px-2 py-1">
                    {ed.ativo ? "Desativar" : "Ativar"}
                  </button>
                  <button onClick={() => startEditEditor(ed)} className="text-xs text-cinza-poeira hover:text-cinza-tinta border border-linha rounded px-2 py-1">Editar</button>
                  <button onClick={() => deleteEditor(ed.id)} className="text-xs text-terracota hover:text-terracota border border-terracota-claro rounded px-2 py-1">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATUS */}
      {tab === "status" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Form */}
          <div className="card p-6">
            <h3 className="font-serif text-lg font-semibold mb-4">
              {editingStatus ? "Editar status" : "Novo status"}
            </h3>
            <form onSubmit={saveStatus} className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-cinza-tinta mb-1.5 font-medium">Nome</label>
                <input className="input" placeholder="Ex: Em revisão" value={statusForm.nome} onChange={e => setStatusForm(f => ({...f, nome: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-cinza-tinta mb-1.5 font-medium">Cor do texto</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={statusForm.cor} onChange={e => setStatusForm(f => ({...f, cor: e.target.value}))} className="w-10 h-9 rounded border border-linha cursor-pointer p-0.5 bg-marfim" />
                    <input className="input flex-1" value={statusForm.cor} onChange={e => setStatusForm(f => ({...f, cor: e.target.value}))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-cinza-tinta mb-1.5 font-medium">Cor de fundo</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={statusForm.cor_bg} onChange={e => setStatusForm(f => ({...f, cor_bg: e.target.value}))} className="w-10 h-9 rounded border border-linha cursor-pointer p-0.5 bg-marfim" />
                    <input className="input flex-1" value={statusForm.cor_bg} onChange={e => setStatusForm(f => ({...f, cor_bg: e.target.value}))} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-cinza-tinta mb-1.5 font-medium">Ordem</label>
                <input className="input" type="number" value={statusForm.ordem} onChange={e => setStatusForm(f => ({...f, ordem: e.target.value}))} />
              </div>
              {/* Preview */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-cinza-poeira">Preview:</span>
                <span className="badge text-xs font-medium px-2 py-1" style={{ color: statusForm.cor, backgroundColor: statusForm.cor_bg }}>
                  {statusForm.nome || "Status"}
                </span>
              </div>
              {statusError && <p className="text-terracota text-xs bg-terracota-claro px-3 py-2 rounded">{statusError}</p>}
              <div className="flex gap-2 pt-1">
                {editingStatus && (
                  <button type="button" onClick={() => { setEditingStatus(null); setStatusForm({ nome: "", cor: "#8B8478", cor_bg: "#EBE6DA", ordem: "0" }); }} className="btn-secondary flex-1">Cancelar</button>
                )}
                <button type="submit" disabled={statusLoading} className="btn-primary flex-1 disabled:opacity-50">
                  {statusLoading ? "Salvando..." : editingStatus ? "Salvar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="space-y-2">
            {statusList.length === 0 && (
              <div className="card p-6 text-center text-cinza-poeira text-sm">Nenhum status cadastrado.</div>
            )}
            {statusList.map((s) => (
              <div key={s.id} className={`card p-4 flex items-center justify-between ${!s.ativo ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-3">
                  <span className="badge text-xs font-medium px-2 py-1" style={{ color: s.cor, backgroundColor: s.cor_bg }}>{s.nome}</span>
                  <span className="text-xs text-cinza-poeira">ordem: {s.ordem}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleStatusAtivo(s)} className="text-xs text-cinza-poeira hover:text-cinza-tinta border border-linha rounded px-2 py-1">
                    {s.ativo ? "Ocultar" : "Mostrar"}
                  </button>
                  <button onClick={() => startEditStatus(s)} className="text-xs text-cinza-poeira hover:text-cinza-tinta border border-linha rounded px-2 py-1">Editar</button>
                  <button onClick={() => deleteStatus(s.id)} className="text-xs text-terracota border border-terracota-claro rounded px-2 py-1">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
