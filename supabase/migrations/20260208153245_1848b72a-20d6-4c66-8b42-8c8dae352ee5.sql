
-- Add account tier tracking
ALTER TABLE public.profiles 
  ADD COLUMN account_tier text NOT NULL DEFAULT 'free',
  ADD COLUMN daily_survey_limit integer NOT NULL DEFAULT 1;

-- Create upgrade requests table to track payments
CREATE TABLE public.upgrade_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  package_name text NOT NULL,
  amount numeric NOT NULL,
  mpesa_message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  verified_at timestamp with time zone
);

ALTER TABLE public.upgrade_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own upgrade requests"
  ON public.upgrade_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own upgrade requests"
  ON public.upgrade_requests FOR SELECT
  USING (auth.uid() = user_id);
