# Deploy online

## Arquitetura recomendada

- Frontend Angular: Vercel.
- Backend Spring Boot: servidor/container Docker, Render, Railway, Fly.io ou VPS.
- Banco PostgreSQL: gerenciado por Neon/Supabase/Railway/Render ou container PostgreSQL no mesmo servidor do backend.

Vercel hospeda bem o frontend estatico, mas nao e a opcao adequada para rodar PostgreSQL em container nem uma API Spring Boot persistente.

## Backend + PostgreSQL com Docker

Copie o exemplo de variaveis:

```bash
cp .env.prod.example .env.prod
```

Edite `.env.prod` com senhas reais e a URL do frontend Vercel:

```text
POSTGRES_PASSWORD=senha-forte
JWT_SECRET=chave-com-pelo-menos-32-caracteres
CORS_ALLOWED_ORIGINS=https://seu-projeto.vercel.app
```

Suba:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

API:

```text
http://SEU_SERVIDOR:8081/api
```

## Frontend na Vercel

Configure o projeto da Vercel apontando para a pasta:

```text
frontend
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist/reserva-mesas-frontend
```

Variavel de ambiente na Vercel:

```text
API_URL=https://sua-api-online.com/api
```

O arquivo `src/assets/env.js` e gerado no build e injeta a URL da API no Angular.
