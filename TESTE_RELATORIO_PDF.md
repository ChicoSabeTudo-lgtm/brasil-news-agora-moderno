# 🧪 Teste do Relatório PDF - Diagnóstico

## ⚠️ Problema Atual
O PDF está sendo gerado mas aparece **em branco**.

## 📋 Como Testar e Coletar Informações

### Passo 1: Abrir o Console do Navegador
1. Pressione **F12** (ou clique com botão direito → Inspecionar)
2. Clique na aba **Console**
3. Limpe o console (ícone 🚫 ou Ctrl+L)

### Passo 2: Gerar o Relatório
1. Acesse: **Finanças** → **Propagandas**
2. Clique em **"Mês Atual"** (para garantir que há dados)
3. Clique em **"Gerar Relatório PDF"**
4. Aguarde o download

### Passo 3: Verificar os Logs

No console, procure por estas mensagens (na ordem):

```
=== Iniciando geracao de relatorio ===
Propagandas filtradas: [NÚMERO]
Range de datas: {...}
Cliente selecionado: [NOME]
Periodo: {...}
Iniciando geracao de PDF com dados: {...}
jsPDF inicializado com sucesso
Adicionando cabeçalho do relatório...
Posição Y inicial: 60
Adicionando rodapé...
PDF gerado com sucesso! Total de páginas: 1
```

### Passo 4: Identificar o Problema

#### ✅ Se você ver "Texto vazio após normalização"
Significa que a normalização está removendo o texto. Copie TODAS as mensagens com "Texto vazio".

#### ✅ Se você ver "Coordenada inválida"
Significa que há problema com posicionamento. Copie as mensagens.

#### ✅ Se NÃO aparecer "Adicionando cabeçalho"
Significa que o código não está sendo executado. Verifique se há erros no console.

#### ✅ Se aparecer "PDF gerado com sucesso" mas está em branco
Copie TODOS os logs entre "jsPDF inicializado" e "PDF gerado com sucesso".

## 📸 O que Enviar

**Copie e cole no chat:**

1. A quantidade de propagandas filtradas
2. TODOS os logs do console (desde "===" até o final)
3. Qualquer mensagem de ERRO (em vermelho)
4. Qualquer mensagem de AVISO (em amarelo)

## 🔍 Teste Rápido Alternativo

Se quiser fazer um teste simples, abra o console e cole este código:

```javascript
// Teste rápido do jsPDF
import('jspdf').then(({ default: jsPDF }) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('TESTE', 20, 20);
  doc.text('Olá Mundo', 20, 30);
  doc.save('teste.pdf');
  console.log('Teste concluído');
});
```

Se este teste funcionar (gerar um PDF com "TESTE" e "Olá Mundo"), significa que o jsPDF está OK e o problema é no nosso código de geração.

---

**Aguardando seus logs para diagnosticar o problema!** 🔍

