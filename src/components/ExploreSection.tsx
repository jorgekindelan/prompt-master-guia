import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Copy, Heart, Filter, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePaginatedPrompts } from "@/hooks/usePaginatedPrompts";
import { PaginationControls } from "@/components/PaginationControls";
import { usePrompts } from "@/hooks/usePrompts";
import { useAuth } from "@/hooks/useAuth";

const ExploreSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { toggleFavorite } = usePrompts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(new Set());

  const filters = {
    search: searchTerm || undefined,
    difficulty: selectedDifficulty || undefined,
    tag: selectedTag || undefined,
  };

  const {
    prompts,
    loading,
    error,
    currentPage,
    totalPages,
    hasNext,
    hasPrevious,
    setPage,
    retry
  } = usePaginatedPrompts('all', filters);

  const difficulties = [
    { value: "", label: "Todos los niveles" },
    { value: "facil", label: "Fácil" },
    { value: "media", label: "Media" },
    { value: "dificil", label: "Difícil" }
  ];

  const copyPrompt = (prompt: string, title: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "¡Prompt copiado!",
      description: `"${title}" copiado al portapapeles`,
    });
  };

  const handleToggleFavorite = async (promptId: number) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "destructive"
      });
      return;
    }
    await toggleFavorite(promptId.toString());
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedPrompts);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedPrompts(newExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "facil": return "bg-emerald-500 text-white";
      case "media": return "bg-amber-500 text-white";
      case "dificil": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "facil": return "●";
      case "media": return "●●";
      case "dificil": return "●●●";
      default: return "●";
    }
  };

  if (loading) {
    return (
      <section id="explorar" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando prompts...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="explorar" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-destructive mb-4">Error al cargar prompts: {error}</p>
            <Button onClick={retry}>Reintentar</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="explorar" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Explorar <span className="text-primary">Prompts</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre una colección curada de prompts efectivos. Filtra por categoría, 
            copia los que más te gusten y úsalos inmediatamente.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="max-w-4xl mx-auto mb-12 animate-slide-up">
          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-primary" />
                <span>Filtros y Búsqueda</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Tag Filter */}
                <Input
                  placeholder="Filtrar por tag..."
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                />

                {/* Difficulty Filter */}
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dificultad" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Página {currentPage} de {totalPages} | Mostrando {prompts.length} prompts
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prompts Grid */}
        {prompts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">No se encontraron prompts</p>
            <p className="text-muted-foreground">Intenta ajustar tus filtros de búsqueda</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prompts.map((promptItem, index) => (
                <Card 
                  key={promptItem.id} 
                  className="shadow-card-custom hover:shadow-elegant transition-all duration-300 animate-scale-in flex flex-col h-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg mb-4">{promptItem.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFavorite(promptItem.id)}
                        className="shrink-0 ml-2 hover:bg-primary/10"
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            promptItem.is_favorited 
                              ? 'fill-primary text-primary' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                      </Button>
                    </div>

                    {/* Difficulty and Owner Indicators */}
                    <div className="flex items-center gap-3 mb-4">
                      <Badge 
                        className={`${getDifficultyColor(promptItem.difficulty)} font-semibold`}
                      >
                        {getDifficultyIcon(promptItem.difficulty)} {promptItem.difficulty}
                      </Badge>
                      <Badge variant="outline" className="font-medium">
                        {promptItem.owner?.name || 'Anónimo'}
                      </Badge>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(promptItem.tags ?? []).map((tag, index) => (
                        <Badge 
                          key={tag.name} 
                          variant="secondary" 
                          className={`text-xs ${
                            index % 4 === 0 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            index % 4 === 1 ? 'bg-green-50 text-green-700 border-green-200' :
                            index % 4 === 2 ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-orange-50 text-orange-700 border-orange-200'
                          }`}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-grow flex flex-col">
                    <div className="flex-grow space-y-4">
                      {/* Prompt with Show More */}
                      <div className="bg-muted/50 rounded-lg p-4 flex-grow">
                        <pre className="text-sm font-mono text-foreground whitespace-pre-wrap leading-relaxed">
                          {expandedPrompts.has(promptItem.id) 
                            ? promptItem.body 
                            : `${promptItem.body.substring(0, 300)}${promptItem.body.length > 300 ? '...' : ''}`
                          }
                        </pre>
                        {promptItem.body.length > 300 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(promptItem.id)}
                            className="mt-2 text-primary hover:text-primary/80 p-0 h-auto"
                          >
                            {expandedPrompts.has(promptItem.id) ? 'Mostrar menos' : 'Mostrar más'}
                          </Button>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                        <div className="flex items-center space-x-4">
                          <span>❤️ {promptItem.favorites_count ?? 0}</span>
                          <span>👁️ {promptItem.view_count ?? 0}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyPrompt(promptItem.body, promptItem.title)}
                          className="hover:bg-primary/10"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default ExploreSection;