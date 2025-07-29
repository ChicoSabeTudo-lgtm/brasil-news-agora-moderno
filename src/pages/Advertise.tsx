import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Eye, Target, DollarSign, Star, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";

const Advertise = () => {
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    website: "",
    advertising_type: "",
    budget_range: "",
    campaign_description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('advertising_requests')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Solicitação enviada com sucesso!",
        description: "Nossa equipe comercial entrará em contato em breve.",
      });

      // Limpar formulário
      setFormData({
        company_name: "",
        contact_name: "",
        email: "",
        phone: "",
        website: "",
        advertising_type: "",
        budget_range: "",
        campaign_description: ""
      });

    } catch (error) {
      console.error('Error sending advertising request:', error);
      toast({
        title: "Erro ao enviar solicitação",
        description: "Tente novamente ou entre em contato por telefone.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Anuncie no Portal ChicoSabeTudo
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Alcance milhares de leitores diariamente! Nosso portal oferece excelente visibilidade 
            para sua marca com formatos publicitários diversos e preços competitivos.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Eye className="w-4 h-4 mr-2" />
              +50K visualizações/mês
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              +15K leitores únicos
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              Crescimento de 30%/mês
            </Badge>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Nossos Números</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Eye className="w-8 h-8 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-foreground">50K+</div>
                <p className="text-muted-foreground">Visualizações mensais</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="w-8 h-8 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-foreground">15K+</div>
                <p className="text-muted-foreground">Leitores únicos</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Target className="w-8 h-8 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-foreground">85%</div>
                <p className="text-muted-foreground">Taxa de engajamento</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Star className="w-8 h-8 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-foreground">4.8/5</div>
                <p className="text-muted-foreground">Satisfação dos anunciantes</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Advertising Options */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Formatos Publicitários</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Banner Display
                </CardTitle>
                <CardDescription>Posições estratégicas no site</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Header (728x90)</li>
                  <li>• Sidebar (300x250)</li>
                  <li>• Footer (728x90)</li>
                  <li>• Between articles (728x90)</li>
                </ul>
                <div className="mt-4">
                  <Badge>A partir de R$ 500/mês</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Conteúdo Patrocinado
                </CardTitle>
                <CardDescription>Artigos promocionais integrados</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Artigos nativos</li>
                  <li>• Reviews de produtos</li>
                  <li>• Case studies</li>
                  <li>• Branded content</li>
                </ul>
                <div className="mt-4">
                  <Badge>A partir de R$ 800/artigo</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Pacotes Premium
                </CardTitle>
                <CardDescription>Soluções completas de marketing</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Banners + conteúdo</li>
                  <li>• Newsletter patrocinada</li>
                  <li>• Redes sociais</li>
                  <li>• Relatórios detalhados</li>
                </ul>
                <div className="mt-4">
                  <Badge>A partir de R$ 2.000/mês</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Solicite um Orçamento</CardTitle>
                <CardDescription>
                  Preencha o formulário e nossa equipe comercial entrará em contato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company_name" className="block text-sm font-medium mb-2">
                        Nome da Empresa *
                      </label>
                      <Input
                        id="company_name"
                        name="company_name"
                        type="text"
                        required
                        value={formData.company_name}
                        onChange={handleInputChange}
                        placeholder="Sua empresa"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact_name" className="block text-sm font-medium mb-2">
                        Nome do Contato *
                      </label>
                      <Input
                        id="contact_name"
                        name="contact_name"
                        type="text"
                        required
                        value={formData.contact_name}
                        onChange={handleInputChange}
                        placeholder="Seu nome"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Telefone *
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium mb-2">
                      Website (opcional)
                    </label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://suaempresa.com.br"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="advertising_type" className="block text-sm font-medium mb-2">
                        Tipo de Anúncio *
                      </label>
                      <Select 
                        value={formData.advertising_type} 
                        onValueChange={(value) => handleSelectChange('advertising_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="banner-display">Banner Display</SelectItem>
                          <SelectItem value="conteudo-patrocinado">Conteúdo Patrocinado</SelectItem>
                          <SelectItem value="pacote-premium">Pacote Premium</SelectItem>
                          <SelectItem value="newsletter">Newsletter Patrocinada</SelectItem>
                          <SelectItem value="personalizado">Solução Personalizada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="budget_range" className="block text-sm font-medium mb-2">
                        Orçamento Mensal *
                      </label>
                      <Select 
                        value={formData.budget_range} 
                        onValueChange={(value) => handleSelectChange('budget_range', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Faixa de orçamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="500-1000">R$ 500 - R$ 1.000</SelectItem>
                          <SelectItem value="1000-2500">R$ 1.000 - R$ 2.500</SelectItem>
                          <SelectItem value="2500-5000">R$ 2.500 - R$ 5.000</SelectItem>
                          <SelectItem value="5000-10000">R$ 5.000 - R$ 10.000</SelectItem>
                          <SelectItem value="10000+">Acima de R$ 10.000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="campaign_description" className="block text-sm font-medium mb-2">
                      Descrição da Campanha *
                    </label>
                    <Textarea
                      id="campaign_description"
                      name="campaign_description"
                      required
                      rows={4}
                      value={formData.campaign_description}
                      onChange={handleInputChange}
                      placeholder="Descreva seus objetivos, público-alvo e qualquer informação relevante sobre a campanha..."
                      className="resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full md:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Solicitar Orçamento
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Why Advertise */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Por que anunciar conosco?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Público Qualificado</h4>
                    <p className="text-sm text-muted-foreground">
                      Leitores engajados e interessados em notícias e informações.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Crescimento Constante</h4>
                    <p className="text-sm text-muted-foreground">
                      Nossa audiência cresce 30% ao mês com conteúdo de qualidade.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Relatórios Detalhados</h4>
                    <p className="text-sm text-muted-foreground">
                      Acompanhe o desempenho com métricas e analytics completos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Preços Competitivos</h4>
                    <p className="text-sm text-muted-foreground">
                      Melhor custo-benefício do mercado com resultados garantidos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Contato Direto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> comercial@chicosabetudo.com.br</p>
                  <p><strong>Telefone:</strong> (75) 99914-1984</p>
                  <p><strong>WhatsApp:</strong> +55 75 99914-1984</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Advertise;