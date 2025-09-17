import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Heart, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Prompt } from "@/lib/types";

interface PromptCardProps {
  prompt: Prompt;
  variant?: 'explore' | 'dashboard';
  onToggleFavorite: (promptId: number) => void;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (promptId: number) => void;
  isOwner?: boolean;
}

export const PromptCard = ({ 
  prompt, 
  variant = 'explore',
  onToggleFavorite, 
  onEdit, 
  onDelete,
  isOwner = false 
}: PromptCardProps) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const copyPrompt = (content: string, title: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "¡Prompt copiado!",
      description: `"${title}" copiado al portapapeles`,
    });
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

  return (
    <Card className="shadow-card-custom hover:shadow-elegant transition-all duration-300 flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg mb-4 flex-1 pr-2">{prompt.title}</CardTitle>
          <div className="flex items-center gap-1 shrink-0">
            {variant === 'dashboard' && isOwner && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(prompt)}
                className="hover:bg-primary/10"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {variant === 'dashboard' && isOwner && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(prompt.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(prompt.id)}
              className="hover:bg-primary/10"
            >
              <Heart 
                className={`h-4 w-4 ${
                  prompt.is_favorited 
                    ? 'fill-primary text-primary' 
                    : 'text-muted-foreground'
                }`} 
              />
            </Button>
          </div>
        </div>

        {/* Difficulty and Owner Indicators */}
        <div className="flex items-center gap-3 mb-4">
          <Badge 
            className={`${getDifficultyColor(prompt.difficulty)} font-semibold`}
          >
            {getDifficultyIcon(prompt.difficulty)} {prompt.difficulty}
          </Badge>
          <Badge variant="outline" className="font-medium">
            {prompt.owner?.name || 'Anónimo'}
          </Badge>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(prompt.tags ?? []).map((tag, index) => (
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

      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1">
          {/* Prompt with Show More */}
          <div className="bg-muted/50 rounded-lg p-4">
            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap leading-relaxed">
              {isExpanded 
                ? prompt.body 
                : `${prompt.body.substring(0, 300)}${prompt.body.length > 300 ? '...' : ''}`
              }
            </pre>
            {prompt.body.length > 300 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-primary hover:text-primary/80 p-0 h-auto"
              >
                {isExpanded ? 'Mostrar menos' : 'Mostrar más'}
              </Button>
            )}
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t mt-4">
          <div className="flex items-center space-x-4">
            {variant === 'explore' && (
              <>
                <span>❤️ {prompt.favorites_count ?? 0}</span>
                <span>👁️ {prompt.view_count ?? 0}</span>
              </>
            )}
            {variant === 'dashboard' && (
              <span>❤️ {prompt.favorites_count ?? 0}</span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyPrompt(prompt.body, prompt.title)}
            className="hover:bg-primary/10"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};