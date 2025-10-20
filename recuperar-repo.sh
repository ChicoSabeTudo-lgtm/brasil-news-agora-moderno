#!/bin/bash

# Script de Recuperação do Repositório GitHub
# Para brasil-news-agora-moderno

echo "🔄 Script de Recuperação do Repositório GitHub"
echo "=============================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Solicitar o novo token
echo "📝 Passo 1: Criar um novo token"
echo "   Acesse: https://github.com/settings/tokens"
echo "   Permissões necessárias: 'repo'"
echo ""
read -p "Cole seu NOVO token do GitHub aqui: " NEW_TOKEN

if [ -z "$NEW_TOKEN" ]; then
    echo "❌ Erro: Token não pode estar vazio"
    exit 1
fi

echo ""
echo "📝 Passo 2: Confirmar informações do repositório"
echo "   Conta: ChicoSabeTudo-lgtm"
echo "   Repositório: brasil-news-agora-moderno"
echo ""
read -p "As informações acima estão corretas? (s/n): " CONFIRM

if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
    echo "❌ Operação cancelada"
    exit 1
fi

echo ""
echo "🔧 Configurando remote..."

# Remover remote antigo
git remote remove origin 2>/dev/null || true

# Adicionar novo remote
git remote add origin "https://${NEW_TOKEN}@github.com/ChicoSabeTudo-lgtm/brasil-news-agora-moderno.git"

if [ $? -eq 0 ]; then
    echo "✅ Remote configurado com sucesso!"
else
    echo "❌ Erro ao configurar remote"
    exit 1
fi

echo ""
echo "📤 Enviando código para o GitHub..."
echo ""

# Push para o GitHub
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Repositório recuperado com sucesso!"
    echo ""
    echo "🎯 Próximos passos:"
    echo "   1. Acesse: https://github.com/ChicoSabeTudo-lgtm/brasil-news-agora-moderno"
    echo "   2. Verifique se todos os arquivos foram enviados"
    echo "   3. Reconecte o repositório na Vercel (se necessário)"
    echo ""
    echo "📋 Para enviar tags (opcional):"
    echo "   git push --tags"
else
    echo ""
    echo "❌ Erro ao enviar código"
    echo ""
    echo "Possíveis causas:"
    echo "   - Repositório ainda não foi criado no GitHub"
    echo "   - Token sem permissões corretas"
    echo "   - Problemas de conexão"
    echo ""
    echo "Verifique e tente novamente!"
    exit 1
fi







