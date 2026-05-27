# 🛍️ ProductStore

Aplicação full-stack para gestão de produtos de uma loja, desenvolvida como parte de um teste técnico. O projeto é composto por uma **API REST em ASP.NET Core (.NET 10)** e um **front-end em Next.js 16 com React 19**.

---

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Regras de Negócio](#regras-de-negócio)
- [Pré-requisitos](#pré-requisitos)
- [Configuração e Execução](#configuração-e-execução)
  - [Back-end](#back-end)
  - [Front-end](#front-end)
- [Vídeos — Desenvolvimento ao Vivo](#vídeos--desenvolvimento-ao-vivo)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura do Projeto](#estrutura-do-projeto)

---

## Visão Geral

A aplicação permite gerenciar o catálogo de produtos de uma loja, com suporte a criação, listagem paginada, edição e exclusão. Todas as regras de negócio são validadas no back-end, com respostas de erro estruturadas e logs de auditoria.

---

## Tecnologias Utilizadas

**Back-end**
- .NET 10 / ASP.NET Core Web API
- Entity Framework Core 10 + Npgsql (PostgreSQL)
- Serilog (logging estruturado)
- Swagger / OpenAPI

**Front-end**
- Next.js 16 (App Router)
- React 19
- TanStack Query v5 (gerenciamento de estado assíncrono)
- React Hook Form + Zod (formulários e validação)
- Tailwind CSS v4
- Sonner (notificações toast)

**Banco de Dados**
- PostgreSQL

**Infraestrutura**
- Docker + Docker Compose (PostgreSQL)

---

## Arquitetura

O back-end segue uma arquitetura em camadas com separação clara de responsabilidades:

```
Controller → Service → Repository (EF Core) → PostgreSQL
```

- **Controllers** — recebem requisições HTTP e delegam ao serviço
- **Services** — contêm as regras de negócio e orquestram operações
- **DTOs** — separam o contrato da API das entidades do banco
- **Middleware de Exceções** — captura erros e retorna respostas JSON padronizadas
- **Migrations** — versionamento do schema via EF Core

---

## Regras de Negócio

Todas validadas no back-end (camada de serviço):

| Regra | Descrição |
|---|---|
| **Estoque não-negativo** | Não é permitido registrar produtos com estoque inferior a zero |
| **Preço mínimo para Eletrônicos** | Produtos da categoria `Eletrônicos` devem ter preço ≥ R$ 50,00 |
| **SKU único** | Cada produto deve ter um SKU exclusivo; duplicatas são rejeitadas com HTTP 409 |

Erros de validação retornam respostas estruturadas no formato `{ "error": "mensagem" }`.

---

## Pré-requisitos

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) + Docker Compose (para o banco de dados)

---

## Configuração e Execução

### Back-end

1. **Suba o banco de dados com Docker:**

```bash
cd backend/ProductStore
docker compose up -d
```

O PostgreSQL ficará disponível em `localhost:5432` com as credenciais padrão (`postgres/postgres`).

2. **Execute a API** (as migrations são aplicadas automaticamente na inicialização):

```bash
cd ProductStore.API
dotnet run
```

A API ficará disponível em `http://localhost:5062`.  
A documentação Swagger estará em `http://localhost:5062/swagger`.

> As migrations do EF Core são aplicadas automaticamente via `db.Database.Migrate()` na inicialização. Não é necessário rodar `dotnet ef database update` manualmente.

---

### Front-end

1. **Instale as dependências:**

```bash
cd frontend/productstore-front
npm install
```

2. **Execute em modo de desenvolvimento:**

```bash
npm run dev
```

O front-end ficará disponível em `http://localhost:3000`.

> O front-end aponta para a API em `http://localhost:5062/api` por padrão (configurado em `lib/api.ts`).

---

## 🎥 Vídeos — Desenvolvimento ao Vivo

O projeto foi desenvolvido ao vivo e gravado em duas partes:

| Parte | Conteúdo | Link |
|---|---|---|
| **Parte 1** | Back-end (ASP.NET Core, EF Core, regras de negócio) | [Assistir no YouTube](https://youtube.com/live/P7ccPuNWRp4?feature=share) |
| **Parte 2** | Front-end (Next.js, TanStack Query, formulários) | [Assistir no YouTube](https://youtube.com/live/Ee4t-9qsdOk?feature=share) |
| **Demonstração** | Aplicação completa em funcionamento | [Assistir no YouTube](https://youtu.be/I3PzQawAJPo) |

---

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/products?page=1&pageSize=10` | Lista produtos paginados |
| `GET` | `/api/products/{id}` | Busca produto por ID |
| `POST` | `/api/products` | Cria novo produto |
| `PUT` | `/api/products/{id}` | Atualiza produto existente |
| `DELETE` | `/api/products/{id}` | Remove produto |

**Exemplo de payload (POST/PUT):**

```json
{
  "name": "Smartphone XYZ",
  "sku": "SMRTXYZ-001",
  "category": "Eletrônicos",
  "price": 999.90,
  "stock": 15
}
```

**Exemplo de resposta paginada:**

```json
{
  "page": 1,
  "pageSize": 10,
  "totalCount": 42,
  "totalPages": 5,
  "data": [...]
}
```

---

## Estrutura do Projeto

```
├── backend/
│   └── ProductStore/
│       └── ProductStore.API/
│           ├── Controllers/       # Endpoints HTTP
│           ├── DTOs/              # Objetos de transferência de dados
│           ├── Data/              # DbContext e configurações EF Core
│           ├── Middleware/        # Tratamento global de exceções
│           ├── Migrations/        # Migrations do banco de dados
│           ├── Models/            # Entidades do domínio
│           ├── Services/          # Regras de negócio
│           └── Program.cs         # Configuração da aplicação
│
└── frontend/
    └── productstore-front/
        ├── app/                   # Páginas (Next.js App Router)
        ├── components/            # Componentes reutilizáveis
        ├── lib/                   # Cliente HTTP e schemas de validação
        └── types/                 # Tipos TypeScript compartilhados
```
