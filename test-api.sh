#!/bin/bash

# Script de Teste para API de Notícias
# Execute: chmod +x test-api.sh && ./test-api.sh

API_URL="https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/news-api"

echo "🧪 Testando API de Notícias..."
echo ""

# Teste 1: GET - Buscar todas as notícias
echo "📋 Teste 1: Buscar todas as notícias (limit=5)"
curl -s "${API_URL}?limit=5" | jq '.'
echo ""
echo "---"
echo ""

# Teste 2: GET - Buscar por categoria
echo "📋 Teste 2: Buscar notícias de política"
curl -s "${API_URL}?category=politica&limit=3" | jq '.'
echo ""
echo "---"
echo ""

# Teste 3: GET - Buscar com paginação
echo "📋 Teste 3: Buscar com paginação (offset=10, limit=5)"
curl -s "${API_URL}?offset=10&limit=5" | jq '.count, .offset, .limit'
echo ""
echo "---"
echo ""

# Teste 4: GET - Buscar por texto
echo "📋 Teste 4: Buscar por texto 'brasil'"
curl -s "${API_URL}?search=brasil&limit=3" | jq '.count'
echo ""
echo "---"
echo ""

# Teste 5: POST - Criar notícia (sem imagens)
echo "📋 Teste 5: Criar notícia de teste (sem imagens)"
echo "⚠️  ATENÇÃO: Substitua os UUIDs pelos IDs reais antes de executar!"
echo ""

# Descomente para testar (substitua os UUIDs):
# curl -s -X POST "${API_URL}" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "title": "Notícia de Teste via API",
#     "subtitle": "Teste de criação via API REST",
#     "content": "<p>Este é um teste de criação de notícia via API. O conteúdo precisa ter no mínimo 100 caracteres para passar na validação, então estou adicionando mais texto aqui.</p>",
#     "meta_description": "Teste de API",
#     "category_id": "SUBSTITUA-PELO-UUID-DA-CATEGORIA",
#     "author_id": "SUBSTITUA-PELO-UUID-DO-AUTOR",
#     "tags": ["teste", "api"],
#     "is_breaking": false
#   }' | jq '.'

echo ""
echo "✅ Testes concluídos!"
echo ""
echo "💡 Dicas:"
echo "- Use 'jq' para formatar JSON: apt-get install jq ou brew install jq"
echo "- Verifique os logs no Supabase Dashboard → Edge Functions"
echo "- Notícias criadas via API ficam como rascunho (is_published=false)"

