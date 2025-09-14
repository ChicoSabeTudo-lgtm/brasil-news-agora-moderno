import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const DebugPermissions = () => {
  const { user, userRole, isOtpVerified } = useAuth();
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const testStoragePermissions = async () => {
    setTesting(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      user: user ? { id: user.id, email: user.email } : null,
      userRole,
      isOtpVerified,
      tests: {}
    };

    try {
      // Test 1: Check if user has role
      if (user) {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
        
        results.tests.roleCheck = {
          success: !roleError,
          data: roleData,
          error: roleError?.message
        };

        // Test 2: Check profile approval status
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_approved, access_revoked')
          .eq('user_id', user.id)
          .maybeSingle();
        
        results.tests.profileCheck = {
          success: !profileError,
          data: profileData,
          error: profileError?.message
        };

        // Test 3: Test has_role function
        const { data: hasRoleData, error: hasRoleError } = await supabase
          .rpc('has_role', { _user_id: user.id, _role: 'redator' });
        
        results.tests.hasRoleFunction = {
          success: !hasRoleError,
          data: hasRoleData,
          error: hasRoleError?.message
        };

        // Test 4: Try to upload a small test file
        const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const testPath = `test-${Date.now()}.txt`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('news-images')
          .upload(testPath, testFile);
        
        results.tests.storageUpload = {
          success: !uploadError,
          data: uploadData,
          error: uploadError?.message
        };

        // Clean up test file if uploaded successfully
        if (!uploadError && uploadData) {
          await supabase.storage
            .from('news-images')
            .remove([testPath]);
        }
      }

      setTestResults(results);
      
      toast({
        title: "Teste concluído",
        description: "Verifique os resultados abaixo",
      });

    } catch (error: any) {
      results.tests.generalError = {
        success: false,
        error: error.message
      };
      setTestResults(results);
      
      toast({
        title: "Erro no teste",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Debug de Permissões - Upload de Imagens</CardTitle>
        <CardDescription>
          Ferramenta para diagnosticar problemas de permissão no upload de imagens
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status atual */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Usuário</div>
            <Badge variant={user ? "default" : "destructive"}>
              {user ? "Autenticado" : "Não autenticado"}
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Role</div>
            <Badge variant={userRole ? "default" : "secondary"}>
              {userRole || "Carregando..."}
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">OTP</div>
            <Badge variant={isOtpVerified ? "default" : "destructive"}>
              {isOtpVerified ? "Verificado" : "Não verificado"}
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Upload</div>
            <Badge variant={user && userRole ? "default" : "destructive"}>
              {user && userRole ? "Permitido" : "Bloqueado"}
            </Badge>
          </div>
        </div>

        {/* Botão de teste */}
        <Button 
          onClick={testStoragePermissions} 
          disabled={testing || !user}
          className="w-full"
        >
          {testing ? "Testando..." : "Executar Teste de Permissões"}
        </Button>

        {/* Resultados do teste */}
        {testResults && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resultados do Teste</h3>
            
            <div className="grid gap-4">
              {Object.entries(testResults.tests).map(([testName, result]: [string, any]) => (
                <div key={testName} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{testName}</span>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "✅ Sucesso" : "❌ Falha"}
                    </Badge>
                  </div>
                  
                  {result.data && (
                    <div className="text-sm">
                      <strong>Dados:</strong>
                      <pre className="bg-muted p-2 rounded mt-1 text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="text-sm text-destructive">
                      <strong>Erro:</strong> {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Resumo geral */}
            <div className="bg-muted p-4 rounded">
              <h4 className="font-medium mb-2">Resumo</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
