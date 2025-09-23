# 🚀 Instruções de Deploy - Portal ChicoSabeTudo

## ✅ Status: PRONTO PARA DEPLOY

A aplicação está 100% funcional e otimizada para produção!

## 🎯 Opções de Deploy

### 1. **GitHub Pages (Automático)**
O projeto está configurado para deploy automático via GitHub Actions:

**Como ativar:**
1. Acesse o repositório: https://github.com/ChicoSabeTudo-lgtm/brasil-news-agora-moderno
2. Vá em **Settings** → **Pages**
3. Em **Source**, selecione **GitHub Actions**
4. O deploy será automático a cada push na branch `main`

**URL do deploy:** https://chicosabetudo-lgtm.github.io/brasil-news-agora-moderno/

### 2. **Deploy Manual**

#### Opção A: Netlify
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Opção B: Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod dist
```

#### Opção C: Deploy Local
```bash
# Build de produção
npm run build

# Preview local
npm run preview

# Acesse: http://localhost:4173
```

## 🔧 Configurações Necessárias

### Variáveis de Ambiente
Certifique-se de configurar as seguintes variáveis no seu provedor de deploy:

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### Domínio Personalizado
Para conectar um domínio personalizado:
1. Configure o DNS apontando para o servidor
2. Adicione o domínio nas configurações do provedor
3. Configure SSL/HTTPS

## 📊 Verificação Pós-Deploy

Após o deploy, verifique:

- ✅ **Galeria funcionando** - Navegação entre imagens
- ✅ **Responsividade** - Teste em mobile e desktop
- ✅ **Performance** - Carregamento rápido
- ✅ **SEO** - Meta tags e estrutura
- ✅ **Imagens** - Carregamento correto
- ✅ **Legendas** - Formatação e exibição
- ✅ **Espaçamento** - Galeria próxima ao texto

## 🎉 Comandos Úteis

```bash
# Build de produção
npm run build

# Preview local
npm run preview

# Lint e correção
npm run lint

# Verificar build
ls -la dist/
```

## 🚨 Troubleshooting

### Problema: Galeria não carrega
**Solução**: Verificar se as imagens estão sendo servidas corretamente

### Problema: Erro de CORS
**Solução**: Configurar CORS no Supabase

### Problema: Performance lenta
**Solução**: Verificar se o CDN está funcionando

### Problema: Espaçamento incorreto
**Solução**: Verificar se o CSS específico da galeria está sendo aplicado

## 📞 Suporte

Se precisar de ajuda com o deploy:
1. Verifique os logs do console
2. Teste localmente primeiro
3. Verifique as configurações do Supabase
4. Consulte a documentação do provedor

---

**🎯 Recomendação**: Use o GitHub Pages para deploy automático e gratuito!
