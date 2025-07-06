import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { NewsTicker } from "@/components/NewsTicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  MessageCircle, 
  Send, 
  Users, 
  Clock,
  Calendar,
  Mic,
  Camera
} from "lucide-react";

const currentPrograms = [
  {
    id: 1,
    title: "Jornal Nacional",
    time: "20:30 - 21:15",
    description: "As principais notícias do Brasil e do mundo",
    status: "ao-vivo",
    viewers: 15420
  },
  {
    id: 2,
    title: "Plantão de Notícias",
    time: "21:15 - 22:00",
    description: "Cobertura especial dos acontecimentos do dia",
    status: "proximo"
  },
  {
    id: 3,
    title: "Mesa Redonda",
    time: "22:00 - 23:00",
    description: "Debate com especialistas sobre temas atuais",
    status: "proximo"
  }
];

const chatMessages = [
  { id: 1, user: "João Silva", message: "Excelente cobertura!", time: "20:35" },
  { id: 2, user: "Maria Santos", message: "Muito informativo", time: "20:36" },
  { id: 3, user: "Carlos Oliveira", message: "Parabéns pela qualidade", time: "20:37" },
  { id: 4, user: "Ana Costa", message: "Acompanho sempre", time: "20:38" },
];

const AoVivo = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState(chatMessages);
  const [viewerCount, setViewerCount] = useState(15420);

  useEffect(() => {
    // Simular atualização do contador de visualizadores
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        user: "Você",
        message: chatMessage,
        time: new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      setMessages([...messages, newMessage]);
      setChatMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NewsTicker />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <h1 className="text-3xl font-bold text-foreground">AO VIVO</h1>
            </div>
            <Badge variant="destructive" className="animate-pulse">
              TRANSMITINDO
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Acompanhe nossa transmissão ao vivo com as últimas notícias e análises
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden bg-black">
              <div className="relative aspect-video">
                {/* Video Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      {isPlaying ? (
                        <Camera className="w-10 h-10" />
                      ) : (
                        <Play className="w-10 h-10 ml-1" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {isPlaying ? "TRANSMISSÃO AO VIVO" : "TRANSMISSÃO PAUSADA"}
                    </h3>
                    <p className="text-gray-300">
                      {isPlaying ? "Jornal Nacional - Edição das 20:30" : "Clique play para retomar"}
                    </p>
                  </div>
                </div>

                {/* Live Indicators */}
                <div className="absolute top-4 left-4 flex items-center gap-3">
                  <div className="flex items-center space-x-2 bg-primary px-3 py-1 rounded">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-bold uppercase">AO VIVO</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-black/50 px-3 py-1 rounded text-white text-sm">
                    <Users className="w-4 h-4" />
                    <span>{viewerCount.toLocaleString()} espectadores</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-black/50 hover:bg-black/70"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-black/50 hover:bg-black/70"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-black/50 hover:bg-black/70"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Program Info */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Mic className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Jornal Nacional - Edição Especial
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Acompanhe as principais notícias do dia com análises aprofundadas e entrevistas exclusivas com especialistas e autoridades.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>20:30 - 21:15</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Segunda a Sexta</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chat */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Chat ao Vivo</h3>
              </div>
              
              <div className="space-y-3 h-64 overflow-y-auto mb-4 p-2 bg-muted/20 rounded">
                {messages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-primary text-xs">
                        {msg.user}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-foreground">{msg.message}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </Card>

            {/* Programming Schedule */}
            <Card className="p-4">
              <h3 className="font-bold text-lg mb-4">Programação</h3>
              <div className="space-y-3">
                {currentPrograms.map((program, index) => (
                  <div key={program.id}>
                    <div className="flex items-start gap-3">
                      <div className="text-sm text-muted-foreground min-w-fit">
                        {program.time}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{program.title}</h4>
                          {program.status === "ao-vivo" && (
                            <Badge variant="destructive" className="text-xs animate-pulse">
                              AO VIVO
                            </Badge>
                          )}
                          {program.status === "proximo" && (
                            <Badge variant="secondary" className="text-xs">
                              PRÓXIMO
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {program.description}
                        </p>
                        {program.viewers && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{program.viewers.toLocaleString()} assistindo</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {index < currentPrograms.length - 1 && (
                      <Separator className="my-3" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AoVivo;