
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  education_level TEXT NOT NULL DEFAULT '',
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  balance NUMERIC NOT NULL DEFAULT 0,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Surveys table
CREATE TABLE public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  questions INTEGER NOT NULL DEFAULT 5,
  payout NUMERIC NOT NULL DEFAULT 50,
  category TEXT NOT NULL DEFAULT 'General',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view surveys" ON public.surveys FOR SELECT TO authenticated USING (true);

-- Survey completions
CREATE TABLE public.survey_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, survey_id)
);

ALTER TABLE public.survey_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions" ON public.survey_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON public.survey_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed surveys
INSERT INTO public.surveys (title, questions, payout, category) VALUES
  ('Attapoll Survey', 7, 93, 'Market Research'),
  ('AIRTEL', 10, 49, 'Telecom'),
  ('Safaricom Experience', 8, 120, 'Telecom'),
  ('Shopping Habits Kenya', 5, 75, 'Retail'),
  ('M-Pesa Usage Survey', 6, 85, 'Finance'),
  ('Food & Beverage', 12, 150, 'Food'),
  ('Healthcare Access', 9, 200, 'Health'),
  ('Education in Kenya', 7, 110, 'Education'),
  ('Mobile App Usage', 5, 60, 'Technology'),
  ('Banking Preferences', 8, 130, 'Finance'),
  ('Social Media Habits', 6, 70, 'Technology'),
  ('Travel & Tourism', 10, 180, 'Travel'),
  ('Kenyan Politics', 4, 45, 'Politics'),
  ('Entertainment Survey', 5, 55, 'Entertainment'),
  ('Insurance Awareness', 7, 100, 'Finance'),
  ('Agriculture Survey', 9, 140, 'Agriculture'),
  ('Climate Change Kenya', 6, 90, 'Environment'),
  ('Sports & Fitness', 5, 65, 'Sports'),
  ('Fashion & Style', 8, 95, 'Fashion'),
  ('Real Estate Kenya', 10, 250, 'Real Estate');

-- Function to generate referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.referral_code := 'ATT' || UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.generate_referral_code();
