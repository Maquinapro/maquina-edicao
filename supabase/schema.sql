-- ============================================================
-- MÁQUINA DE EDIÇÃO — Schema Supabase
-- Cole no SQL Editor do Supabase e execute
-- ============================================================

-- Editores (sincronizado com auth.users via trigger)
create table if not exists public.editores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Lista de status disponíveis (gerenciável pelo admin)
create table if not exists public.status_opcoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  cor text not null default '#8B8478',
  cor_bg text not null default '#EBE6DA',
  ordem int not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Pedidos de edição
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  mes text,
  clinica text not null,
  editor_id uuid references public.editores(id) on delete set null,
  editor_nome text,  -- cache para histórico
  status text not null default 'Em fila',
  data_pedido date,
  entrega date,
  qtde int not null default 1,
  fila_edicao text,
  caminho_arquivo text,
  subiu_campanha boolean not null default false,
  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger para updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger pedidos_updated_at
  before update on public.pedidos
  for each row execute function update_updated_at();

-- ============================================================
-- DADOS INICIAIS: status padrão
-- ============================================================
insert into public.status_opcoes (nome, cor, cor_bg, ordem) values
  ('Em fila',   '#B8862C', '#F7EDDA', 1),
  ('Concluido', '#4A6B3A', '#E0EDDA', 2),
  ('Pausado',   '#2C5E7A', '#D6EAF3', 3),
  ('Cancelado', '#C8472B', '#F5D6CD', 4)
on conflict (nome) do nothing;

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
alter table public.editores enable row level security;
alter table public.status_opcoes enable row level security;
alter table public.pedidos enable row level security;

-- Qualquer usuário autenticado pode ler tudo
create policy "autenticados podem ler editores"
  on public.editores for select to authenticated using (true);

create policy "autenticados podem ler status"
  on public.status_opcoes for select to authenticated using (true);

create policy "autenticados podem ler pedidos"
  on public.pedidos for select to authenticated using (true);

-- Qualquer autenticado pode criar/editar pedidos
create policy "autenticados podem inserir pedidos"
  on public.pedidos for insert to authenticated with check (true);

create policy "autenticados podem atualizar pedidos"
  on public.pedidos for update to authenticated using (true);

create policy "autenticados podem deletar pedidos"
  on public.pedidos for delete to authenticated using (true);

-- Só autenticados gerenciam editores e status
create policy "autenticados gerenciam editores"
  on public.editores for all to authenticated using (true) with check (true);

create policy "autenticados gerenciam status"
  on public.status_opcoes for all to authenticated using (true) with check (true);

-- ============================================================
-- VIEW útil para dashboard
-- ============================================================
create or replace view public.pedidos_view as
select
  p.*,
  e.nome as editor_nome_atual
from public.pedidos p
left join public.editores e on e.id = p.editor_id;
