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
import { PromptCard } from "@/components/PromptCard";

const ExploreSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { toggleFavorite } = usePrompts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState("");
  

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
    { value: "facil", label: "Fácil" },
    { value: "media", label: "Media" },
    { value: "dificil", label: "Difícil" }
  ];

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
                <div className="flex gap-2">
                  <Select value={selectedDifficulty ?? undefined} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Dificultad" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.filter(d => d.value && d.value.length > 0).map((difficulty) => (
                        <SelectItem key={difficulty.value} value={difficulty.value}>
                          {difficulty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDifficulty && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDifficulty(undefined)}
                      className="shrink-0"
                    >
                      ✕
                    </Button>
                  )}
                </div>
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
                <div 
                  key={promptItem.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <PromptCard
                    prompt={promptItem}
                    variant="explore"
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
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