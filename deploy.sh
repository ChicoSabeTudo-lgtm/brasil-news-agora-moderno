#!/bin/bash

# 🚀 Script de Deploy - Portal ChicoSabeTudo
# Este script automatiza o processo de deploy para produção

echo "🚀 Iniciando deploy do Portal ChicoSabeTudo..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Executar lint
echo "🔍 Executando verificação de código..."
npm run lint

# Build de produção
echo "🏗️ Gerando build de produção..."
npm run build

# Verificar se o build foi gerado
if [ ! -d "dist" ]; then
    echo "❌ Erro: Build não foi gerado. Verifique os erros acima."
    exit 1
fi

echo "✅ Build gerado com sucesso!"
echo "📁 Arquivos de produção em: ./dist/"

# Verificar tamanho do build
echo "📊 Tamanho do build:"
du -sh dist/

# Listar arquivos principais
echo "📋 Arquivos principais:"
ls -la dist/

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Faça upload dos arquivos da pasta 'dist/' para seu servidor"
echo "2. Configure as variáveis de ambiente no servidor"
echo "3. Teste a aplicação em produção"
echo ""
echo "🔗 URLs úteis:"
echo "- Repositório: https://github.com/ChicoSabeTudo-lgtm/brasil-news-agora-moderno"
echo "- GitHub Pages: https://chicosabetudo-lgtm.github.io/brasil-news-agora-moderno/"
echo ""
echo "📞 Suporte: Consulte DEPLOY_INSTRUCTIONS.md para mais detalhes"
