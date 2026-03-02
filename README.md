# 🚀 Portfólio Inquebrável (Data-Driven)

Este portfólio foi criado para ser moderno, rápido e **extremamente fácil de atualizar**. Você não precisa mexer no código para adicionar novos projetos ou fotos, apenas no arquivo de dados.

---

## 📸 Como adicionar novos conteúdos (Passo a Passo)

### 1. Capture a Imagem (ShareX)
- Use o atalho `Ctrl + PrintScreen` (ou o que você configurou).
- Selecione a área ou a tela inteira.
- **Dica**: O ShareX está configurado para salvar o arquivo automaticamente na pasta `public/projects/` com nomes como `msedge_XYZ.png`.

### 2. Identifique o nome do arquivo
- Vá na pasta `public/projects/` do seu projeto e veja qual foi o nome gerado (ex: `msedge_ABC123.png`).

### 3. Atualize o `src/data/projects.json`
- Abra o arquivo `projects.json`.
- Para adicionar uma imagem a um projeto existente, adicione um novo bloco no array de `items`:

```json
{
  "url": "/projects/NOME_DO_ARQUIVO.png",
  "title": "Título Curto (ex: SEO)",
  "description": "Texto explicando o que esse print mostra."
}
```

### 4. Como funciona o Layout (Grade de 2 Colunas)
- O sistema coloca automaticamente as fotos **lado a lado**.
- **1ª foto**: Fica na esquerda.
- **2ª foto**: Fica na direita, fechando a linha.
- **3ª foto**: Começa uma nova linha na esquerda, e assim por diante.

---

## 🛠️ Manutenção Técnica

### Rodar o projeto localmente:
1. Abra o terminal na pasta do projeto.
2. Digite: `npm run dev`
3. Acesse: `http://localhost:5173`

### Como Criar um Novo Projeto:
Basta copiar um bloco inteiro de projeto no `projects.json` e mudar o `id` e o `title`. O site criará a nova seção automaticamente com uma linha divisória elegante.

---
*Dúvidas? Pergunte para a sua IA parceira!*

---

## 🗓️ Atualização — 2026-03-02 | Múltiplos Portfólios por Slug

### O que mudou

**Roteamento dinâmico** (`react-router-dom` instalado):
- `/` → portfólio padrão (comportamento original, inalterado)
- `/:slug` → portfólio personalizado (ex: `/20260302_01`)

**Nova estrutura de dados:**
```
src/data/
  portfolioConfig.js   ← arquivo central de configuração
  default/             ← dados do portfólio da home
  20260302_01/         ← dados do 1º portfólio com slug
```

**Para adicionar um novo portfólio** (`/:meu-slug`):
1. Crie a pasta `src/data/meu-slug/` com os 4 JSONs (`projects`, `conceptual`, `fullstack`, `pricing`)
2. Adicione as importações e uma nova entrada em `portfolioConfig.js`

### Configurações por portfólio (em `portfolioConfig.js`)

| Campo | Descrição |
|---|---|
| `expiresAt` | Data/hora de expiração do countdown (ISO 8601, ex: `'2026-03-10T18:00:00-03:00'`) |
| `whatsapp.number` | Número do WhatsApp com DDI (ex: `'5521989248813'`) |
| `whatsapp.message` | Mensagem pré-preenchida ao clicar no botão |

> Mudar `whatsapp` em um slug atualiza **todos** os botões daquele portfólio automaticamente.

### Imagens
Todos os portfólios compartilham a pasta `public/projects/`. Nomeie as imagens de forma distinta para evitar conflito.
