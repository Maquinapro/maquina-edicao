# Máquina de Edição — Controle de Conteúdo

Sistema de controle de pedidos de edição de vídeo da Máquina Estúdio.

## Stack
- **Next.js 14** (App Router) — frontend + API
- **Supabase** — banco de dados + autenticação
- **Tailwind CSS** — estilização com a paleta Máquina Estúdio
- **Vercel** — deploy

---

## 1. Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **SQL Editor** e cole todo o conteúdo de `supabase/schema.sql` e execute
3. Copie a **URL** e a **anon key** em Project Settings → API

---

## 2. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui  # só para importação
```

---

## 3. Instalar e rodar localmente

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

---

## 4. Criar os editores no Supabase Auth

Para cada editora (Karina, Carline, etc.), crie o usuário:

1. Vá em **Supabase → Authentication → Users**
2. Clique em **Add user**
3. Informe nome, e-mail e senha
4. Depois, na aba **Cadastros** do sistema, cadastre os editores com os mesmos e-mails

> Os editores fazem login com e-mail + senha. O admin convida via painel do Supabase.

---

## 5. Importar histórico da planilha

Após criar os editores no sistema:

```bash
# Com a service role key configurada no .env.local:
node scripts/import-historico.mjs
```

Isso importa todos os **234 pedidos históricos** (Jul/2025 → Mai/2026).

---

## 6. Deploy no Vercel

```bash
# Se ainda não tem a CLI:
npm i -g vercel

vercel
```

Configure as variáveis de ambiente no Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Estrutura do projeto

```
src/
├── app/
│   ├── auth/login/       → Página de login
│   ├── dashboard/        → Dashboard principal + cards de pedidos
│   └── cadastros/        → CRUD de editores e status
├── components/
│   ├── layout/Header     → Cabeçalho com logo, usuário e data
│   └── ui/
│       ├── StatusBadge   → Badge colorido por status
│       └── PedidoModal   → Modal de criação/edição de pedidos
└── lib/
    ├── supabase/         → Clients browser e server
    └── types.ts          → Tipos TypeScript

supabase/
└── schema.sql            → Schema completo do banco

scripts/
└── import-historico.mjs  → Importação dos 234 registros históricos
```

---

## Funcionalidades

### Dashboard
- Métricas: total de pedidos, vídeos, em fila, concluídos
- Cards por pedido com status, editor, datas, qtde, observações
- Filtro por status (abas) + busca por clínica/editor
- Botão rápido "Concluir / Reabrir" em cada card

### Pedidos
- Criar novo pedido via modal
- Editar qualquer campo
- Excluir pedido
- Marcar subiu campanha

### Cadastros
- **Editores**: cadastrar, editar, ativar/desativar, excluir
- **Status**: cadastrar com cor personalizada (picker de cor), editar, reordenar, ocultar

---

## Paleta de cores (Máquina Estúdio)

| Token | Hex | Uso |
|-------|-----|-----|
| `creme` | `#F5F1EA` | Fundo principal |
| `marfim` | `#FFFDF8` | Cards e painéis |
| `tinta` | `#1A1A1A` | Texto principal |
| `terracota` | `#C8472B` | Acento, destaques |
| `cinza-tinta` | `#555048` | Textos secundários |
| `cinza-poeira` | `#8B8478` | Textos sutis |
| `linha` | `#D9D3C5` | Bordas |
