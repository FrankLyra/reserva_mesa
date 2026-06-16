# Sistema de Reserva de Mesas

Projeto web para reserva de mesas em eventos, com backend Java Spring Boot e frontend Angular.

## Estrutura

```text
backend/   API REST Spring Boot 3, Java 17+, JPA, Security JWT, Validation
frontend/  Angular 17 standalone, TypeScript e Bootstrap
```

## Requisitos locais

- Java 17 ou superior
- Maven 3.9 ou superior
- Node.js 20 ou superior
- npm 10 ou superior
- Angular CLI 17 ou superior
- PostgreSQL opcional para ambiente persistente

Na maquina atual, Java foi encontrado, mas `mvn`, `node`, `npm` e `ng` nao estavam no PATH no momento da criacao do projeto.

## Backend

O backend inicia com H2 em memoria por padrao, entao pode rodar sem PostgreSQL:

```bash
cd backend
mvn spring-boot:run
```

URL base:

```text
http://localhost:8081/api
```

Usuarios de teste criados automaticamente:

```text
admin@reservas.com / admin123
cliente@reservas.com / cliente123
```

Para usar PostgreSQL, suba o banco com Docker:

```bash
docker compose up -d db
```

Depois rode o backend com variaveis:

```bash
DB_URL=jdbc:postgresql://localhost:5432/reserva_mesas
DB_USERNAME=reserva
DB_PASSWORD=reserva
JWT_SECRET=troque-esta-chave-com-pelo-menos-32-caracteres
```

## Frontend

```bash
cd frontend
npm install
npm start
```

URL:

```text
http://localhost:4200
```

O acesso passa pela tela de login e salva o token JWT no `localStorage`.

## Acesso ao sistema

Abra:

```text
http://localhost:4200/login
```

Credenciais:

```text
Admin:   admin@reservas.com / admin123
Cliente: cliente@reservas.com / cliente123
```

O admin entra em `/admin` para criar eventos, filtrar reservas, confirmar pagamentos manualmente e cancelar reservas pendentes ou pagas, mantendo historico. O cliente entra em `/reservas` para reservar mesas.
Novos usuarios podem se cadastrar em `/cadastro` informando e-mail, senha, nome completo, telefone, tipo de usuario, bloco/apartamento para moradores e setor desejado.

## Endpoints principais

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/eventos`
- `POST /api/admin/eventos`
- `GET /api/mesas/evento/{eventoId}/status`
- `POST /api/reservas/verificar-disponibilidade`
- `POST /api/reservas`
- `POST /api/reservas/lote`
- `GET /api/admin/reservas`
- `PATCH /api/admin/reservas/{id}/confirmar-pagamento`
- `PATCH /api/admin/reservas/{id}/cancelar`

## Regra de overbooking

Antes de salvar uma reserva, o backend consulta reservas da mesma mesa e das mesmas datas com status:

- `PAGO`
- `PENDENTE` com PIX ainda nao expirado

Se houver conflito, a API retorna HTTP `409 Conflict` com `datasConflitantes`. O frontend remove automaticamente essas datas do carrinho e atualiza a agenda da mesa.
