import { Layout } from "@/components/Layout";
import { InstitutionalImageGallery } from "@/components/InstitutionalImageGallery";
import { AdaptiveImageGallery } from "@/components/AdaptiveImageGallery";
import { ModernImageGallery } from "@/components/ModernImageGallery";
import { SimpleGallery } from "@/components/SimpleGallery";

// Dados de exemplo para demonstração
const sampleImages = [
  {
    image_url: "https://via.placeholder.com/800x600/0E2A47/ffffff?text=Imagem+Horizontal+1",
    public_url: "https://via.placeholder.com/800x600/0E2A47/ffffff?text=Imagem+Horizontal+1",
    caption: "Legenda da imagem — **ativos** no marinho. Vermelho só no selo. Esta é uma imagem horizontal que demonstra o layout padrão da galeria.",
    is_cover: true,
    sort_order: 1
  },
  {
    image_url: "https://via.placeholder.com/600x800/0B2239/ffffff?text=Imagem+Vertical+2",
    public_url: "https://via.placeholder.com/600x800/0B2239/ffffff?text=Imagem+Vertical+2",
    caption: "Segunda imagem **vertical** da galeria com **institucional** destacado. Mostra como a galeria se adapta a diferentes formatos.",
    is_cover: false,
    sort_order: 2
  },
  {
    image_url: "https://via.placeholder.com/800x600/C6001C/ffffff?text=Imagem+Horizontal+3",
    public_url: "https://via.placeholder.com/800x600/C6001C/ffffff?text=Imagem+Horizontal+3",
    caption: "Terceira imagem mostrando o design **marinho** institucional. Elementos **ativos** em destaque com formatação especial.",
    is_cover: false,
    sort_order: 3
  },
  {
    image_url: "https://via.placeholder.com/600x900/333333/ffffff?text=Imagem+Vertical+4",
    public_url: "https://via.placeholder.com/600x900/333333/ffffff?text=Imagem+Vertical+4",
    caption: "Quarta imagem **vertical** com elementos **ativos** em destaque. Demonstra a versatilidade da galeria.",
    is_cover: false,
    sort_order: 4
  },
  {
    image_url: "https://via.placeholder.com/800x600/666666/ffffff?text=Imagem+Horizontal+5",
    public_url: "https://via.placeholder.com/800x600/666666/ffffff?text=Imagem+Horizontal+5",
    caption: "Quinta imagem horizontal com legenda longa que demonstra como o texto se comporta quando há muito conteúdo. **Ativos** e **institucional** em negrito.",
    is_cover: false,
    sort_order: 5
  }
];

export default function GalleryDemo() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Demonstração da Galeria Institucional
          </h1>
          
          <div className="space-y-12">
            {/* Debug: Galeria simples */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-red-600">
                Debug - Galeria Simples
              </h2>
              <SimpleGallery 
                images={sampleImages}
                newsTitle="Demonstração da Galeria"
              />
            </div>

            {/* Exemplo 1: Galeria moderna com legenda */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-[#0E2A47]">
                Galeria Moderna — Legenda Integrada
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Legenda moderna dentro da galeria com overlay elegante, botão de info e animações suaves
              </p>
              <ModernImageGallery 
                images={sampleImages}
                newsTitle="Demonstração da Galeria Moderna"
                variant="marinho"
                showCaption="hover"
              />
            </div>

            {/* Exemplo 2: Galeria adaptativa */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-[#0E2A47]">
                Galeria Adaptativa — Sem espaços vazios
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                A imagem ocupa todo o espaço disponível, respeitando o limite que alcançar primeiro (vertical ou horizontal)
              </p>
              <AdaptiveImageGallery 
                images={sampleImages}
                newsTitle="Demonstração da Galeria Adaptativa"
                variant="marinho"
              />
            </div>

            {/* Exemplo 2: Galeria com tema marinho */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-[#0E2A47]">
                Opção A — Marinho institucional (aspect-ratio fixo)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Primário #0E2A47 | Hover #0B2239 | Destaque controlado #C6001C
              </p>
              <InstitutionalImageGallery 
                images={sampleImages}
                newsTitle="Demonstração da Galeria"
                variant="marinho"
              />
            </div>

            {/* Exemplo 3: Galeria moderna com legenda sempre visível */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-[#0E2A47]">
                Galeria Moderna — Legenda Sempre Visível
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Legenda sempre visível com overlay elegante e botão de info
              </p>
              <ModernImageGallery 
                images={sampleImages.slice(0, 3)}
                newsTitle="Demonstração da Galeria Moderna"
                variant="marinho"
                showCaption="always"
              />
            </div>

            {/* Exemplo 4: Galeria com tema padrão */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Opção B — Tema padrão
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Cores padrão do sistema
              </p>
              <InstitutionalImageGallery 
                images={sampleImages.slice(0, 3)}
                newsTitle="Demonstração da Galeria"
                variant="default"
              />
            </div>

            {/* Exemplo 3: Galeria com uma única imagem */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-[#0E2A47]">
                Galeria com imagem única
              </h2>
              <InstitutionalImageGallery 
                images={[sampleImages[0]]}
                newsTitle="Imagem única"
                variant="marinho"
              />
            </div>
          </div>

          {/* Características do componente */}
          <div className="mt-12 bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Características do Componente</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ <strong>Contador de imagens</strong> no canto superior esquerdo (ex: "1 de 5")</li>
              <li>✅ <strong>Setas de navegação</strong> circulares nas laterais (aparecem no hover)</li>
              <li>✅ <strong>Miniaturas</strong> na parte inferior com borda destacada na ativa</li>
              <li>✅ <strong>Legenda moderna integrada</strong> com overlay elegante e botão de info</li>
              <li>✅ <strong>Animações suaves</strong> para legenda (hover, sempre visível, nunca)</li>
              <li>✅ <strong>Gradiente elegante</strong> de preto transparente para legenda</li>
              <li>✅ <strong>Ícone de informação</strong> para indicar presença de legenda</li>
              <li>✅ <strong>Cores</strong> seguindo o esquema marinho institucional (#0E2A47) e vermelho (#C6001C)</li>
              <li>✅ <strong>Galeria adaptativa</strong> - imagens ocupam todo o espaço sem vazios</li>
              <li>✅ <strong>Detecção automática</strong> de proporção (vertical/horizontal)</li>
              <li>✅ <strong>Suporte a imagens verticais</strong> e horizontais com adaptação automática</li>
              <li>✅ <strong>Responsivo</strong> e otimizado para diferentes tamanhos de tela</li>
              <li>✅ <strong>Navegação por teclado</strong> (setas e ESC para fechar)</li>
              <li>✅ <strong>Modal tela cheia</strong> com navegação completa</li>
              <li>✅ <strong>Suporte a imagem única</strong> ou múltiplas imagens</li>
              <li>✅ <strong>Legendas longas</strong> com quebra de linha automática</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
