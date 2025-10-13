# 📚 API de Notícias - Documentação

## 🌐 URL Base
```
https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api
```

## 🔍 Endpoints Disponíveis

### 1. GET - Buscar Notícias

**Endpoint:** `GET /functions/v1/news-api`

**Descrição:** Busca notícias publicadas com filtros avançados e paginação.

#### Parâmetros Query String:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `category` | string | Não | Slug da categoria (ex: "politica", "economia") |
| `author_id` | uuid | Não | ID do autor |
| `tags` | string | Não | Tags separadas por vírgula (ex: "eleições,congresso") |
| `from_date` | ISO 8601 | Não | Data inicial (ex: "2024-01-01") |
| `to_date` | ISO 8601 | Não | Data final |
| `limit` | number | Não | Quantidade de resultados (padrão: 20, máx: 100) |
| `offset` | number | Não | Offset para paginação (padrão: 0) |
| `search` | string | Não | Busca por título ou conteúdo |

#### Exemplo de Requisição:

```bash
# Buscar todas as notícias
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api"

# Buscar notícias de política
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?category=politica"

# Buscar notícias com paginação
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?limit=10&offset=0"

# Buscar notícias por período
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?from_date=2024-01-01&to_date=2024-12-31"

# Buscar notícias por texto
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?search=economia"

# Combinar filtros
curl "https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?category=economia&limit=5&search=inflação"
```

#### Exemplo com JavaScript:

```javascript
// Buscar notícias de tecnologia
const response = await fetch('https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?category=tecnologia&limit=10');
const result = await response.json();

console.log('Total de notícias:', result.count);
console.log('Notícias:', result.data);
```

#### Resposta de Sucesso (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "titulo-da-noticia",
      "title": "Título da Notícia",
      "subtitle": "Subtítulo",
      "content": "Conteúdo completo...",
      "meta_description": "Descrição meta",
      "published_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z",
      "views": 150,
      "tags": ["política", "brasil"],
      "is_breaking": false,
      "is_featured": true,
      "categories": {
        "id": "uuid",
        "name": "Política",
        "slug": "politica",
        "color": "#e74c3c"
      },
      "profiles": {
        "user_id": "uuid",
        "full_name": "João Silva"
      },
      "news_images": [
        {
          "id": "uuid",
          "image_url": "https://...",
          "public_url": "https://...",
          "path": "path/to/image.jpg",
          "caption": "Legenda da imagem",
          "is_cover": true,
          "sort_order": 0
        }
      ]
    }
  ],
  "count": 50,
  "limit": 20,
  "offset": 0
}
```

---

### 2. POST - Criar Notícia

**Endpoint:** `POST /functions/v1/news-api`

**Descrição:** Cria uma nova notícia com campos básicos e imagens (opcional).

**⚠️ Importante:** A notícia é criada como **rascunho** (is_published=false) e precisa ser publicada manualmente no painel administrativo.

#### Body JSON:

```json
{
  "title": "Título da Notícia (obrigatório, min 10 caracteres)",
  "subtitle": "Subtítulo da notícia (opcional)",
  "content": "Conteúdo completo da notícia em HTML (obrigatório, min 100 caracteres)",
  "meta_description": "Descrição para SEO (opcional)",
  "category_id": "uuid-da-categoria (obrigatório)",
  "author_id": "uuid-do-autor (obrigatório)",
  "tags": ["tag1", "tag2", "tag3"],
  "is_breaking": false,
  "images": [
    {
      "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "caption": "Legenda da imagem (opcional)",
      "is_cover": true
    }
  ]
}
```

#### Campos Obrigatórios:
- ✅ `title` (mínimo 10 caracteres)
- ✅ `content` (mínimo 100 caracteres)
- ✅ `category_id` (deve existir no banco)
- ✅ `author_id` (deve existir no banco)

#### Campos Opcionais:
- `subtitle`
- `meta_description` (se não fornecido, usa subtitle ou title)
- `tags` (array de strings)
- `is_breaking` (padrão: false)
- `images` (array, máximo 10 imagens, 5MB cada)

#### Validações de Imagens:
- Formato: JPEG, PNG, GIF, WebP
- Tamanho máximo: 5MB por imagem
- Máximo: 10 imagens
- Base64 obrigatório
- Primeira imagem é capa por padrão (ou especificar is_cover: true)

#### Exemplo de Requisição:

```bash
curl -X POST \
  https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nova descoberta científica revoluciona medicina",
    "subtitle": "Pesquisadores brasileiros desenvolvem tratamento inovador",
    "content": "<p>O conteúdo completo da notícia vai aqui com no mínimo 100 caracteres para passar na validação. Pode incluir HTML para formatação.</p>",
    "meta_description": "Descoberta científica brasileira promete revolucionar tratamentos médicos",
    "category_id": "uuid-da-categoria-ciencia",
    "author_id": "uuid-do-autor",
    "tags": ["ciência", "medicina", "brasil"],
    "is_breaking": false,
    "images": [
      {
        "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
        "caption": "Laboratório onde a pesquisa foi desenvolvida",
        "is_cover": true
      }
    ]
  }'
