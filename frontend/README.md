# Finance Frontend

Frontend em React 18 + TypeScript com Vite, Tailwind e React Query.

## Como rodar localmente

1) Instale dependencias:

```bash
npm install
```

2) Configure a API:

Crie um arquivo `.env` na pasta `frontend/` com:

```
VITE_API_URL=http://localhost:3333
```

3) Suba o ambiente:

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Autenticacao

- Login retorna `token` (JWT) e dados de usuario.
- O token fica salvo em `localStorage`.
- O Axios injeta `Authorization: Bearer <token>` automaticamente.
- Em 401 a sessao e limpa e o usuario volta para `/login`.

## Endpoints usados

Se o backend nao for lido aqui, o frontend assume este contrato:

- Auth: `POST /auth/register`, `POST /auth/login`
- Contas: `POST /contas`, `GET /contas`
- Categorias: `POST /categorias`, `GET /categorias`, `PUT /categorias/:id`, `DELETE /categorias/:id`
- Transacoes: `POST /transacoes`, `GET /transacoes`, `PUT /transacoes/:id`, `DELETE /transacoes/:id`
  - filtros: `month`, `year`, `accountId`, `categoryId`, `type`
- Dashboard: `GET /dashboard/resumo`, `GET /dashboard/despesas-por-categoria`, `GET /dashboard/fluxo-diario`
- Planos: `POST /planos`, `GET /planos`, `GET /planos/:id`, `PUT /planos/:id`, `DELETE /planos/:id`
- Itens do plano:
  - `POST /planos/:planId/itens`
  - `GET /planos/:planId/itens`
  - `PUT /planos/:planId/itens/:itemId`
  - `DELETE /planos/:planId/itens/:itemId`
  - `GET /planos/:planId/itens/:itemId/parcelas`
- Resumos:
  - `GET /planos/resumo-mensal?month=MM&year=YYYY`
  - `GET /projecao/mensal?startMonth=MM&startYear=YYYY&months=N`

## Observacoes

- Valores monetarios sao enviados em centavos (`amountCents`) e exibidos em `R$ 1.234,56`.
- Utilitarios em `src/utils/money.ts` cuidam de parse/formatacao.
- Todos os textos e mensagens seguem PT-BR.
