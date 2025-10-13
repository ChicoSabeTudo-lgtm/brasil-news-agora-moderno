# 📝 Como Postar/Criar Notícia via API

## 🎯 Para criar notícias via API, você precisa usar o método POST

A API que criamos é **somente leitura** (GET), mas vou te mostrar como criar uma versão que aceite POST para criar notícias.

---

## 🔧 VERSÃO COMPLETA DA API (GET + POST)

Vou criar uma versão que aceite tanto buscar quanto criar notícias:

### 📋 Campos Obrigatórios para Criar Notícia:

- `title` - Título da notícia (mínimo 10 caracteres)
- `content` - Conteúdo da notícia (mínimo 100 caracteres)
- `category_id` - ID da categoria (UUID)
- `author_id` - ID do autor (UUID)

### 📋 Campos Opcionais:

- `subtitle` - Subtítulo
- `meta_description` - Descrição para SEO
- `tags` - Array de tags
- `is_breaking` - Notícia urgente (true/false)
- `images` - Array de imagens em base64

---

## 🚀 EXEMPLOS DE USO

### Exemplo 1: Notícia Simples (Sem Imagens)

```bash
curl -X POST https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE" \
  -d '{
    "title": "Nova Notícia de Política",
    "content": "Esta é uma notícia de teste criada via API. O conteúdo deve ter no mínimo 100 caracteres para passar na validação. Esta notícia foi criada automaticamente para demonstrar como funciona a API de criação de notícias.",
    "category_id": "uuid-da-categoria",
    "author_id": "uuid-do-autor",
    "subtitle": "Subtítulo da notícia",
    "tags": ["política", "api", "teste"],
    "is_breaking": false
  }'
```

### Exemplo 2: Notícia com Imagem

```bash
curl -X POST https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE" \
  -d '{
    "title": "Notícia com Imagem",
    "content": "Esta notícia inclui uma imagem de exemplo. O conteúdo deve ter no mínimo 100 caracteres para passar na validação da API. A imagem será processada e salva no Supabase Storage automaticamente.",
    "category_id": "uuid-da-categoria",
    "author_id": "uuid-do-autor",
    "subtitle": "Subtítulo com imagem",
    "tags": ["imagem", "teste"],
    "is_breaking": true,
    "images": [
      {
        "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
        "caption": "Legenda da imagem",
        "is_cover": true
      }
    ]
  }'
```

### Exemplo 3: JavaScript/Fetch

```javascript
// Dados da notícia
const noticiaData = {
  title: "Notícia via JavaScript",
  content: "Esta notícia foi criada usando JavaScript e a API. O conteúdo deve ter no mínimo 100 caracteres para passar na validação. Esta é uma demonstração de como integrar a API em aplicações web.",
  category_id: "uuid-da-categoria",
  author_id: "uuid-do-autor",
  subtitle: "Subtítulo via JS",
  tags: ["javascript", "api"],
  is_breaking: false,
  images: [
    {
      base64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
      caption: "Imagem via JS",
      is_cover: true
    }
  ]
};

// Fazer a requisição
fetch('https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE'
  },
  body: JSON.stringify(noticiaData)
})
.then(response => response.json())
.then(data => {
  console.log('Notícia criada:', data);
})
.catch(error => {
  console.error('Erro:', error);
});
```

### Exemplo 4: Python

```python
import requests
import json

# Dados da notícia
noticia_data = {
    "title": "Notícia via Python",
    "content": "Esta notícia foi criada usando Python e a API. O conteúdo deve ter no mínimo 100 caracteres para passar na validação. Esta é uma demonstração de como integrar a API em aplicações Python.",
    "category_id": "uuid-da-categoria",
    "author_id": "uuid-do-autor",
    "subtitle": "Subtítulo via Python",
    "tags": ["python", "api"],
    "is_breaking": False
}

# Headers
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE"
}

# Fazer a requisição
response = requests.post(
    'https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api',
    headers=headers,
    json=noticia_data
)

# Verificar resposta
if response.status_code == 201:
    print("Notícia criada com sucesso!")
    print(response.json())
else:
    print("Erro:", response.json())
```

---

## ✅ RESPOSTA DA API

### Sucesso (201 Created):

```json
{
  "data": {
    "id": "uuid-da-nova-noticia",
    "title": "Nova Notícia de Política",
    "subtitle": "Subtítulo da notícia",
    "content": "Esta é uma notícia de teste criada via API...",
    "slug": "nova-noticia-de-politica",
    "category_id": "uuid-da-categoria",
    "author_id": "uuid-do-autor",
    "tags": ["política", "api", "teste"],
    "is_breaking": false,
    "is_featured": false,
    "is_published": false,
    "published_at": "2024-01-01T10:00:00Z",
    "views": 0
  },
  "message": "Notícia criada com sucesso como rascunho"
}
```

### Erro (400 Bad Request):

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

## 📋 COMO CONVERTER IMAGEM PARA BASE64

### JavaScript:

```javascript
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Usar
const fileInput = document.getElementById('imageInput');
const file = fileInput.files[0];
const base64 = await fileToBase64(file);
```

### Python:

```python
import base64

def file_to_base64(file_path):
    with open(file_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        return f"data:image/jpeg;base64,{encoded_string}"

# Usar
base64_image = file_to_base64("caminho/para/imagem.jpg")
```

---

## 🎯 IMPORTANTE

- ✅ **Notícias criadas via API ficam como RASCUNHO** (`is_published: false`)
- ✅ **Precisa aprovar no painel admin** para publicar
- ✅ **Máximo 10 imagens** por notícia
- ✅ **Cada imagem máximo 5MB**
- ✅ **Precisa de autorização** (Bearer token)

---

**📝 Com estes exemplos, você pode criar notícias via API de qualquer linguagem!**
