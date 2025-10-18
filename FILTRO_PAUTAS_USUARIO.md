# 📋 Sistema de Filtro de Pautas por Usuário

## 📋 Resumo Executivo

Implementado sistema de filtros inteligente para visualização de pautas com **"Minhas Pautas (Hoje)"** pré-selecionado, permitindo que cada usuário veja suas próprias pautas automaticamente ao acessar a página.

## 🎯 Funcionalidades Implementadas

### ✅ **4 Tipos de Filtro**

1. **🙋 Minhas Pautas (Hoje)** - *Filtro padrão/pré-selecionado*
   - Mostra apenas pautas do usuário logado
   - Apenas da data atual
   - Ideal para foco no trabalho do dia

2. **👥 Todas as Pautas (Hoje)**
   - Mostra pautas de todos os usuários
   - Apenas da data atual
   - Visão geral do time

3. **📅 Minhas Pautas (Todos os Dias)**
   - Mostra todas as pautas do usuário logado
   - De todas as datas
   - Histórico pessoal completo

4. **🌐 Todas as Pautas (Todos os Dias)**
   - Mostra todas as pautas de todos os usuários
   - De todas as datas
   - Visão completa do sistema

## 🔧 Implementação Técnica

### **Arquivos Modificados**

#### 1. `src/hooks/useDailyBriefs.tsx`

**Novas Funcionalidades:**
```typescript
// Tipos de filtro
export type BriefFilterType = 'my-today' | 'all-today' | 'my-all' | 'all-all';

// Hook com suporte a filtros
export const useDailyBriefs = (options?: UseDailyBriefsOptions) => {
  const [filterType, setFilterType] = useState<BriefFilterType>(
    options?.filterType || 'my-today' // Padrão: Minhas Pautas (Hoje)
  );
  
  // Função para buscar pautas com filtro
  const fetchBriefs = async (filter?: BriefFilterType) => {
    // Apply date filter
    if (currentFilter === 'my-today' || currentFilter === 'all-today') {
      query = query.eq('brief_date', localDate);
    }

    // Apply user filter
    if (currentFilter === 'my-today' || currentFilter === 'my-all') {
      if (user?.id) {
        query = query.eq('created_by', user.id);
      }
    }
  };

  // Função para trocar filtro
  const changeFilter = (newFilter: BriefFilterType) => {
    setFilterType(newFilter);
    fetchBriefs(newFilter);
  };
}
```

**Retorno do Hook:**
```typescript
return {
  briefs,           // Lista de pautas filtradas
  loading,          // Estado de carregamento
  error,            // Erro se houver
  filterType,       // Filtro atual
  refetch,          // Recarregar com filtro atual
  changeFilter,     // Trocar filtro
  createBrief,      // Criar nova pauta
  updateBrief,      // Atualizar pauta
  deleteBrief       // Deletar pauta
};
```

#### 2. `src/components/admin/DailyBriefsPanel.tsx`

**Novo Componente de Filtro:**
```tsx
{/* Filtro de Pautas */}
<Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
  <CardContent className="p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Filter className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">Visualizando:</span>
      </div>
      <Select value={filterType} onValueChange={(value) => changeFilter(value)}>
        <SelectTrigger className="w-[280px] bg-white">
          <SelectValue>
            <div className="flex items-center">
              {getFilterIcon(filterType)}
              {getFilterLabel(filterType)}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="my-today">
            <User /> <Calendar /> Minhas Pautas (Hoje)
          </SelectItem>
          <SelectItem value="all-today">
            <Users /> <Calendar /> Todas as Pautas (Hoje)
          </SelectItem>
          <SelectItem value="my-all">
            <User /> <CalendarDays /> Minhas Pautas (Todos os Dias)
          </SelectItem>
          <SelectItem value="all-all">
            <Users /> <CalendarDays /> Todas as Pautas (Todos os Dias)
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </CardContent>
</Card>
```

