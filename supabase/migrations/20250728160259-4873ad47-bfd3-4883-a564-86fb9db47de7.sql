-- Fix security issues by setting search_path for functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_prompt_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Update the prompts table with new rating statistics
  UPDATE public.prompts 
  SET 
    rating_avg = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM public.ratings 
      WHERE prompt_id = COALESCE(NEW.prompt_id, OLD.prompt_id)
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM public.ratings 
      WHERE prompt_id = COALESCE(NEW.prompt_id, OLD.prompt_id)
    )
  WHERE id = COALESCE(NEW.prompt_id, OLD.prompt_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;