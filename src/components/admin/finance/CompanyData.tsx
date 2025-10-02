import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCompanyData } from '@/hooks/useCompanyData';
import { Building2, FileText, MapPin, Phone, Mail, CreditCard, AtSign } from 'lucide-react';
import InlineSpinner from '@/components/InlineSpinner';

export const CompanyData = () => {
  const { companyData, isLoading, updateCompanyData, isUpdating } = useCompanyData();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(companyData);

  const handleEdit = () => {
    setFormData(companyData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(companyData);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (formData) {
      updateCompanyData(formData, {
        onSuccess: () => setIsEditing(false),
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <InlineSpinner />
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Nenhum dado da empresa encontrado
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dados da Empresa</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as informações da sua empresa
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={handleEdit} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <>
              <Button onClick={handleCancel} variant="outline" disabled={isUpdating}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? <InlineSpinner /> : 'Salvar'}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl font-semibold">
              {isEditing ? formData?.legal_name : companyData.legal_name}
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            {isEditing ? formData?.trade_name : companyData.trade_name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="legal_name">Razão Social</Label>
                    <Input
                      id="legal_name"
                      value={formData?.legal_name || ''}
                      onChange={(e) => handleChange('legal_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="trade_name">Nome Fantasia</Label>
                    <Input
                      id="trade_name"
                      value={formData?.trade_name || ''}
                      onChange={(e) => handleChange('trade_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={formData?.cnpj || ''}
                      onChange={(e) => handleChange('cnpj', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state_registration">Inscrição Estadual</Label>
                    <Input
                      id="state_registration"
                      value={formData?.state_registration || ''}
                      onChange={(e) => handleChange('state_registration', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="municipal_registration">Inscrição Municipal</Label>
                    <Input
                      id="municipal_registration"
                      value={formData?.municipal_registration || ''}
                      onChange={(e) => handleChange('municipal_registration', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="social_network">Rede Social</Label>
                    <Input
                      id="social_network"
                      value={formData?.social_network || ''}
                      onChange={(e) => handleChange('social_network', e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">CNPJ</p>
                      <p className="font-medium">{companyData.cnpj}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Inscrição Estadual</p>
                      <p className="font-medium">{companyData.state_registration}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Inscrição Municipal</p>
                      <p className="font-medium">{companyData.municipal_registration}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AtSign className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rede Social</p>
                      <p className="font-medium">{companyData.social_network}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Contato e Endereço */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato e Endereço</h3>
            <div className="grid grid-cols-1 gap-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData?.address || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData?.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData?.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Endereço</p>
                      <p className="font-medium">{companyData.address}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        <p className="font-medium">{companyData.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{companyData.email}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Dados Bancários */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dados Bancários</h3>
            <div className="grid grid-cols-1 gap-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bank_code">Banco</Label>
                      <Input
                        id="bank_code"
                        value={formData?.bank_code || ''}
                        onChange={(e) => handleChange('bank_code', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bank_agency">Agência</Label>
                      <Input
                        id="bank_agency"
                        value={formData?.bank_agency || ''}
                        onChange={(e) => handleChange('bank_agency', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bank_account">Conta Corrente</Label>
                      <Input
                        id="bank_account"
                        value={formData?.bank_account || ''}
                        onChange={(e) => handleChange('bank_account', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pix_key">Chave PIX</Label>
                    <Input
                      id="pix_key"
                      value={formData?.pix_key || ''}
                      onChange={(e) => handleChange('pix_key', e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Banco</p>
                      <p className="font-medium">
                        {companyData.bank_code} • Ag: {companyData.bank_agency} • CC:{' '}
                        {companyData.bank_account}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Chave PIX</p>
                      <p className="font-medium">{companyData.pix_key}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