**Funções Auxiliares:**
```typescript
const getFilterLabel = (filter: BriefFilterType) => {
  switch (filter) {
    case 'my-today': return 'Minhas Pautas (Hoje)';
    case 'all-today': return 'Todas as Pautas (Hoje)';
    case 'my-all': return 'Minhas Pautas (Todos os Dias)';
    case 'all-all': return 'Todas as Pautas (Todos os Dias)';
  }
};

const getFilterIcon = (filter: BriefFilterType) => {
  if (filter.startsWith('my-')) {
    return <User className="h-4 w-4 mr-2" />;
  } else {
    return <Users className="h-4 w-4 mr-2" />;
  }
};
```

## 🚀 Como Funciona

### **1. Ao Acessar a Página**
```javascript
// Hook inicializa com 'my-today'
const { filterType } = useDailyBriefs(); // filterType = 'my-today'

// Busca automática das pautas do usuário de hoje
useEffect(() => {
  fetchBriefs(); // Busca com filtro 'my-today'
}, [filterType]);
```

### **2. Query Construída Dinamicamente**
```javascript
let query = supabase.from('daily_briefs').select('*');

// Se filtro incluir 'today': adiciona data de hoje
if (filter.includes('today')) {
  query = query.eq('brief_date', localDate);
}

// Se filtro incluir 'my': adiciona usuário atual
if (filter.startsWith('my-')) {
  query = query.eq('created_by', user.id);
}
```

### **3. Mudança de Filtro**
```javascript
// Usuário seleciona novo filtro
changeFilter('all-today');

// Hook atualiza estado e recarrega
setFilterType('all-today');
fetchBriefs('all-today'); // Nova busca com filtro diferente
```

## 🎨 UI/UX Design

### **Card de Filtro Destacado**
- 🎨 **Gradiente azul suave** para destacar o filtro
- 🔵 **Ícones coloridos** para fácil identificação
- 📱 **Responsivo** para mobile e desktop
- ✨ **Ícones contextuais**:
  - 👤 User = Minhas pautas
  - 👥 Users = Todas as pautas
  - 📅 Calendar = Hoje
  - 🗓️ CalendarDays = Todos os dias

### **Posicionamento**
```
[Cabeçalho: Pautas do Dia] [Botões: Refresh | Nova Pauta]
          ↓
[CARD DE FILTRO - DESTAQUE AZUL]
          ↓
[Estatísticas: Total | Rascunho | Em Andamento | Finalizada]
          ↓
[Pautas por Categoria]
          ↓
[Lista de Pautas]
```

## 📊 Logs e Monitoramento

### **Console Logs**
```javascript
// Ao buscar pautas
console.log('Buscando pautas com filtro:', 'my-today', 'Data:', '2025-01-18', 'Usuário:', 'uuid-123');

// Resultado
console.log('Pautas encontradas:', 5);
```

### **Exemplos de Queries**

**1. Minhas Pautas (Hoje):**
```sql
SELECT * FROM daily_briefs 
WHERE brief_date = '2025-01-18' 
  AND created_by = 'uuid-do-usuario'
ORDER BY created_at DESC;
```

**2. Todas as Pautas (Hoje):**
```sql
SELECT * FROM daily_briefs 
WHERE brief_date = '2025-01-18'
ORDER BY created_at DESC;
```

**3. Minhas Pautas (Todos os Dias):**
```sql
SELECT * FROM daily_briefs 
WHERE created_by = 'uuid-do-usuario'
ORDER BY created_at DESC;
```

**4. Todas as Pautas (Todos os Dias):**
```sql
SELECT * FROM daily_briefs 
ORDER BY created_at DESC;
```

## 🛡️ Benefícios

### **1. Produtividade**
- ✅ Foco imediato nas próprias pautas
- ✅ Reduz sobrecarga cognitiva
- ✅ Acesso rápido ao trabalho relevante

