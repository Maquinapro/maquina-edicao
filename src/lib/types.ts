export interface Editor {
  id: string;
  user_id: string | null;
  nome: string;
  email: string;
  ativo: boolean;
  created_at: string;
}

export interface StatusOpcao {
  id: string;
  nome: string;
  cor: string;
  cor_bg: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
}

export interface Pedido {
  id: string;
  mes: string | null;
  clinica: string;
  editor_id: string | null;
  editor_nome: string | null;
  status: string;
  data_pedido: string | null;
  entrega: string | null;
  qtde: number;
  fila_edicao: string | null;
  caminho_arquivo: string | null;
  subiu_campanha: boolean;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  total_pedidos: number;
  total_videos: number;
  em_fila: number;
  videos_em_fila: number;
  concluidos: number;
}
