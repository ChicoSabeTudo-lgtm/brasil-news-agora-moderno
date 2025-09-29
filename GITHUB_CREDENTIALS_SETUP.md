# 🔐 Configuração de Credenciais do GitHub

Este guia explica como configurar as credenciais para que a IA possa atualizar o repositório GitHub automaticamente.

## 📋 Pré-requisitos

- Conta no GitHub
- Acesso ao repositório `ChicoSabeTudo-lgtm/brasil-news-agora-moderno`
- Terminal/Command Line

## 🚀 Passo a Passo

### 1. Criar Personal Access Token (PAT)

1. Acesse [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Clique em **"Generate new token (classic)"**
3. Preencha os campos:
   - **Note**: `brasil-news-agora-moderno`
   - **Expiration**: `90 days` (ou sua preferência)
4. Selecione os seguintes escopos:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `write:packages` (Upload packages to GitHub Package Registry)
5. Clique em **"Generate token"**
6. **⚠️ IMPORTANTE**: Copie o token imediatamente (você só verá ele uma vez)

### 2. Configurar Credenciais

Execute o script de configuração:

```bash
./setup-github-credentials.sh SEU_TOKEN_AQUI
```

Substitua `SEU_TOKEN_AQUI` pelo token que você copiou no passo anterior.

### 3. Verificar Configuração

Após executar o script, teste se está funcionando:

```bash
git push origin main
```

Se funcionar sem pedir credenciais, a configuração foi bem-sucedida!

## 🔧 Configuração Manual (Alternativa)

Se preferir configurar manualmente:

```bash
# Configurar usuário
git config user.name "Francisco Alves"
git config user.email "francisco@chicosabetudo.com"

# Configurar URL com token
git remote set-url origin https://SEU_TOKEN@github.com/ChicoSabeTudo-lgtm/brasil-news-agora-moderno.git

# Testar conexão
git ls-remote origin
```

## 🛡️ Segurança

- **Nunca** compartilhe seu token
- **Nunca** commite o token no código
- O token será salvo no keychain do macOS
- Você pode revogar o token a qualquer momento no GitHub

## 🔄 Renovação do Token

Quando o token expirar:

1. Crie um novo token no GitHub
2. Execute novamente: `./setup-github-credentials.sh NOVO_TOKEN`
3. Ou atualize manualmente a URL do repositório

## 🆘 Solução de Problemas

### Erro: "could not read Username"
- Verifique se o token está correto
- Confirme se o token tem as permissões necessárias

### Erro: "Authentication failed"
- O token pode ter expirado
- Crie um novo token e reconfigure

### Erro: "Permission denied"
- Verifique se você tem acesso ao repositório
- Confirme se o token tem escopo `repo`

## ✅ Verificação Final

Após a configuração, você deve conseguir:

- ✅ Fazer `git push` sem pedir credenciais
- ✅ Fazer `git pull` sem pedir credenciais
- ✅ A IA pode atualizar o repositório automaticamente

---

**🎉 Pronto!** Agora a IA pode atualizar o GitHub automaticamente quando necessário.