### **2. Flexibilidade**
- ✅ Trocar entre visualizações facilmente
- ✅ Ver trabalho do time quando necessário
- ✅ Acessar histórico completo

### **3. Experiência do Usuário**
- ✅ Filtro padrão inteligente
- ✅ Interface intuitiva com ícones
- ✅ Visual destacado e atraente

## 🔍 Casos de Uso

### **Cenário 1: Redator Começa o Dia**
```
1. Acessa "Pautas do Dia"
2. Vê automaticamente suas pautas de hoje
3. Não precisa configurar nada
4. Começa a trabalhar imediatamente
```

### **Cenário 2: Gestor Supervisiona Time**
```
1. Acessa "Pautas do Dia"
2. Troca filtro para "Todas as Pautas (Hoje)"
3. Vê visão geral do trabalho do time
4. Identifica gargalos e distribui tarefas
```

### **Cenário 3: Revisão de Histórico**
```
1. Redator quer ver seu histórico
2. Troca filtro para "Minhas Pautas (Todos os Dias)"
3. Acessa todas as pautas que já criou
4. Útil para relatórios e análise de produtividade
```

## ⚙️ Configurações

### **Filtro Padrão**
O filtro padrão é configurado no hook:
```typescript
const [filterType, setFilterType] = useState<BriefFilterType>(
  options?.filterType || 'my-today' // Padrão: Minhas Pautas (Hoje)
);
```

Para alterar o padrão, modifique `'my-today'` para outro valor.

### **Persistência de Filtro (Futuro)**
Pode-se adicionar persistência no localStorage:
```typescript
const [filterType, setFilterType] = useState<BriefFilterType>(
  localStorage.getItem('briefFilterType') as BriefFilterType || 'my-today'
);

useEffect(() => {
  localStorage.setItem('briefFilterType', filterType);
}, [filterType]);
```

## 📈 Métricas Sugeridas

### **Dados para Análise**
- Uso de cada filtro (qual é mais usado?)
- Tempo médio na página por filtro
- Quantidade de trocas de filtro por sessão
- Pautas criadas vs visualizadas por usuário

## 🎉 Status da Implementação

### ✅ **Concluído**
- [x] Hook com suporte a 4 tipos de filtro
- [x] Filtro "Minhas Pautas (Hoje)" pré-selecionado
- [x] UI moderna com ícones e gradiente
- [x] Query dinâmica por usuário e data
- [x] Integração perfeita com sistema existente
- [x] Logs detalhados para debugging

### 🔄 **Funcionamento**
- Sistema ativo e pronto para uso
- Filtro padrão funcional
- Performance otimizada
- Interface responsiva

## 🚀 Como Testar

### **1. Acessar a Página**
```
http://localhost:8081/admin
```

### **2. Navegar até "Pautas do Dia"**
- Menu lateral → "Notícias" → "Pautas do Dia"

### **3. Verificar Filtro Pré-selecionado**
- O card de filtro deve mostrar: **"Minhas Pautas (Hoje)"**
- Ícones: 👤 User + 📅 Calendar

### **4. Testar Outros Filtros**
- Clicar no select de filtro
- Escolher "Todas as Pautas (Hoje)"
- Verificar que a lista atualiza automaticamente

### **5. Criar Nova Pauta**
- Clicar em "Nova Pauta"
- Preencher formulário
- Salvar
- Verificar que aparece na lista (filtro "Minhas Pautas")

## 💡 Próximos Passos

### **Melhorias Futuras**
- [ ] Persistir filtro selecionado no localStorage
- [ ] Adicionar contador de pautas por filtro
- [ ] Filtro de data customizado (range de datas)
- [ ] Exportar pautas do filtro atual (PDF/Excel)
- [ ] Estatísticas por usuário/período
- [ ] Notificações de novas pautas atribuídas

---

**✨ Sistema de filtros implementado com sucesso!**

**🎯 Foco automático nas pautas do usuário de hoje**

**👥 Flexibilidade para ver pautas do time quando necessário**