```

#### Exemplo com JavaScript/fetch:

```javascript
async function criarNoticia() {
  const noticia = {
    title: "Nova descoberta científica revoluciona medicina",
    subtitle: "Pesquisadores brasileiros desenvolvem tratamento inovador",
    content: "<p>O conteúdo completo da notícia vai aqui...</p>",
    category_id: "uuid-da-categoria",
    author_id: "uuid-do-autor",
    tags: ["ciência", "medicina"],
    is_breaking: false,
    images: [
      {
        base64: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
        caption: "Laboratório de pesquisa",
        is_cover: true
      }
    ]
  };

  const response = await fetch('https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noticia)
  });

  const result = await response.json();
  console.log('Notícia criada:', result);
}
```

#### Resposta de Sucesso (201):

```json
{
  "data": {
    "id": "uuid-da-noticia",
    "slug": "nova-descoberta-cientifica-revoluciona-medicina",
    "title": "Nova descoberta científica revoluciona medicina",
    "subtitle": "Pesquisadores brasileiros desenvolvem tratamento inovador",
    "content": "<p>O conteúdo completo...</p>",
    "category_id": "uuid",
    "author_id": "uuid",
    "is_published": false,
    "created_at": "2024-01-01T12:00:00Z"
  },
  "message": "Notícia criada com sucesso como rascunho"
}
```

#### Resposta de Erro (400):

```json
{
  "error": "Dados inválidos",
  "errors": [
    {
      "field": "title",
      "message": "Título deve ter no mínimo 10 caracteres"
    },
    {
      "field": "content",
      "message": "Conteúdo deve ter no mínimo 100 caracteres"
    }
  ]
}
```

---

## 📋 Códigos de Resposta

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso (GET) |
| 201 | Notícia criada com sucesso (POST) |
| 400 | Dados inválidos |
| 404 | Categoria ou autor não encontrado |
| 405 | Método não suportado |
| 500 | Erro interno do servidor |

---

## 🔑 Como Obter IDs Necessários

### Obter Categories (IDs de Categorias):

```bash
# Listar todas as categorias disponíveis
curl "https://spgusjrjrhfychhdwixn.supabase.co/rest/v1/categories?select=id,name,slug" \
  -H "apikey: SUA_ANON_KEY"
```

### Obter Authors (IDs de Autores):

```bash
# Listar autores/redatores
curl "https://spgusjrjrhfychhdwixn.supabase.co/rest/v1/profiles?select=user_id,full_name" \
  -H "apikey: SUA_ANON_KEY"
```

---

## 🖼️ Como Converter Imagem para Base64

### Com JavaScript (Browser):

```javascript
function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Uso:
const input = document.querySelector('input[type="file"]');
const base64 = await imageToBase64(input.files[0]);
```

### Com Node.js:

```javascript
const fs = require('fs');

function imageToBase64(imagePath) {
  const image = fs.readFileSync(imagePath);
  return `data:image/jpeg;base64,${image.toString('base64')}`;
}

// Uso:
const base64 = imageToBase64('./imagem.jpg');
```

### Com Python:

```python
import base64

def image_to_base64(image_path):
    with open(image_path, 'rb') as image_file:
        encoded = base64.b64encode(image_file.read()).decode('utf-8')
        return f'data:image/jpeg;base64,{encoded}'

