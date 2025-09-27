# 🚀 Guia de Deploy - Galeria em Produção

## ✅ Status: PRONTO PARA DEPLOY

A galeria está 100% funcional e otimizada. O build de produção foi gerado com sucesso!

## 📁 Arquivos de Produção

Os arquivos estão prontos na pasta `dist/`:
- ✅ `index.html` - Página principal
- ✅ `assets/` - JavaScript, CSS e imagens otimizados
- ✅ `favicon.ico` - Ícone do site
- ✅ `robots.txt` - SEO
- ✅ `ads.txt` - Configuração de anúncios

## 🎯 Opções de Deploy

### 1. **Lovable (Recomendado)**
O projeto está configurado para usar o Lovable:

**URL do Projeto**: https://lovable.dev/projects/10597850-3e96-4288-b657-261f4218049e

**Como fazer deploy:**
1. Acesse o [Lovable Project](https://lovable.dev/projects/10597850-3e96-4288-b657-261f4218049e)
2. Clique em **Share** → **Publish**
3. A galeria será automaticamente deployada

**Vantagens:**
- ✅ Deploy automático
- ✅ Domínio personalizado disponível
- ✅ Integração com Supabase
- ✅ SSL automático
- ✅ CDN global

### 2. **Deploy Manual (Alternativa)**

Se preferir fazer deploy manual:

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

#### Opção C: GitHub Pages
```bash
# Criar repositório no GitHub
# Fazer upload dos arquivos da pasta dist/
# Configurar GitHub Pages
```

### 3. **Deploy Local (Teste)**

Para testar localmente:
```bash
# Preview de produção
npm run preview:prod

# Acesse: http://localhost:4173
```

## 🔧 Configurações de Produção

### Variáveis de Ambiente
Certifique-se de que as seguintes variáveis estão configuradas:

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anonima
```

### Domínio Personalizado
Para conectar um domínio personalizado no Lovable:
1. Acesse **Project** → **Settings** → **Domains**
2. Clique em **Connect Domain**
3. Configure o DNS conforme instruções

## 📊 Verificação Pós-Deploy

Após o deploy, verifique:

- ✅ **Galeria funcionando** - Navegação entre imagens
- ✅ **Responsividade** - Teste em mobile e desktop
- ✅ **Performance** - Carregamento rápido
- ✅ **SEO** - Meta tags e estrutura
- ✅ **Imagens** - Carregamento correto
- ✅ **Legendas** - Formatação e exibição

## 🎉 Comandos Úteis

```bash
# Build de produção
npm run build:prod

# Preview local
npm run preview:prod

# Lint e correção
npm run lint:fix

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

## 📞 Suporte

Se precisar de ajuda com o deploy:
1. Verifique os logs do console
2. Teste localmente primeiro
3. Verifique as configurações do Supabase
4. Consulte a documentação do Lovable

---

**🎯 Recomendação**: Use o Lovable para deploy automático e fácil gerenciamento!

