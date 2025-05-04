# FURIAX - Plataforma de Engajamento para Fãs da FURIA Esports

## Documentação Técnica e Manual do Usuário

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3. [Requisitos e Configuração](#3-requisitos-e-configuração)
4. [Componentes Principais](#4-componentes-principais)
5. [Sistema de Gamificação](#5-sistema-de-gamificação)
6. [Guia do Usuário](#6-guia-do-usuário)
7. [Administração da Plataforma](#7-administração-da-plataforma)
8. [Solução de Problemas](#8-solução-de-problemas)
9. [Extensões e Personalização](#9-extensões-e-personalização)
10. [FAQ](#10-faq)

---

## 1. Visão Geral

O **FURIAX** é uma plataforma web interativa e gamificada projetada para criar um ecossistema digital para fãs da organização de esports FURIA. A plataforma transforma a experiência de ser um fã em uma jornada progressiva com missões, conquistas, níveis e interações sociais.

### 1.1 Objetivos Principais

- Criar engajamento contínuo com a base de fãs
- Oferecer experiências personalizadas com base no perfil de cada fã
- Estimular a interação entre membros da comunidade
- Coletar dados de fãs para entender melhor seus interesses e comportamentos
- Incentivar a participação em eventos e consumo de produtos oficiais

### 1.2 Público-Alvo

- Fãs da FURIA Esports de todas as idades
- Comunidade de jogadores e entusiastas de esports
- Seguidores de diferentes modalidades (CS:GO, VALORANT, League of Legends, etc.)

### 1.3 Escopo Funcional

A plataforma oferece:

- Sistema de login e perfil personalizado
- Feed social com posts, comentários e interações
- Mini-games com sistema de recompensas
- Assistente virtual baseado em IA 
- Recomendações personalizadas de experiências
- Formulário detalhado para conhecer o perfil do fã
- Sistema de níveis e conquistas

---

## 2. Arquitetura do Sistema

### 2.1 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Bibliotecas de UI**: Font Awesome 6.0.0-beta3
- **Tipografia**: Google Fonts (Orbitron, Exo 2)
- **Armazenamento**: LocalStorage
- **Animações**: CSS3 Animations, Transitions
- **Efeitos Visuais**: Particles.js

### 2.2 Estrutura de Diretórios


### 2.3 Diagrama de Componentes

- **Módulo de Autenticação**: Login, registro e sessões
- **Módulo de Perfil**: Dados do usuário
- **Módulo Comunitário**: Feed social
- **Módulo de Gamificação**: XP, níveis e recompensas
- **Módulo IA**: Assistente virtual
- **Módulo de Recomendação**: Sugestões personalizadas
- **Módulo de Coleta de Dados**: Formulário "Know Your Fan"

---

## 3. Requisitos e Configuração

### 3.1 Requisitos do Sistema

**Servidor Web:**

- Apache 2.4+ ou Nginx 1.14+
- Suporte a arquivos estáticos
- HTTPS recomendado

**Navegadores Suportados:**

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Opera 60+

**Armazenamento:**

- 200MB mínimos
- Espaço adicional para usuários/conteúdo

### 3.2 Configuração do Ambiente

#### Produção:

1. Enviar arquivos ao servidor
2. Permissões: `755` para diretórios, `644` para arquivos
3. Configurar `.htaccess` (se usar Apache)
4. Habilitar cache estático
5. Usar HTTPS com certificado SSL

#### Desenvolvimento:

1. Clonar repositório localmente
2. Usar Live Server ou `http-server`
3. Acessar via `localhost`
4. Depurar com console do navegador

### 3.3 Integração com Redes Sociais

1. Obter credenciais de desenvolvedor
2. Configurar chaves de API
3. Definir URLs de callback
4. Testar antes de produção

---

## 4. Componentes Principais

### 4.1 Sistema de Autenticação (`login.html`)

Funcionalidades:

- Login com email/usuário
- Registro e recuperação de senha
- Autenticação social
- Sessão no navegador

Uso:

1. Acessar `login.html`
2. Inserir credenciais ou usar redes sociais
3. Preencher perfil no primeiro acesso

### 4.2 Perfil de Usuário (`profile.html`)

Funcionalidades:

- Editar dados e avatar
- Estatísticas e biografia
- Conquistas e badges

### 4.3 Comunidade Social (`community.html`)

Funcionalidades:

- Feed com posts e imagens
- Curtidas, comentários, enquetes
- Análises de engajamento

### 4.4 Mini-Games (`missions.html`)

- Quiz FURIA, Palavra do Dia
- Previsões de partidas
- Ranking e recompensas

### 4.5 Know Your Fan (`know-your-fan.html`)

- Formulário com várias etapas
- Recompensas por preenchimento
- Geração de perfil comportamental

### 4.6 Assistente Virtual (`ia.html`)

- 4 personagens: Assistente, arT, KSCERATO, Coach
- Chat com sugestões e histórico

### 4.7 Recomendações Personalizadas (`recommendss.html`)

- Sugestões de eventos, produtos e conteúdo
- Filtros, VIP, personalização

---

## 5. Sistema de Gamificação

### 5.1 Níveis e Progressão

| Nível         | Faixa de XP   | Descrição                             |
|---------------|---------------|----------------------------------------|
| Novato        | 0-500         | Primeiros passos                      |
| Furioso       | 501-2000      | Engajamento intermediário             |
| Elite         | 2001-5000     | Alto engajamento                      |
| Lenda         | 5001+         | Status máximo                         |

XP é ganho com:

- Mini-games: `20-100 XP`
- Atividades sociais: `5-20 XP`
- Formulários: `25-500 XP`
- Eventos: `50-200 XP`
- Streaks diários: `10-50 XP`

### 5.2 Conquistas e Badges

Tipos de Badges:

- Azul: missões básicas
- Dourada: fidelidade
- Roxa: conquistas especiais
- Vermelha: eventos presenciais
- Verde: desafios comunitários

### 5.3 Missões

**Diárias:**

- Quiz
- Palavra do Dia
- Previsões

**Semanais:**

- Eventos, posts, compartilhamento

**Especiais:**

- Campeonatos, caça ao tesouro, missões em grupo

---

## 6. Guia do Usuário

_(continua no próximo capítulo da documentação...)_
