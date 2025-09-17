import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePrompts } from "@/hooks/usePrompts";
import { usePaginatedPrompts } from "@/hooks/usePaginatedPrompts";
import { useToast } from "@/hooks/use-toast";
import { promptService } from "@/lib/services/promptService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, RefreshCw, AlertCircle, X } from "lucide-react";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PaginationControls } from "@/components/PaginationControls";
import { PromptCard } from "@/components/PromptCard";
import { ThemeProvider } from "next-themes";
import type { Prompt } from "@/lib/types";

interface CreatePromptData {
  title: string;
  difficulty: 'facil' | 'media' | 'dificil';
  body: string;
  tags: { name: string }[];
}

interface EditPromptData extends CreatePromptData {
  id: number;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { createPrompt, deletePrompt, updatePrompt, toggleFavorite } = usePrompts();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("mine");
  const [newPrompt, setNewPrompt] = useState<CreatePromptData>({
    title: "",
    difficulty: "facil",
    body: "",
    tags: []
  });
  const [editingPrompt, setEditingPrompt] = useState<EditPromptData | null>(null);

  // Pagination hooks for different views - only keep mine and favorites
  const myPromptsData = usePaginatedPrompts('mine');
  const favoritesData = usePaginatedPrompts('favorites');

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'favorites': return favoritesData;
      default: return myPromptsData;
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
    if (!newPrompt.title || !newPrompt.body || !newPrompt.difficulty) {
      toast({
        title: "Error",
        description: "El título, dificultad y contenido son obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      const promptData = {
        title: newPrompt.title,
        difficulty: newPrompt.difficulty,
        body: newPrompt.body,
        tags: newPrompt.tags
      };

      await promptService.create(promptData);
      
      setIsCreateDialogOpen(false);
      setNewPrompt({
        title: "",
        difficulty: "facil",
        body: "",
        tags: []
      });
      
      myPromptsData.refresh();
      
      toast({
        title: "¡Prompt creado!",
        description: "Tu prompt ha sido creado exitosamente"
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      toast({
        title: "Error al crear prompt",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt({
      id: prompt.id,
      title: prompt.title,
      difficulty: prompt.difficulty,
      body: prompt.body,
      tags: prompt.tags ?? []
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePrompt = async () => {
    if (!editingPrompt || !editingPrompt.title || !editingPrompt.body || !editingPrompt.difficulty) {
      toast({
        title: "Error",
        description: "El título, dificultad y contenido son obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      const updateData = {
        title: editingPrompt.title,
        difficulty: editingPrompt.difficulty,
        body: editingPrompt.body,
        tags: editingPrompt.tags
      };

      await promptService.update(editingPrompt.id, updateData);
      
      setIsEditDialogOpen(false);
      setEditingPrompt(null);
      myPromptsData.refresh();
      
      toast({
        title: "Prompt actualizado",
        description: "Tu prompt ha sido actualizado exitosamente"
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      toast({
        title: "Error al actualizar prompt",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleDeletePrompt = async (id: number) => {
    try {
      await promptService.remove(id);
      myPromptsData.refresh();
      toast({
        title: "Prompt eliminado",
        description: "Tu prompt ha sido eliminado exitosamente"
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      toast({
        title: "Error al eliminar prompt",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleToggleFavorite = async (id: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use optimistic toggle from the current active data source
      const currentData = getCurrentData();
      await currentData.toggleFavoriteOptimistic(id);
      
      // Refresh the other section to keep consistency
      if (activeTab === 'mine') {
        favoritesData.refresh();
      } else {
        myPromptsData.refresh();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleTagsChange = (value: string, type: 'create' | 'edit') => {
    const tagsArray = value.split(',').map(tag => ({ name: tag.trim() })).filter(tag => tag.name.length > 0);
    if (type === 'create') {
      setNewPrompt(prev => ({ ...prev, tags: tagsArray }));
    } else {
      setEditingPrompt(prev => prev ? ({ ...prev, tags: tagsArray }) : null);
    }
  };

  const difficulties = [
    { value: "facil", label: "Fácil" },
    { value: "media", label: "Media" },
    { value: "dificil", label: "Difícil" }
  ];

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
        : "No tienes prompts favoritos aún.";

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
              variant="dashboard"
              onToggleFavorite={handleToggleFavorite}
              onEdit={activeTab === 'mine' ? handleEditPrompt : undefined}
              onDelete={activeTab === 'mine' ? handleDeletePrompt : undefined}
              isOwner={activeTab === 'mine'}
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
              <p className="text-muted-foreground">Gestiona tus prompts y favoritos</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <TabsList className="grid w-full lg:w-auto grid-cols-2">
                  <TabsTrigger value="mine">Mis Prompts ({myPromptsData.totalCount})</TabsTrigger>
                  <TabsTrigger value="favorites">Favoritos ({favoritesData.totalCount})</TabsTrigger>
                </TabsList>

                <div className="flex justify-end flex-1">
                  {/* Create prompt button */}
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
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
                          <Label htmlFor="difficulty">Dificultad</Label>
                          <Select 
                            value={newPrompt.difficulty ?? undefined} 
                            onValueChange={(value) => setNewPrompt(prev => ({ ...prev, difficulty: value as 'facil' | 'media' | 'dificil' }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona dificultad" />
                            </SelectTrigger>
                            <SelectContent>
                              {difficulties.filter(d => d.value && d.value.length > 0).map((difficulty) => (
                                <SelectItem key={difficulty.value} value={difficulty.value}>
                                  {difficulty.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="content">Contenido del Prompt</Label>
                          <Textarea
                            id="content"
                            value={newPrompt.body}
                            onChange={(e) => setNewPrompt(prev => ({ ...prev, body: e.target.value }))}
                            placeholder="Escribe aquí el prompt..."
                            rows={6}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="tags">Tags (separados por comas)</Label>
                          <Input
                            id="tags"
                            value={newPrompt.tags.map(tag => tag.name).join(', ')}
                            onChange={(e) => handleTagsChange(e.target.value, 'create')}
                            placeholder="marketing, ventas, copywriting"
                          />
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

                  {/* Edit prompt dialog */}
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Editar Prompt</DialogTitle>
                        <DialogDescription>
                          Modifica tu prompt
                        </DialogDescription>
                      </DialogHeader>
                      
                      {editingPrompt && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-title">Título</Label>
                            <Input
                              id="edit-title"
                              value={editingPrompt.title}
                              onChange={(e) => setEditingPrompt(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                              placeholder="Título del prompt..."
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="edit-difficulty">Dificultad</Label>
                            <Select 
                              value={editingPrompt.difficulty ?? undefined} 
                              onValueChange={(value) => setEditingPrompt(prev => prev ? ({ ...prev, difficulty: value as 'facil' | 'media' | 'dificil' }) : null)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona dificultad" />
                              </SelectTrigger>
                              <SelectContent>
                                {difficulties.filter(d => d.value && d.value.length > 0).map((difficulty) => (
                                  <SelectItem key={difficulty.value} value={difficulty.value}>
                                    {difficulty.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="edit-content">Contenido del Prompt</Label>
                            <Textarea
                              id="edit-content"
                              value={editingPrompt.body}
                              onChange={(e) => setEditingPrompt(prev => prev ? ({ ...prev, body: e.target.value }) : null)}
                              placeholder="Escribe aquí el prompt..."
                              rows={6}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="edit-tags">Tags (separados por comas)</Label>
                            <Input
                              id="edit-tags"
                              value={editingPrompt.tags.map(tag => tag.name).join(', ')}
                              onChange={(e) => handleTagsChange(e.target.value, 'edit')}
                              placeholder="marketing, ventas, copywriting"
                            />
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleUpdatePrompt}>
                              Guardar Cambios
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

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

export default Dashboard;