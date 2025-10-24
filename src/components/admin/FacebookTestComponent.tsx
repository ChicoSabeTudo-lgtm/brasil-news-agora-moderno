import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const FacebookTestComponent = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const runTests = async () => {
      setIsLoading(true);
      setTestResults([]);
      
      try {
        addResult('🔍 Iniciando testes da tabela Facebook...');
        
        // Teste 1: Verificar se a tabela existe
        addResult('📋 Teste 1: Verificando se a tabela existe...');
        const { data: tableCheck, error: tableError } = await supabase
          .from('information_schema.tables' as any)
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', 'facebook_daily_schedule');
        
        if (tableError) {
          addResult(`❌ Erro ao verificar tabela: ${tableError.message}`);
        } else {
          addResult(`✅ Tabela encontrada: ${tableCheck?.length > 0 ? 'SIM' : 'NÃO'}`);
        }

        // Teste 2: Tentar fazer SELECT na tabela
        addResult('📋 Teste 2: Tentando SELECT na tabela...');
        const { data: selectData, error: selectError } = await supabase
          .from('facebook_daily_schedule' as any)
          .select('*')
          .limit(1);
        
        if (selectError) {
          addResult(`❌ Erro no SELECT: ${selectError.message}`);
          addResult(`📝 Código do erro: ${selectError.code}`);
          addResult(`📝 Detalhes: ${JSON.stringify(selectError)}`);
        } else {
          addResult(`✅ SELECT funcionou! Registros encontrados: ${selectData?.length || 0}`);
        }

        // Teste 3: Tentar INSERT de teste
        addResult('📋 Teste 3: Tentando INSERT de teste...');
        const testData = {
          news_title: `Teste ${Date.now()}`,
          news_url: 'https://teste.com',
          scheduled_date: new Date().toISOString().split('T')[0],
          scheduled_time: '14:30:00'
        };

        const { data: insertData, error: insertError } = await supabase
          .from('facebook_daily_schedule' as any)
          .insert([testData])
          .select();

        if (insertError) {
          addResult(`❌ Erro no INSERT: ${insertError.message}`);
          addResult(`📝 Código do erro: ${insertError.code}`);
        } else {
          addResult(`✅ INSERT funcionou! ID: ${insertData?.[0]?.id}`);
          
          // Limpar dados de teste
          if (insertData?.[0]?.id) {
            await supabase
              .from('facebook_daily_schedule' as any)
              .delete()
              .eq('id', insertData[0].id);
            addResult('🧹 Dados de teste removidos');
          }
        }

        // Teste 4: Verificar permissões do usuário
        addResult('📋 Teste 4: Verificando permissões...');
        const { data: { user } } = await supabase.auth.getUser();
        addResult(`👤 Usuário logado: ${user?.id}`);
        addResult(`📧 Email: ${user?.email}`);

        // Teste 5: Verificar roles
        addResult('📋 Teste 5: Verificando roles...');
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user?.id);
        
        if (rolesError) {
          addResult(`❌ Erro ao verificar roles: ${rolesError.message}`);
        } else {
          addResult(`✅ Roles encontrados: ${roles?.map(r => r.role).join(', ') || 'Nenhum'}`);
        }

      } catch (error) {
        addResult(`💥 Erro geral: ${error}`);
      } finally {
        setIsLoading(false);
        addResult('🏁 Testes finalizados');
      }
    };

    runTests();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔧 Teste da Tabela Facebook Daily Schedule</h2>
      
      {isLoading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Executando testes...
          </div>
        </div>
      )}

      <div className="bg-gray-50 border rounded-lg p-4">
        <h3 className="font-semibold mb-2">📊 Resultados dos Testes:</h3>
        <div className="space-y-1 font-mono text-sm">
          {testResults.map((result, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {result}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-semibold text-yellow-800">📝 Instruções:</h4>
        <ol className="list-decimal list-inside text-sm text-yellow-700 mt-2 space-y-1">
          <li>Execute o script <code>TESTAR_TABELA_FACEBOOK.sql</code> no Supabase SQL Editor</li>
          <li>Verifique se a tabela <code>facebook_daily_schedule</code> existe</li>
          <li>Se não existir, execute a migration manualmente</li>
          <li>Verifique as permissões RLS da tabela</li>
        </ol>
      </div>
    </div>
  );
};
