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