# Uso:
base64_image = image_to_base64('imagem.jpg')
```

---

## 🧪 Exemplos Práticos

### Exemplo 1: Buscar Últimas 5 Notícias

```javascript
const response = await fetch(
  'https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?limit=5'
);
const { data } = await response.json();
console.log('Últimas notícias:', data);
```

### Exemplo 2: Buscar Notícias de Política

```javascript
const response = await fetch(
  'https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?category=politica&limit=10'
);
const { data, count } = await response.json();
console.log(`${count} notícias de política encontradas`);
```

### Exemplo 3: Criar Notícia Simples (Sem Imagens)

```javascript
const noticia = {
  title: "Novo decreto é assinado pelo presidente",
  subtitle: "Medida afeta economia nacional",
  content: "<p>O presidente assinou hoje um novo decreto que impacta diretamente a economia do país. A medida foi bem recebida por economistas e deve trazer benefícios para a população nos próximos meses.</p>",
  meta_description: "Presidente assina decreto que afeta economia",
  category_id: "uuid-da-categoria-politica",
  author_id: "uuid-do-autor",
  tags: ["política", "economia", "decreto"],
  is_breaking: true
};

const response = await fetch('https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(noticia)
});

const result = await response.json();
console.log('Notícia criada:', result);
```

### Exemplo 4: Criar Notícia com Imagem

```javascript
// Converter imagem para base64
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const reader = new FileReader();

reader.onload = async function() {
  const base64Image = reader.result;
  
  const noticia = {
    title: "Inauguração de novo hospital na capital",
    content: "<p>Foi inaugurado hoje um novo hospital moderno na capital, com capacidade para 500 leitos e equipamentos de última geração.</p>",
    category_id: "uuid-categoria-saude",
    author_id: "uuid-autor",
    tags: ["saúde", "hospital", "infraestrutura"],
    images: [
      {
        base64: base64Image,
        caption: "Fachada do novo hospital",
        is_cover: true
      }
    ]
  };

  const response = await fetch('https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noticia)
  });

  const result = await response.json();
  console.log('Notícia criada:', result);
};

reader.readAsDataURL(file);
```

### Exemplo 5: Paginação

```javascript
async function buscarTodasNoticias() {
  const limit = 20;
  let offset = 0;
  let allNews = [];
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api?limit=${limit}&offset=${offset}`
    );
    const { data, count } = await response.json();
    
    allNews = [...allNews, ...data];
    offset += limit;
    hasMore = offset < count;
  }

  console.log(`Total de ${allNews.length} notícias carregadas`);
  return allNews;
}
```

---

## ⚠️ Observações Importantes

1. **Notícias criadas via API:**
   - São criadas como **rascunho** (is_published=false)
   - Precisam ser publicadas manualmente no painel administrativo
   - Slug é gerado automaticamente a partir do título

2. **Imagens:**
   - Formato base64 obrigatório
   - Máximo 5MB por imagem
   - Máximo 10 imagens por notícia
   - Formatos suportados: JPEG, PNG, GIF, WebP

3. **Performance:**
   - Cache de 1 hora em respostas GET
   - Paginação recomendada para grandes volumes
   - Limite máximo de 100 resultados por requisição

4. **Segurança:**
   - API pública (sem autenticação necessária)
   - Validação contra SQL injection
   - Rate limiting aplicado pelo Supabase

---

## 🐛 Troubleshooting

### Erro: "Categoria não encontrada"
**Solução:** Verifique se o category_id existe usando a API REST do Supabase ou o painel administrativo.

### Erro: "Autor não encontrado"
**Solução:** Verifique se o author_id existe na tabela profiles.

### Erro: "Imagem muito grande"
**Solução:** Reduza o tamanho da imagem antes de converter para base64. Use compressão ou redimensionamento.

### Erro: "Conteúdo deve ter no mínimo 100 caracteres"
**Solução:** Adicione mais texto ao campo content. Pode usar HTML para formatação.

---

## 📞 Suporte

Para mais informações ou problemas:
1. Verifique os logs no Supabase Dashboard → Edge Functions → Logs
2. Teste localmente usando Supabase CLI
3. Consulte a documentação do Supabase: https://supabase.com/docs

---

**Desenvolvido para Portal ChicoSabeTudo** 🚀

