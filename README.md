# Portfólio Zero1Page — Data-Driven

Este portfólio foi criado para ser moderno, rápido e **extremamente fácil de atualizar**. Você não precisa mexer no código para adicionar novos projetos ou fotos — apenas nos arquivos de dados.

---

## Estrutura Principal: 2 Blocos

O sistema está dividido em **dois blocos independentes**:

| Bloco | O que é | Onde fica |
|---|---|---|
| **Cases / Portfólio** | Vitrine de trabalhos realizados (cases reais, demonstrativos e sistemas) | `src/data/global_authority.json` |
| **Proposta Comercial** | Oferta personalizada por cliente (preços, countdown, WhatsApp) | Supabase (tabela `propostas`) + `src/data/portfolioConfig.js` (fallback) |

> Esses dois blocos são **totalmente independentes**. Alterar um não afeta o outro.

---

## Bloco 1 — Cases / Portfólio

### As 3 Seções de Cases

Toda a vitrine de trabalhos vive em **`src/data/global_authority.json`** e é composta por três seções, exibidas nessa ordem:

#### 1. Cases de Sucesso (`projects`)
Projetos reais com resultados mensuráveis. Cada case tem título, tags, intro e múltiplas imagens com descrições.

```json
{
  "id": "nome-do-case",
  "title": "Nome do Projeto",
  "tags": ["Tag1", "Tag2"],
  "intro": "Descrição geral do projeto e resultados.",
  "items": [
    {
      "url": "/projects/ARQUIVO.jpg",
      "title": "Título da Imagem",
      "description": "O que essa imagem mostra."
    }
  ]
}
```

#### 2. Projetos Demonstrativos (`conceptual`)
Sites e projetos conceituais/demonstrativos. Cada item tem uma única imagem de destaque.

```json
{
  "id": "nome-do-conceitual",
  "title": "Título do Projeto",
  "image": "/projects/ARQUIVO.jpg",
  "description": "Descrição do que o projeto demonstra."
}
```

#### 3. Projetos de Programação (`fullstack`)
Sistemas e ferramentas full stack desenvolvidos. Mesma estrutura do `conceptual` (uma imagem por item).

```json
{
  "id": "nome-do-sistema",
  "title": "Nome do Sistema",
  "image": "/projects/ARQUIVO.jpg",
  "description": "Descrição do sistema e funcionalidades."
}
```

### Layout das Seções

| Seção | Layout Desktop | Layout Mobile |
|---|---|---|
| Cases de Sucesso | 1 card por linha (largura total, 2 imagens lado a lado dentro) | 1 coluna |
| Demonstrativos | **2 itens por linha** | 1 coluna |
| Full Stack | **2 itens por linha** | 1 coluna |

> As seções Demonstrativos e Full Stack compartilham as mesmas classes CSS (`conceptual-grid` / `conceptual-item`), garantindo visual e responsividade idênticos.

### Como adicionar um novo item

1. Capture a imagem com ShareX → salva automaticamente em `public/projects/`
2. Anote o nome do arquivo gerado (ex: `msedge_ABC123.png`)
3. Abra `src/data/global_authority.json`
4. Adicione o novo objeto no array da seção correta (`projects`, `conceptual` ou `fullstack`)

---

## Bloco 2 — Proposta Comercial

A proposta é **dinâmica por slug** e carregada do Supabase. Se o Supabase não responder em 5s, usa o fallback local (`portfolioConfig.js`).

### Roteamento

- `/` → portfólio padrão (`slug = 'default'`)
- `/:slug` → proposta personalizada (ex: `/20260302_01`)

### Configuração por proposta (Supabase — tabela `propostas`)

| Campo | Descrição |
|---|---|
| `slug` | Identificador único da proposta |
| `titulo_proposta` | Título exibido no hero |
| `mova_principal` | Preço principal do M.O.V.A |
| `mova_avista` | Preço à vista do M.O.V.A |
| `performance_range` | Faixa do aluguel por performance |
| `trafego_mensal` | Valor mensal de tráfego pago |
| `automacao_setup` | Setup da automação SDR |
| `automacao_mensal` | Mensalidade da automação |
| `prazo_tipo` | `'countdown'` ou `'static'` |
| `prazo_inicio` | Data/hora de início do countdown (ISO 8601) |
| `prazo_dias` | Dias adicionados ao `prazo_inicio` |
| `whatsapp_contatos` | Relação com tabela de contatos (número + mensagem) |

