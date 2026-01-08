-- Create usage_metrics table for tracking daily aggregated usage
CREATE TABLE public.usage_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint for daily aggregation
CREATE UNIQUE INDEX idx_usage_metrics_unique ON public.usage_metrics(date, metric_type);

-- Enable RLS
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

-- Admin-only read access
CREATE POLICY "Admins can view usage metrics"
ON public.usage_metrics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_master_admin(auth.uid()));

-- System can insert/update metrics
CREATE POLICY "System can insert usage metrics"
ON public.usage_metrics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update usage metrics"
ON public.usage_metrics
FOR UPDATE
USING (true);

-- Create cost_estimates table for historical cost tracking
CREATE TABLE public.cost_estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  ai_cost NUMERIC(10,4) NOT NULL DEFAULT 0,
  edge_function_cost NUMERIC(10,4) NOT NULL DEFAULT 0,
  storage_cost NUMERIC(10,4) NOT NULL DEFAULT 0,
  db_cost NUMERIC(10,4) NOT NULL DEFAULT 0,
  total_cost NUMERIC(10,4) NOT NULL DEFAULT 0,
  usage_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cost_estimates ENABLE ROW LEVEL SECURITY;

-- Admin-only read access
CREATE POLICY "Admins can view cost estimates"
ON public.cost_estimates
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_master_admin(auth.uid()));

-- System can insert/update cost estimates
CREATE POLICY "System can insert cost estimates"
ON public.cost_estimates
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update cost estimates"
ON public.cost_estimates
FOR UPDATE
USING (true);