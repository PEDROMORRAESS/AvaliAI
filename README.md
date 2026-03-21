# Dashboard APONTE — Fazendão

Dashboard web para visualização de dados de qualidade de atendimento baseado na metodologia **APONTE**.

## Stack

- **Next.js 14** (App Router + SSR)
- **TypeScript** — tudo tipado
- **Tailwind CSS** + shadcn/ui
- **Recharts** — gráficos (Donut, Line, Bar, Radar)
- **NextAuth.js** — autenticação JWT
- **PostgreSQL** via `pg` — conecta direto no Supabase

---

## Setup rápido

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env`:

```bash
DATABASE_URL=postgresql://postgres:SUA_SENHA@db.vgawovbxbvtbyrcwdrto.supabase.co:5432/postgres
NEXTAUTH_SECRET=gere-com-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@fazendao.com.br
ADMIN_PASSWORD_HASH=$2b$10$...
```

### 3. Gerar hash da senha admin

```bash
node -e "const b=require('bcryptjs'); b.hash('SUA_SENHA',10).then(h=>console.log(h))"
```

Cole o hash gerado no `ADMIN_PASSWORD_HASH` do `.env`.

### 4. Rodar em desenvolvimento

```bash
npm run dev
# Acesse http://localhost:3000
```

---

## Deploy na VPS com Docker

### Build e sobe

```bash
cp .env.example .env
# Edite o .env com as credenciais reais

docker compose up -d --build
```

### Verificar

```bash
docker compose logs -f app
```

### Atualizar após mudanças

```bash
git pull
docker compose up -d --build
```

---

## Estrutura

```
src/
├── app/
│   ├── api/dashboard/     → 8 endpoints REST
│   ├── api/auth/          → NextAuth
│   ├── dashboard/         → Página principal
│   └── login/             → Login
├── components/
│   ├── dashboard/         → KPICards, Charts, Table, Modal, Filters, Warnings
│   └── layout/            → Header
├── lib/
│   ├── db.ts              → Pool PostgreSQL
│   ├── queries.ts         → Todas as queries SQL
│   └── utils.ts           → Helpers
└── types/
    └── dashboard.ts       → Tipos TypeScript
```

---

## API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard/summary` | KPIs principais |
| GET | `/api/dashboard/classifications` | Distribuição por classificação |
| GET | `/api/dashboard/evolution` | Série temporal |
| GET | `/api/dashboard/agents` | Ranking de agentes |
| GET | `/api/dashboard/criteria` | Performance por critério APONTE |
| GET | `/api/dashboard/evaluations` | Lista paginada com filtros |
| GET | `/api/dashboard/evaluation/:id` | Detalhe completo |
| GET | `/api/dashboard/warnings` | Análise de advertências |

**Parâmetros comuns:** `period=30d`, `start_date`, `end_date`, `agent`, `department`

---

## Tabela esperada no Supabase

`fazendao_aponte_relatorio` — veja os campos em `src/types/dashboard.ts`
