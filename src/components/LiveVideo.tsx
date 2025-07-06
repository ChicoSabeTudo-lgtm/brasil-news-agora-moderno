import { Play, Volume2, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const LiveVideo = () => {
  return (
    <Card className="overflow-hidden bg-black">
      <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black">
        {/* Video Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 ml-1" />
            </div>
            <h3 className="text-lg font-semibold mb-2">JORNAL AO VIVO</h3>
            <p className="text-sm text-gray-300">Transmissão em tempo real</p>
          </div>
        </div>

        {/* Live Badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center space-x-2 bg-primary px-3 py-1 rounded">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-bold uppercase">AO VIVO</span>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 right-4 flex items-center space-x-2">
          <Button size="sm" variant="secondary" className="bg-black/50 hover:bg-black/70">
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary" className="bg-black/50 hover:bg-black/70">
            <Maximize className="w-4 h-4" />
          </Button>
        </div>

        {/* Viewer Count */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-black/50 px-3 py-1 rounded text-white text-sm">
            12.545 espectadores
          </div>
        </div>
      </div>

      <div className="p-4 bg-card">
        <h3 className="font-bold text-lg mb-2">Jornal da Tarde - Edição Especial</h3>
        <p className="text-muted-foreground text-sm">
          Acompanhe as principais notícias do dia com análises ao vivo e entrevistas exclusivas.
        </p>
      </div>
    </Card>
  );
};