# Deploy online

## Arquitetura recomendada

- Frontend Angular: Vercel.
- Backend Spring Boot: Render.
- Banco PostgreSQL: Render Postgres.

Vercel hospeda bem o frontend estatico, mas nao e a opcao adequada para rodar PostgreSQL em container nem uma API Spring Boot persistente.

## Backend + PostgreSQL no Render

O arquivo `render.yaml` na raiz do repositorio cria:

- Web Service Docker `reserva-mesas-api`.
- Banco PostgreSQL `reserva-mesas-db`.
- Variaveis de ambiente do Spring apontando para o banco.

Passos:

1. Acesse o Dashboard do Render.
2. Clique em New > Blueprint.
3. Conecte o repositorio `FrankLyra/reserva_mesa`.
4. Confirme o blueprint encontrado em `render.yaml`.
5. Antes do primeiro deploy, preencha a variavel `CORS_ALLOWED_ORIGINS` com a URL do frontend na Vercel.

Exemplo:

```text
CORS_ALLOWED_ORIGINS=https://seu-projeto.vercel.app
```

Depois do deploy, a API ficara em uma URL parecida com:

```text
https://reserva-mesas-api.onrender.com/api
```

Use essa URL como `API_URL` no frontend da Vercel.

## Zerar base no Render uma unica vez

Para limpar a base e recriar somente o administrador, adicione temporariamente no Render:

```text
RESET_DATABASE_ON_START=true
ADMIN_EMAIL=admin@reservas.com
ADMIN_PASSWORD=sua-senha-admin
```

Depois faca um deploy do backend. Quando a aplicacao subir, ela apaga reservas, mesas, eventos e usuarios, e cria apenas o admin.

Em seguida, remova `RESET_DATABASE_ON_START` ou troque para:

```text
RESET_DATABASE_ON_START=false
```

Faca outro deploy. Nao deixe `RESET_DATABASE_ON_START=true`, porque a base sera apagada novamente em todo restart ou deploy.

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
