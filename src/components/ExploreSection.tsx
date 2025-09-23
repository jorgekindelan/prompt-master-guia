import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Loader2, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePaginatedPrompts } from "@/hooks/usePaginatedPrompts";
import { PaginationControls } from "@/components/PaginationControls";
import { useAuth } from "@/hooks/useAuth";
import { PromptCard } from "@/components/PromptCard";
import debounce from "lodash.debounce";

const ExploreSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Local controlled state (what user sees while typing)
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | undefined>(
    searchParams.get('difficulty') || undefined
  );
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');

  // Applied filters (what gets sent to API)
  const appliedFilters = {
    search: searchParams.get('search') || undefined,
    difficulty: searchParams.get('difficulty') || undefined,
    tag: searchParams.get('tag') || undefined,
  };

  // Apply filters function
  const applyFilters = useCallback(() => {
    const newParams = new URLSearchParams();
    
    // Add filters only if they have values
    if (searchText.trim()) newParams.set('search', searchText.trim());
    if (selectedDifficulty) newParams.set('difficulty', selectedDifficulty);
    if (selectedTag.trim()) newParams.set('tag', selectedTag.trim());
    
    // Always reset to page 1 when applying filters
    newParams.set('page', '1');
    
    setSearchParams(newParams);
  }, [searchText, selectedDifficulty, selectedTag, setSearchParams]);

  // Debounced version for auto-search
  const debouncedApply = useMemo(
    () => debounce(applyFilters, 350),
    [applyFilters]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchText('');
    setSelectedDifficulty(undefined);
    setSelectedTag('');
    setSearchParams({ page: '1' });
  }, [setSearchParams]);

  // Auto-apply filters with debounce when user stops typing
  useEffect(() => {
    debouncedApply();
    return () => debouncedApply.cancel();
  }, [searchText, selectedDifficulty, selectedTag, debouncedApply]);

  // Sync local state with URL params when they change externally
  useEffect(() => {
    setSearchText(searchParams.get('search') || '');
    setSelectedDifficulty(searchParams.get('difficulty') || undefined);
    setSelectedTag(searchParams.get('tag') || '');
  }, [searchParams.get('search'), searchParams.get('difficulty'), searchParams.get('tag')]);

  const {
    prompts,
    loading,
    error,
    currentPage,
    totalPages,
    hasNext,
    hasPrevious,
    retry
  } = usePaginatedPrompts('all', appliedFilters);

  // Handle page change while preserving filters
  const handlePageChange = useCallback((page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const difficulties = [
    { value: "facil", label: "Fácil" },
    { value: "media", label: "Media" },
    { value: "dificil", label: "Difícil" }
  ];

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
          <div className="flex flex-col items-center gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Explorar <span className="text-primary">Prompts</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Descubre una colección curada de prompts efectivos. Filtra por categoría, 
                copia los que más te gusten y úsalos inmediatamente.
              </p>
            </div>
            {user && (
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Publicar Prompt
              </Button>
            )}
          </div>
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  debouncedApply.cancel(); // Cancel any pending debounced call
                  applyFilters(); // Apply immediately
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar prompts..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
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
                    <Select 
                      value={selectedDifficulty || ''} 
                      onValueChange={(value) => setSelectedDifficulty(value || undefined)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Dificultad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas las dificultades</SelectItem>
                        {difficulties.map((difficulty) => (
                          <SelectItem key={difficulty.value} value={difficulty.value}>
                            {difficulty.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedDifficulty && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDifficulty(undefined)}
                        className="shrink-0"
                        aria-label="Limpiar filtro de dificultad"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-center gap-2 mt-4">
                  <Button 
                    type="submit"
                    variant="default"
                    aria-label="Buscar prompts"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                    aria-label="Limpiar todos los filtros"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                </div>
              </form>
              
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
                  />
                </div>
              ))}
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default ExploreSection;