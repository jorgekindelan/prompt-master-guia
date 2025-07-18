import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageSquare, Heart, Share2, Trophy, Users, Send, Star, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CommunitySection = () => {
  const { toast } = useToast();
  const [newPrompt, setNewPrompt] = useState("");
  const [promptTitle, setPromptTitle] = useState("");

  const topUsers = [
    {
      id: 1,
      name: "María González",
      avatar: "/api/placeholder/40/40",
      prompts: 47,
      likes: 2340,
      badge: "Experta en Marketing",
      level: "Pro"
    },
    {
      id: 2,
      name: "Carlos Ruiz",
      avatar: "/api/placeholder/40/40",
      prompts: 38,
      likes: 1890,
      badge: "Desarrollador Senior",
      level: "Expert"
    },
    {
      id: 3,
      name: "Ana Martínez",
      avatar: "/api/placeholder/40/40",
      prompts: 52,
      likes: 2100,
      badge: "Creativa Digital",
      level: "Pro"
    }
  ];

  const recentPrompts = [
    {
      id: 1,
      title: "Optimizador de LinkedIn Posts",
      author: "María González",
      likes: 156,
      comments: 24,
      category: "Marketing",
      timeAgo: "2 horas",
      preview: "Crea posts de LinkedIn que generen engagement usando técnicas de storytelling..."
    },
    {
      id: 2,
      title: "Generador de Documentación de API",
      author: "Carlos Ruiz",
      likes: 203,
      comments: 31,
      category: "Programación",
      timeAgo: "5 horas",
      preview: "Genera documentación clara y completa para APIs REST siguiendo estándares..."
    },
    {
      id: 3,
      title: "Planificador de Contenido TikTok",
      author: "Ana Martínez",
      likes: 89,
      comments: 18,
      category: "Creatividad",
      timeAgo: "1 día",
      preview: "Estrategia completa para crear contenido viral en TikTok adaptado a tu nicho..."
    }
  ];

  const handleSubmitPrompt = () => {
    if (!promptTitle.trim() || !newPrompt.trim()) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, completa el título y el prompt",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "¡Prompt enviado!",
      description: "Tu prompt será revisado por la comunidad",
    });

    setPromptTitle("");
    setNewPrompt("");
  };

  return (
    <section id="comunidad" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            <span className="text-primary">Comunidad</span> PromptGuide
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Únete a una comunidad activa de creadores de prompts. Comparte tus creaciones, 
            aprende de otros y contribuye al crecimiento colectivo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Recent Prompts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Submit New Prompt */}
            <Card className="shadow-card-custom animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5 text-primary" />
                  <span>Comparte tu Prompt</span>
                </CardTitle>
                <CardDescription>
                  Ayuda a la comunidad compartiendo tus prompts favoritos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Título del prompt (ej: Generador de Emails de Ventas)"
                  value={promptTitle}
                  onChange={(e) => setPromptTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Escribe tu prompt aquí... Incluye instrucciones claras, contexto y cualquier parámetro especial que hayas usado para obtener buenos resultados."
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Tu prompt será revisado antes de publicarse
                  </p>
                  <Button 
                    onClick={handleSubmitPrompt}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Prompt
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Community Prompts */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground mb-6">Prompts Recientes de la Comunidad</h3>
              
              {recentPrompts.map((prompt, index) => (
                <Card 
                  key={prompt.id} 
                  className="shadow-card-custom hover:shadow-elegant transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{prompt.title}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {prompt.category}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>por {prompt.author}</span>
                          <span>•</span>
                          <span>{prompt.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {prompt.preview}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                          <Heart className="h-4 w-4" />
                          <span>{prompt.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          <span>{prompt.comments}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                          <Share2 className="h-4 w-4" />
                          <span>Compartir</span>
                        </button>
                      </div>
                      
                      <Button variant="outline" size="sm" className="hover:bg-primary/10">
                        Ver Completo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Contributors */}
            <Card className="shadow-card-custom animate-slide-up delay-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span>Top Colaboradores</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">👑</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-foreground text-sm">{user.name}</p>
                        <Badge 
                          variant={user.level === "Expert" ? "default" : "secondary"} 
                          className="text-xs"
                        >
                          {user.level}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{user.badge}</p>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                        <span>{user.prompts} prompts</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{user.likes.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="shadow-card-custom animate-slide-up delay-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Estadísticas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Miembros activos</span>
                    <span className="font-semibold text-foreground">12,847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Prompts compartidos</span>
                    <span className="font-semibold text-foreground">3,291</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Likes totales</span>
                    <span className="font-semibold text-foreground">48,756</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Esta semana</span>
                    <Badge className="bg-green-500 text-white">+247 prompts</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="shadow-card-custom animate-slide-up delay-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Normas de la Comunidad</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start space-x-2">
                    <Star className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Comparte prompts originales y útiles</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Star className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Proporciona contexto y ejemplos de uso</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Star className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Respeta las contribuciones de otros</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Star className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Mantén un ambiente colaborativo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;