### Fallback local (`src/data/portfolioConfig.js`)

Usado quando o Supabase está indisponível. Para adicionar uma proposta no fallback:
1. Crie a pasta `src/data/meu-slug/` com os JSONs de pricing
2. Adicione a entrada em `portfolioConfig.js`

---

## Admin — Dashboard

**Papel do componente:** É o **layout pai** da área admin: sidebar fixa + área principal onde entra o conteúdo de cada rota via `<Outlet />`.

### Partes

1. **`admin-container`**  
   Wrapper geral da tela admin.

2. **Sidebar (`admin-sidebar`)**  
   - **Header:** ícone + título "Admin Panel".  
   - **Nav:** links para Dashboard (`/admin`), Gerador, Propostas, Estruturador, WhatsApp, Configurações.  
   - **Divisor** + link "Site Público" (`/`).  
   - **Footer:** botão "Sair" → `signOut()` do `AuthContext` + redirect para `/login`.

3. **Área principal (`admin-main`)**  
   - **Topbar:** texto "Controle tudo aqui" + "Admin Zero1Page".  
   - **`admin-content`:** conteúdo da rota filha renderizado via `<Outlet />` (Generator, Proposals, Structurer, etc.).

4. **Navegação mobile (`mobile-bottom-nav`)**  
   Barra inferior só em mobile: Início, Gerador, Propostas, WhatsApp e Sair.  
   *Não inclui* Estruturador, Configurações nem "Site Público".

**Auth:** Usa `useAuth()` para `signOut`; a proteção de rota fica no roteador ou em um wrapper.

**Resumo:** Layout com sidebar + topbar + `<Outlet />` para o conteúdo da rota atual, mais uma bottom nav em mobile com um subconjunto dos links.

---

## Regra de Ouro — Responsividade

**Toda alteração estrutural — seja no front-end ou nos dados — deve manter a responsividade mobile.**

Checklist obrigatório antes de qualquer mudança de layout:

- [ ] Funciona em telas a partir de 320px de largura?
- [ ] Breakpoint principal: `@media (max-width: 768px)` → colunas colapsam para 1
- [ ] Áreas de toque têm no mínimo 44px de altura
- [ ] Textos legíveis sem zoom (mínimo 14px)
- [ ] Nenhuma informação importante fica escondida apenas em `hover`
- [ ] Imagens não estouram o container em mobile

> As classes `conceptual-grid` e `project-grid` já têm responsividade implementada. Ao criar novas seções, reutilize essas classes ou espelhe seus breakpoints.

---

## Manutenção Técnica

### Rodar localmente
```bash
npm run dev
# Acesse: http://localhost:5173
```

### Imagens
Todos os portfólios compartilham `public/projects/`. Use nomes descritivos e únicos para evitar conflito.

---

*Dúvidas? Pergunte para a sua IA parceira!*

---

## Histórico de Atualizações

### 2026-03-09 | Restauração dos Cases + Documentação

- `global_authority.json` restaurado com todos os dados completos: **9 cases**, **8 demonstrativos**, **5 full stack**
- Seção "Projetos de Programação (Full Stack)" reinserida no `App.jsx` entre os demonstrativos e a proposta comercial
- Seção fullstack agora usa o mesmo grid 2 colunas dos demonstrativos (`conceptual-grid`)
- README atualizado com a arquitetura completa e regras de responsividade

### 2026-03-02 | Múltiplos Portfólios por Slug + Supabase

- Roteamento dinâmico com `react-router-dom`
- Proposta comercial migrada para Supabase (tabela `propostas` + `whatsapp_contatos`)
- Fallback local em `portfolioConfig.js` para quando o Supabase não responde
- `global_authority.json` criado como fonte única dos dados de cases (compartilhado entre todos os slugs)
- Telas internas de administração: Dashboard, Generator, Structurer, ProposalsList, WhatsAppManager, Settings
