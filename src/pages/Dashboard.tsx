import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePrompts } from "@/hooks/usePrompts";
import { usePaginatedPrompts } from "@/hooks/usePaginatedPrompts";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Trash2, Heart, Star, Loader2, RefreshCw, Eye, AlertCircle } from "lucide-react";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PaginationControls } from "@/components/PaginationControls";
import { CreatePromptData } from "@/hooks/usePrompts";
import { ThemeProvider } from "next-themes";
import type { Prompt } from "@/lib/types";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { createPrompt, deletePrompt, ratePrompt, toggleFavorite } = usePrompts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("explore");
  const [newPrompt, setNewPrompt] = useState<CreatePromptData>({
    title: "",
    description: "",
    content: "",
    tags: [],
    category_id: "",
    is_public: true
  });

  // Pagination hooks for different views
  const exploreData = usePaginatedPrompts('all', { 
    search: searchTerm, 
    difficulty: selectedDifficulty === 'all' ? undefined : selectedDifficulty 
  });
  const myPromptsData = usePaginatedPrompts('mine');
  const favoritesData = usePaginatedPrompts('favorites');

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'mine': return myPromptsData;
      case 'favorites': return favoritesData;
      default: return exploreData;
    }
  };

  const currentData = getCurrentData();

  // Redirect if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleCreatePrompt = async () => {
    if (!newPrompt.title || !newPrompt.content) {
      return;
    }

    const success = await createPrompt(newPrompt);
    if (success) {
      setIsCreateDialogOpen(false);
      setNewPrompt({
        title: "",
        description: "",
        content: "",
        tags: [],
        category_id: "",
        is_public: true
      });
      // Refresh the appropriate data based on current tab
      myPromptsData.refresh();
      if (newPrompt.is_public) {
        exploreData.refresh();
      }
    }
  };

  const handleDeletePrompt = async (id: string) => {
    const success = await deletePrompt(id);
    if (success) {
      // Refresh the appropriate data
      myPromptsData.refresh();
      exploreData.refresh();
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const success = await toggleFavorite(id);
    if (success) {
      // Refresh favorites and other views
      favoritesData.refresh();
      exploreData.refresh();
      myPromptsData.refresh();
    }
  };

  const handleTagsChange = (value: string) => {
    const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setNewPrompt(prev => ({ ...prev, tags: tagsArray }));
  };

  const renderPromptGrid = () => {
    const { prompts, loading, error, currentPage, totalPages, hasNext, hasPrevious, setPage, retry } = currentData;

    if (loading) {
      return (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando prompts...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={retry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Intentar de nuevo
          </Button>
        </div>
      );
    }

    if (prompts.length === 0) {
      const emptyMessage = activeTab === 'mine' 
        ? "No tienes prompts aún. ¡Crea tu primer prompt!"
        : activeTab === 'favorites'
        ? "No tienes prompts favoritos aún."
        : "No hay prompts disponibles con los filtros seleccionados.";

      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map(prompt => (
            <PromptCard 
              key={prompt.id} 
              prompt={prompt} 
              onDelete={handleDeletePrompt}
              onRate={ratePrompt}
              onToggleFavorite={handleToggleFavorite}
              isOwner={prompt.owner?.id === user?.id}
            />
          ))}
        </div>
        
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
        />
      </>
    );
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Gestiona tus prompts y explora nuevos</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <TabsList className="grid w-full lg:w-auto grid-cols-3">
                  <TabsTrigger value="explore">Explorar ({exploreData.totalCount})</TabsTrigger>
                  <TabsTrigger value="mine">Mis Prompts ({myPromptsData.totalCount})</TabsTrigger>
                  <TabsTrigger value="favorites">Favoritos ({favoritesData.totalCount})</TabsTrigger>
                </TabsList>

                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  {/* Search - only for explore tab */}
                  {activeTab === 'explore' && (
                    <>
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar prompts..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Dificultad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="facil">Fácil</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="dificil">Difícil</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  )}

                  {/* Create prompt button */}
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Prompt
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Prompt</DialogTitle>
                        <DialogDescription>
                          Crea un nuevo prompt para tu colección
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Título</Label>
                          <Input
                            id="title"
                            value={newPrompt.title}
                            onChange={(e) => setNewPrompt(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Título del prompt..."
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Descripción</Label>
                          <Textarea
                            id="description"
                            value={newPrompt.description}
                            onChange={(e) => setNewPrompt(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe tu prompt..."
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="content">Contenido del Prompt</Label>
                          <Textarea
                            id="content"
                            value={newPrompt.content}
                            onChange={(e) => setNewPrompt(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Escribe aquí el prompt..."
                            rows={6}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="tags">Tags (separados por comas)</Label>
                          <Input
                            id="tags"
                            value={newPrompt.tags.join(', ')}
                            onChange={(e) => handleTagsChange(e.target.value)}
                            placeholder="marketing, ventas, copywriting"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="is_public"
                            checked={newPrompt.is_public}
                            onCheckedChange={(checked) => setNewPrompt(prev => ({ ...prev, is_public: checked as boolean }))}
                          />
                          <Label htmlFor="is_public">Hacer público (visible para otros usuarios)</Label>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleCreatePrompt}>
                            Crear Prompt
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <TabsContent value="explore">
                {renderPromptGrid()}
              </TabsContent>
              
              <TabsContent value="mine">
                {renderPromptGrid()}
              </TabsContent>
              
              <TabsContent value="favorites">
                {renderPromptGrid()}
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

// Prompt Card Component
interface PromptCardProps {
  prompt: Prompt;
  onDelete: (id: string) => void;
  onRate: (id: string, rating: number) => void;
  onToggleFavorite: (id: string) => void;
  isOwner: boolean;
}

const PromptCard = ({ prompt, onDelete, onRate, onToggleFavorite, isOwner }: PromptCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Defensive programming - ensure arrays and numbers exist
  const tags = prompt.tags ?? [];
  const favoritesCount = prompt.favorites_count ?? 0;
  const ratingAvg = prompt.rating_avg ?? 0;
  const ratingCount = prompt.rating_count ?? 0;
  const viewCount = prompt.view_count ?? 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{prompt.title}</CardTitle>
            {prompt.description && (
              <CardDescription className="line-clamp-2 mt-2">
                {prompt.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center space-x-1 ml-2">
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(prompt.id.toString())}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(prompt.id.toString())}
            >
              <Heart className={`h-4 w-4 ${prompt.is_favorited ? 'fill-primary text-primary' : ''}`} />
            </Button>
          </div>
        </div>
        
        {prompt.difficulty && (
          <Badge variant="secondary" className="w-fit">
            {prompt.difficulty}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1">
          <div className={`text-sm text-muted-foreground ${isExpanded ? '' : 'line-clamp-3'}`}>
            {prompt.body || ''}
          </div>
          {(prompt.body || '').length > 150 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0 h-auto text-primary"
            >
              {isExpanded ? 'Ver menos' : 'Ver más'}
            </Button>
          )}
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {tags.slice(0, 3).map((tag: any, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {typeof tag === 'string' ? tag : tag.name}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4" />
              <span>{ratingAvg.toFixed(1)}</span>
              <span>({ratingCount})</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{viewCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{favoritesCount}</span>
            </div>
          </div>
          
          {!isOwner && (
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => onRate(prompt.id.toString(), star)}
                  className="text-muted-foreground hover:text-yellow-500 transition-colors"
                >
                  <Star className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;