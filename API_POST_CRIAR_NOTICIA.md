# 📝 API - POST: Criar Notícia

## 🎯 Endpoint:
```
POST https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api
```

---

## 🔑 Headers Obrigatórios:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE
Content-Type: application/json
```

---

## 📦 Body (JSON):

### 🔴 **Campos Obrigatórios:**

| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `title` | string | Min: 10 caracteres | Título da notícia |
| `content` | string | Min: 100 caracteres | Conteúdo HTML da notícia |
| `category_id` | string (UUID) | Deve existir na tabela `categories` | ID da categoria |
| `author_id` | string (UUID) | Deve existir na tabela `profiles` | ID do autor |

### 🟢 **Campos Opcionais:**

| Campo | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `subtitle` | string | `""` | Subtítulo/resumo |
| `meta_description` | string | Subtítulo ou título | Meta descrição para SEO |
| `tags` | string[] | `[]` | Array de tags |
| `is_breaking` | boolean | `false` | Notícia urgente |
| `publish_immediately` | boolean | `false` | **Se true, publica direto. Se false, salva como rascunho** |
| `images` | Image[] | `[]` | Array de imagens (ver estrutura abaixo) |

### 🖼️ **Estrutura de Imagem:**

```json
{
  "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "caption": "Legenda da imagem (opcional)",
  "is_cover": true
}
```

---

## 📄 Exemplo de Requisição:

### **Exemplo 1: Notícia Simples como Rascunho (padrão)**

```json
{
  "title": "Brasil anuncia novo pacote de infraestrutura",
  "subtitle": "Governo prevê investimentos de R$ 500 bilhões até 2026",
  "content": "<p>O governo federal anunciou nesta quinta-feira um novo pacote de investimentos em infraestrutura que prevê a aplicação de R$ 500 bilhões até 2026. O plano inclui obras em rodovias, ferrovias, portos e aeroportos em todas as regiões do país.</p><p>Segundo o ministro da Economia, os recursos serão divididos entre investimentos públicos diretos e parcerias com a iniciativa privada. A expectativa é que as obras gerem cerca de 2 milhões de empregos diretos e indiretos.</p><p>Entre os principais projetos estão a duplicação da BR-101 no trecho nordeste, a construção de três novas ferrovias no Centro-Oeste e a ampliação de 15 aeroportos regionais.</p>",
  "category_id": "74a31ab2-3612-4d99-86c3-a443f0d8e5ba",
  "author_id": "bfbf7dbe-3f41-4667-ae86-8978d0fed605",
  "tags": ["infraestrutura", "economia", "investimentos"],
  "is_breaking": false
}
```

### **Exemplo 1b: Notícia Publicada Diretamente** ⭐

```json
{
  "title": "Brasil anuncia novo pacote de infraestrutura",
  "subtitle": "Governo prevê investimentos de R$ 500 bilhões até 2026",
  "content": "<p>O governo federal anunciou nesta quinta-feira um novo pacote de investimentos em infraestrutura que prevê a aplicação de R$ 500 bilhões até 2026. O plano inclui obras em rodovias, ferrovias, portos e aeroportos em todas as regiões do país.</p><p>Segundo o ministro da Economia, os recursos serão divididos entre investimentos públicos diretos e parcerias com a iniciativa privada. A expectativa é que as obras gerem cerca de 2 milhões de empregos diretos e indiretos.</p><p>Entre os principais projetos estão a duplicação da BR-101 no trecho nordeste, a construção de três novas ferrovias no Centro-Oeste e a ampliação de 15 aeroportos regionais.</p>",
  "category_id": "74a31ab2-3612-4d99-86c3-a443f0d8e5ba",
  "author_id": "bfbf7dbe-3f41-4667-ae86-8978d0fed605",
  "tags": ["infraestrutura", "economia", "investimentos"],
  "is_breaking": false,
  "publish_immediately": true
}
```

### **Exemplo 2: Notícia com Imagens**

```json
{
  "title": "Incêndio atinge prédio histórico em Salvador",
  "subtitle": "Bombeiros controlam fogo após 5 horas de combate",
  "content": "<p>Um incêndio de grandes proporções atingiu um prédio histórico no centro de Salvador na madrugada desta sexta-feira. O Corpo de Bombeiros foi acionado por volta das 3h e precisou de cerca de 5 horas para controlar as chamas.</p><p>Segundo testemunhas, o fogo começou no segundo andar do edifício e se espalhou rapidamente. Não há registro de feridos. As causas do incêndio serão investigadas pela Polícia Civil.</p><p>O prédio, construído em 1920, é tombado pelo patrimônio histórico e abrigava lojas no térreo e escritórios nos andares superiores.</p>",
  "category_id": "a2d997c3-7f9b-4941-994c-b82b0ae35055",
  "author_id": "705fd72e-c3cd-4009-b8cd-ef7b2645bc12",
  "tags": ["salvador", "incêndio", "patrimônio histórico"],
  "is_breaking": true,
  "images": [
    {
      "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/...",
      "caption": "Bombeiros combatem incêndio no centro histórico",
      "is_cover": true
    },
    {
      "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/...",
      "caption": "Fachada do prédio após o incêndio",
      "is_cover": false
    }
  ]
}
```

---

## ✅ Resposta de Sucesso (201 Created):

### **Quando criada como Rascunho (padrão):**
```json
{
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "title": "Brasil anuncia novo pacote de infraestrutura",
    "subtitle": "Governo prevê investimentos de R$ 500 bilhões até 2026",
    "content": "<p>O governo federal anunciou...</p>",
    "category_id": "74a31ab2-3612-4d99-86c3-a443f0d8e5ba",
    "author_id": "bfbf7dbe-3f41-4667-ae86-8978d0fed605",
    "slug": "brasil-anuncia-novo-pacote-de-infraestrutura",
    "tags": ["infraestrutura", "economia", "investimentos"],
    "is_breaking": false,
    "is_featured": false,
    "is_published": false,
    "published_at": "2025-10-13T23:30:00.000Z",
    "views": 0,
    "created_at": "2025-10-13T23:30:00.000Z"
  },
  "message": "Notícia criada com sucesso como rascunho",
  "note": "A notícia foi criada como rascunho e precisa ser aprovada no painel admin para ser publicada"
}
```

### **Quando publicada diretamente (`publish_immediately: true`):** ⭐
```json
{
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "title": "Brasil anuncia novo pacote de infraestrutura",
    "subtitle": "Governo prevê investimentos de R$ 500 bilhões até 2026",
    "content": "<p>O governo federal anunciou...</p>",
    "category_id": "74a31ab2-3612-4d99-86c3-a443f0d8e5ba",
    "author_id": "bfbf7dbe-3f41-4667-ae86-8978d0fed605",
    "slug": "brasil-anuncia-novo-pacote-de-infraestrutura",
    "tags": ["infraestrutura", "economia", "investimentos"],
    "is_breaking": false,
    "is_featured": false,
    "is_published": true,
    "published_at": "2025-10-13T23:30:00.000Z",
    "views": 0,
    "created_at": "2025-10-13T23:30:00.000Z"
  },
  "message": "Notícia criada e publicada com sucesso",
  "note": "A notícia está publicada e visível no site"
}
```

---

## ❌ Possíveis Erros:

### **401 Unauthorized - Sem autorização**
```json
{
  "error": "Autorização necessária",
  "message": "Para criar notícias, inclua o header Authorization"
}
```

### **400 Bad Request - Dados inválidos**
```json
{
  "error": "Dados inválidos",
  "errors": [
    { "field": "title", "message": "Título deve ter no mínimo 10 caracteres" },
    { "field": "content", "message": "Conteúdo é obrigatório" }
  ]
}
```

### **404 Not Found - Categoria não encontrada**
```json
{
  "error": "Categoria não encontrada"
}
```

### **500 Internal Server Error**
```json
{
  "error": "Erro ao criar notícia",
  "message": "Detalhes do erro..."
}
```

---

## 🔧 Exemplo com cURL:

### **Notícia sem imagens:**
```bash
curl -X POST \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Brasil anuncia novo pacote de infraestrutura",
    "subtitle": "Governo prevê investimentos de R$ 500 bilhões até 2026",
    "content": "<p>O governo federal anunciou nesta quinta-feira um novo pacote de investimentos...</p>",
    "category_id": "74a31ab2-3612-4d99-86c3-a443f0d8e5ba",
    "author_id": "bfbf7dbe-3f41-4667-ae86-8978d0fed605",
    "tags": ["infraestrutura", "economia", "investimentos"],
    "is_breaking": false
  }' \
  "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api"
