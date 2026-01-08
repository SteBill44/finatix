-- Create table to store visitor snapshots for historical trends
CREATE TABLE public.visitor_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_count INTEGER NOT NULL DEFAULT 0,
  user_count INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient time-based queries
CREATE INDEX idx_visitor_snapshots_recorded_at ON visitor_snapshots(recorded_at DESC);

-- Enable RLS
ALTER TABLE public.visitor_snapshots ENABLE ROW LEVEL SECURITY;

-- Only admins can read visitor snapshots
CREATE POLICY "Admins can read visitor snapshots"
ON public.visitor_snapshots
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR is_master_admin(auth.uid()));

-- Allow inserting snapshots (will be done via service role or authenticated users)
CREATE POLICY "Authenticated users can insert snapshots"
ON public.visitor_snapshots
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);