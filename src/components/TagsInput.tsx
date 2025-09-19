import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { tagService } from '@/lib/services/tagService';
import { cn } from '@/lib/utils';
import type { Tag } from '@/lib/types';

interface TagsInputProps {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
  label?: string;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
  className?: string;
}

interface Suggestion {
  id?: number;
  name: string;
}

export const TagsInput: React.FC<TagsInputProps> = ({
  value = [],
  onChange,
  label = "Etiquetas",
  placeholder = "Añadir etiqueta...",
  maxTags = 10,
  disabled = false,
  className
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.trim() && inputValue.length > 1) {
        fetchSuggestions(inputValue);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const fetchSuggestions = async (query: string) => {
    try {
      setIsLoadingSuggestions(true);
      const response = await tagService.list({ search: query });
      const existingTagNames = value.map(tag => tag.name.toLowerCase());
      const filteredSuggestions = response.filter(
        tag => !existingTagNames.includes(tag.name.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } catch (error) {
      console.error('Error fetching tag suggestions:', error);
      // Fallback: don't show suggestions but allow manual entry
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const addTag = (tagName: string) => {
    const trimmedName = tagName.trim();
    
    if (!trimmedName) return;
    
    // Check for duplicates (case insensitive)
    const existingTagNames = value.map(tag => tag.name.toLowerCase());
    if (existingTagNames.includes(trimmedName.toLowerCase())) return;
    
    // Check max tags limit
    if (value.length >= maxTags) return;
    
    const newTag: Tag = { name: trimmedName };
    onChange([...value, newTag]);
    setInputValue('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index);
    onChange(newTags);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleAddClick = () => {
    addTag(inputValue);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    addTag(suggestion.name);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 150);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor="tags-input">{label}</Label>
      )}
      
      {/* Input Row */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            id="tags-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={value.length >= maxTags ? `Máximo ${maxTags} etiquetas` : placeholder}
            disabled={disabled || value.length >= maxTags}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddClick}
            disabled={!inputValue.trim() || disabled || value.length >= maxTags}
            aria-label="Añadir etiqueta"
            className="px-3"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-48 overflow-y-auto"
          >
            {isLoadingSuggestions ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Buscando sugerencias...
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id || index}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.name}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No hay sugerencias
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tags Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 text-sm py-1 px-2"
            >
              <span aria-label={`Etiqueta ${tag.name}`}>{tag.name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-1 hover:text-destructive transition-colors duration-150"
                  aria-label={`Quitar ${tag.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Tags Counter */}
      {value.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {value.length} / {maxTags} etiquetas
        </div>
      )}
    </div>
  );
};