```

---

## 🛠️ Usar no n8n:

### **Configuração do Node HTTP Request:**

1. **Method:** POST
2. **URL:** `https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api`
3. **Authentication:** Header Auth
   - **Name:** `Authorization`
   - **Value:** `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. **Body Content Type:** JSON
5. **Body (JSON):**
```json
{
  "title": "{{ $json.title }}",
  "subtitle": "{{ $json.subtitle }}",
  "content": "{{ $json.content }}",
  "category_id": "{{ $json.category_id }}",
  "author_id": "{{ $json.author_id }}",
  "tags": {{ $json.tags }},
  "is_breaking": {{ $json.is_breaking }}
}
```

---

## 📋 IDs Úteis:

### **Categorias Disponíveis:**
```
Saúde:          1ed144cf-0517-4af5-b8d4-94656f62af86
Polícia:        a2d997c3-7f9b-4941-994c-b82b0ae35055
Política:       74a31ab2-3612-4d99-86c3-a443f0d8e5ba
Entretenimento: 61efbd98-0a28-47ed-af5a-dc6dbdc43d5e
```

### **Autores Disponíveis:**
```
Author 1: bfbf7dbe-3f41-4667-ae86-8978d0fed605
Author 2: 705fd72e-c3cd-4009-b8cd-ef7b2645bc12
```

---

## ⚠️ **Notas Importantes:**

1. **Publicação:** 
   - **Padrão (sem `publish_immediately`):** Notícia salva como **rascunho** (`is_published: false`)
   - **Com `publish_immediately: true`:** Notícia **publicada diretamente** (`is_published: true`) ⭐
2. **Aprovação:** Notícias em rascunho precisam ser aprovadas no painel admin
3. **Slug Automático:** O slug é gerado automaticamente a partir do título
4. **Imagens:** São processadas em base64 e armazenadas no Supabase Storage
5. **Primeira Imagem:** Se não especificar `is_cover`, a primeira imagem é automaticamente definida como capa

---

## 🎉 **Resumo:**

✅ **POST deployado** e funcionando
✅ **Validações** de campos obrigatórios
✅ **Upload de imagens** em base64
✅ **Criação automática** de slug
✅ **Notícia salva** como rascunho
✅ **Verificação** de categoria e autor

**A API está completa e pronta para criar notícias!** 🚀

