# 🚐 MinhaRota - Sistema de Gestão de Passageiros

O **MinhaRota** é uma aplicação Fullstack desenvolvida para resolver um problema real de logística diária: a gestão de listas de passageiros em vans de transporte universitário, transformando mensagens despadronizadas do WhatsApp em rotas otimizadas e interativas.

🔗 **[Acessar a Aplicação em Produção](https://minharota-eta.vercel.app/)**
*(Nota: O back-end está hospedado no tier gratuito do Render. O primeiro carregamento pode levar ~50 segundos para despertar o servidor).*

*👉 O código-fonte da API em Spring Boot (Back-end) está [neste repositório](https://github.com/MarquitosBR88/van-connect-backend).*

## O Problema Resolvido
Motoristas recebiam listas caóticas diariamente via WhatsApp, com alunos usando apelidos, errando nomes de faculdades e solicitando viagens "só de ida" ou "só de volta". O controle era manual, propenso a falhas, e fora de ordem, o que exigia conferência manual atrasando a rota.

## A Solução (Features)
* **Parser Inteligente:** Motor de text-processing que lê a string do WhatsApp, limpa ruídos (como números e caracteres especiais), resolve identidades e classifica os passageiros em "Rota Principal", "Revisão Manual" ou "Somente Retorno".
* **Single Source of Truth (SSOT):** Tela de chamada em tempo real. O estado do aplicativo é sincronizado instantaneamente entre o Carrossel interativo e a Visão Geral de controle.
* **CRUD Completo:** Gestão relacional de Alunos e Faculdades.
* **UX/UI Corporativa:** Feedback visual instantâneo com Toasts, proteção contra cliques duplos e navegação fluida construída com Tailwind CSS.

## Arquitetura e Tecnologias

**Front-end (Client-side):**
* **React + Vite:** Alta performance e tempo de build otimizado.
* **TypeScript:** Tipagem estática para maior previsibilidade e redução de bugs.
* **Tailwind CSS v4 + Lucide React:** Design System responsivo, limpo e padronizado.
* **Axios & Sonner:** Comunicação HTTP robusta e tratamento de exceções amigável.

**Back-end (API REST):**
* **Java 25 + Spring Boot:** Arquitetura sólida e escalável em sua versão LTS mais recente.
* **Spring Data JPA / Hibernate:** Mapeamento objeto-relacional (ORM).
* **PostgreSQL:** Banco de dados relacional em nuvem.
* **Docker:** Contêinerização da aplicação usando a imagem `amazoncorretto:25` para deploy no Render.

## Como executar localmente

### Rodando o App (Front-end)
```bash
cd frontend
npm install
npm run dev
```
