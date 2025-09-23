import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeartButtonProps {
  isOn: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function HeartButton({ isOn, onClick, disabled = false, className }: HeartButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-pressed={isOn}
      aria-label={isOn ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "hover:bg-primary/10 transition-colors",
        className
      )}
    >
      <Heart 
        className={cn(
          'h-4 w-4 transition-colors',
          isOn 
            ? 'fill-red-500 text-red-500' 
            : 'text-muted-foreground',
          disabled && 'opacity-50'
        )} 
      />
    </Button>
  );
}