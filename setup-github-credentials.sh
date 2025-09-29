#!/bin/bash

# Script para configurar credenciais do GitHub
# Execute este script após criar seu Personal Access Token

echo "🔧 Configurando credenciais do GitHub..."

# Verificar se o token foi fornecido
if [ -z "$1" ]; then
    echo "❌ Erro: Token de acesso pessoal não fornecido"
    echo "Uso: ./setup-github-credentials.sh SEU_TOKEN_AQUI"
    echo ""
    echo "Para criar um token:"
    echo "1. Vá para https://github.com/settings/tokens"
    echo "2. Clique em 'Generate new token (classic)'"
    echo "3. Selecione os escopos: repo, workflow, write:packages"
    echo "4. Copie o token gerado"
    exit 1
fi

TOKEN=$1

# Configurar o repositório para usar o token
echo "📝 Configurando URL do repositório com token..."
git remote set-url origin https://${TOKEN}@github.com/ChicoSabeTudo-lgtm/brasil-news-agora-moderno.git

# Testar a conexão
echo "🧪 Testando conexão com GitHub..."
if git ls-remote origin > /dev/null 2>&1; then
    echo "✅ Conexão com GitHub configurada com sucesso!"
    echo "🚀 Agora você pode fazer push/pull normalmente"
else
    echo "❌ Erro na conexão. Verifique se o token está correto e tem as permissões necessárias"
    exit 1
fi

echo ""
echo "🎉 Configuração concluída!"
echo "💡 Dica: O token será salvo no keychain do macOS para uso futuro"
