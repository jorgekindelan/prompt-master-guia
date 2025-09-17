import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { usePrompts } from "@/hooks/usePrompts";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Star, Heart, Eye, Edit, Trash2, Search } from "lucide-react";
import type { CreatePromptData } from "@/hooks/usePrompts";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { prompts, categories, loading, createPrompt, deletePrompt, ratePrompt, toggleFavorite } = usePrompts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPrompt, setNewPrompt] = useState<CreatePromptData>({
    title: "",
    description: "",
    content: "",
    tags: [],
    category_id: "",
    is_public: true
  });

  // Redirect if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const filteredPrompts = (prompts ?? []).filter(prompt => {
    const matchesSearch = prompt.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (prompt.tags ?? []).some(tag => tag.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Since Django doesn't have categories, we'll always match category filter
    const matchesCategory = selectedCategory === "all" || true;
    
    return matchesSearch && matchesCategory;
  });

  const myPrompts = filteredPrompts.filter(prompt => prompt.owner?.id === user?.id);
  const publicPrompts = filteredPrompts.filter(prompt => prompt.owner?.id !== user?.id);

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
        category_id: "1", // default category
        is_public: true
      });
    }
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setNewPrompt(prev => ({ ...prev, tags }));
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 mt-20">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Gestiona tus prompts y explora la comunidad</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Create Prompt Button */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Crear Prompt</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Prompt</DialogTitle>
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
                    <Label htmlFor="category">Categoría</Label>
                    <Select 
                      value={newPrompt.category_id} 
                      onValueChange={(value) => setNewPrompt(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

          {/* Tabs for My Prompts and Public Prompts */}
          <Tabs defaultValue="my-prompts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-prompts">Mis Prompts ({(myPrompts ?? []).length})</TabsTrigger>
              <TabsTrigger value="public-prompts">Prompts Públicos ({(publicPrompts ?? []).length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-prompts" className="mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Cargando prompts...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(myPrompts ?? []).map(prompt => (
                    <PromptCard 
                      key={prompt.id} 
                      prompt={prompt} 
                      onDelete={deletePrompt}
                      onRate={ratePrompt}
                      onToggleFavorite={toggleFavorite}
                      isOwner={true}
                    />
                  ))}
                  {(myPrompts ?? []).length === 0 && !loading && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">No tienes prompts aún. ¡Crea tu primer prompt!</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="public-prompts" className="mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Cargando prompts...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(publicPrompts ?? []).map(prompt => (
                    <PromptCard 
                      key={prompt.id} 
                      prompt={prompt} 
                      onDelete={deletePrompt}
                      onRate={ratePrompt}
                      onToggleFavorite={toggleFavorite}
                      isOwner={false}
                    />
                  ))}
                  {(publicPrompts ?? []).length === 0 && !loading && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">No hay prompts públicos disponibles.</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

// Prompt Card Component
interface PromptCardProps {
  prompt: any;
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
                onClick={() => onDelete(prompt.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(prompt.id)}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {prompt.category && (
          <Badge variant="secondary" className="w-fit">
            {prompt.category.icon} {prompt.category.name}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1">
          <div className={`text-sm text-muted-foreground ${isExpanded ? '' : 'line-clamp-3'}`}>
            {prompt.body || prompt.content || ''}
          </div>
          {(prompt.body || prompt.content || '').length > 150 && (
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
                  onClick={() => onRate(prompt.id, star)}
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