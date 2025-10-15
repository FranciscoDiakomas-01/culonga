🛒 Sistema de Vendas Multiusuário

Um sistema completo de vendas que suporta múltiplos usuários, com painel de administração, controle de vendas, checkout com diferentes métodos de pagamento (incluindo Express e referência), além de relatórios e gestão de produtos.

✨ Funcionalidades

👥 Multiusuário: diferentes papéis (Administrador, Vendedor, Cliente).

📦 Gestão de produtos: cadastro, atualização e exclusão de produtos.

💰 Vendas: fluxo de compra com carrinho, checkout e emissão de comprovantes.

🧾 Pagamentos: integração com Express e pagamentos por referência.

📊 Dashboard administrativo: relatórios de vendas, usuários e métricas.

🔐 Autenticação e autorização com níveis de acesso.

📱 Design responsivo para desktop e mobile.

🛠️ Tecnologias Utilizadas
Backend

Node.js com Express

Prisma ORM

MySQL/PostgreSQL (dependendo da config)

JWT para autenticação

Frontend

React.js / Next.js

TailwindCSS + Shadcn/UI

React Query / Zustand (gestão de estado e requests)

Outros

Docker (opcional)

API REST bem estruturada

CI/CD (GitHub Actions ou similar)

⚙️ Instalação e Execução
Pré-requisitos

Node.js >= 18

Banco de dados MySQL ou PostgreSQL

Git

Passos
# Clone o repositório
git clone https://github.com/seu-usuario/seu-repo.git

# Entre na pasta
cd seu-repo

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Rode as migrations
npx prisma migrate dev

# Inicie o servidor
npm run dev

📂 Estrutura do Projeto
📦 sistema-vendas
 ┣ 📂 backend
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 modules
 ┃ ┃ ┃ ┣ 📂 users
 ┃ ┃ ┃ ┣ 📂 products
 ┃ ┃ ┃ ┗ 📂 sales
 ┃ ┃ ┣ app.ts
 ┃ ┃ ┗ server.ts
 ┣ 📂 frontend
 ┃ ┣ 📂 components
 ┃ ┣ 📂 pages
 ┃ ┣ 📂 hooks
 ┃ ┗ 📂 styles
 ┣ .env.example
 ┣ README.md
 ┗ package.json

🚀 Futuras Implementações

Integração com mais gateways de pagamento.

Sistema de cupons e descontos.

Notificações em tempo real (WebSocket).

Relatórios avançados com gráficos interativos.

📜 Licença

Este projeto está sob a licença MIT.