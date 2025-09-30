-- Create function to upsert heatmap data for aggregation
CREATE OR REPLACE FUNCTION public.upsert_heatmap_data(
  p_page_url TEXT,
  p_element_selector TEXT,
  p_interaction_type TEXT,
  p_friction_score INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.heatmap_data (
    page_url,
    element_selector,
    interaction_type,
    friction_score,
    interaction_count,
    date_bucket
  )
  VALUES (
    p_page_url,
    p_element_selector,
    p_interaction_type,
    p_friction_score,
    1,
    CURRENT_DATE
  )
  ON CONFLICT (page_url, element_selector, interaction_type, date_bucket)
  DO UPDATE SET
    interaction_count = heatmap_data.interaction_count + 1,
    friction_score = (heatmap_data.friction_score * heatmap_data.interaction_count + p_friction_score) / (heatmap_data.interaction_count + 1),
    updated_at = now();
END;
$$;

-- Add unique constraint for upsert
ALTER TABLE public.heatmap_data
ADD CONSTRAINT heatmap_data_unique_key 
UNIQUE (page_url, element_selector, interaction_type, date_bucket);