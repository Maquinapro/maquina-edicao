interface StatusBadgeProps {
  status: string;
  statusOpcoes?: { nome: string; cor: string; cor_bg: string }[];
}

const defaultColors: Record<string, { cor: string; cor_bg: string }> = {
  "Em fila":   { cor: "#B8862C", cor_bg: "#F7EDDA" },
  "Concluido": { cor: "#4A6B3A", cor_bg: "#E0EDDA" },
  "Pausado":   { cor: "#2C5E7A", cor_bg: "#D6EAF3" },
  "Cancelado": { cor: "#C8472B", cor_bg: "#F5D6CD" },
};

export default function StatusBadge({ status, statusOpcoes }: StatusBadgeProps) {
  const opt = statusOpcoes?.find((s) => s.nome === status);
  const colors = opt
    ? { cor: opt.cor, cor_bg: opt.cor_bg }
    : defaultColors[status] ?? { cor: "#8B8478", cor_bg: "#EBE6DA" };

  return (
    <span
      className="badge text-xs font-medium"
      style={{ color: colors.cor, backgroundColor: colors.cor_bg }}
    >
      {status}
    </span>
  );
}
