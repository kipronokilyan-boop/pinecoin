
-- Survey questions table
CREATE TABLE public.survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL DEFAULT 1,
  options JSONB NOT NULL DEFAULT '["Strongly Agree","Agree","Neutral","Disagree","Strongly Disagree"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view questions" ON public.survey_questions FOR SELECT TO authenticated USING (true);

-- Insert questions for existing surveys
-- We'll use a DO block to insert questions for each survey
DO $$
DECLARE
  s RECORD;
  q_count INTEGER;
  q_texts TEXT[];
BEGIN
  FOR s IN SELECT id, title, questions FROM public.surveys LOOP
    CASE s.title
      WHEN 'Attapoll Survey' THEN
        q_texts := ARRAY['How satisfied are you with online survey platforms?','How often do you take online surveys?','What motivates you to complete surveys?','Do you prefer short or long surveys?','How do you rate mobile survey experiences?','Would you recommend survey apps to friends?','What is your preferred payment method?'];
      WHEN 'AIRTEL' THEN
        q_texts := ARRAY['How satisfied are you with Airtel network coverage?','How would you rate Airtel data speeds?','Do you use Airtel Money services?','How is Airtel customer support?','Would you switch from Airtel to another provider?','How do you rate Airtel bundle offers?','Do you use Airtel for internet at home?','How often do you contact Airtel support?','Rate Airtel app experience','Overall satisfaction with Airtel'];
      WHEN 'Safaricom Experience' THEN
        q_texts := ARRAY['Rate your Safaricom network experience','How often do you use M-Pesa?','Are you satisfied with Safaricom data plans?','How is Safaricom customer service?','Do you use MySafaricom app?','Rate Safaricom internet speeds','How do you rate Safaricom promotions?','Overall Safaricom satisfaction'];
      WHEN 'Shopping Habits Kenya' THEN
        q_texts := ARRAY['How often do you shop online?','Which online platform do you prefer?','Do you compare prices before buying?','How important are discounts to you?','Do you prefer cash on delivery?'];
      WHEN 'M-Pesa Usage Survey' THEN
        q_texts := ARRAY['How often do you use M-Pesa daily?','Do you use M-Pesa for bill payments?','Rate M-Pesa transaction fees','Do you use Fuliza service?','How secure do you feel using M-Pesa?','Would you recommend M-Pesa internationally?'];
      WHEN 'Food & Beverage' THEN
        q_texts := ARRAY['How often do you eat out per week?','Do you use food delivery apps?','What is your preferred cuisine?','How important is food hygiene to you?','Do you check nutritional information?','Rate food delivery services in Kenya','How much do you spend on food weekly?','Do you prefer local or international brands?','How often do you try new restaurants?','Rate the quality of fast food in Kenya','Do you cook at home regularly?','Overall food satisfaction in Kenya'];
      WHEN 'Healthcare Access' THEN
        q_texts := ARRAY['Do you have health insurance?','How often do you visit a doctor?','Rate access to healthcare in your area','Do you use telemedicine services?','How affordable is healthcare for you?','Rate quality of public hospitals','Do you buy medicine online?','How satisfied are you with NHIF?','Rate pharmacy services in your area'];
      WHEN 'Education in Kenya' THEN
        q_texts := ARRAY['Rate the quality of education in Kenya','Do you use online learning platforms?','How affordable is education?','Rate CBC curriculum','Do you think digital learning is effective?','How important is vocational training?','Rate university education quality'];
      WHEN 'Mobile App Usage' THEN
        q_texts := ARRAY['How many apps do you use daily?','Do you pay for app subscriptions?','Rate mobile banking apps','How important is app security?','Do you use social media apps?'];
      WHEN 'Banking Preferences' THEN
        q_texts := ARRAY['Which bank do you primarily use?','Do you prefer mobile banking?','Rate your bank customer service','How often do you visit bank branches?','Do you use digital loans?','Rate online banking security','How satisfied are you with bank charges?','Do you use multiple banks?'];
      WHEN 'Social Media Habits' THEN
        q_texts := ARRAY['Which social media do you use most?','How many hours on social media daily?','Do you follow brands on social media?','Have you purchased via social media?','Rate social media advertising','Do you create content online?'];
      WHEN 'Travel & Tourism' THEN
        q_texts := ARRAY['How often do you travel within Kenya?','Do you use booking apps?','Rate domestic tourism options','How important is travel insurance?','Do you prefer beach or safari?','Rate hotel services in Kenya','How much do you budget for travel?','Do you travel internationally?','Rate SGR service','Rate airport services in Kenya'];
      WHEN 'Kenyan Politics' THEN
        q_texts := ARRAY['Do you follow political news?','How important is voting to you?','Rate government service delivery','Do you trust political leaders?'];
      WHEN 'Entertainment Survey' THEN
        q_texts := ARRAY['What entertainment do you prefer?','Do you subscribe to streaming services?','How often do you go to events?','Rate local music industry','Do you support local artists?'];
      WHEN 'Insurance Awareness' THEN
        q_texts := ARRAY['Do you have life insurance?','How important is insurance to you?','Rate insurance companies in Kenya','Do you understand insurance policies?','Have you ever made an insurance claim?','Do you have car insurance?','Rate insurance agent services'];
      WHEN 'Agriculture Survey' THEN
        q_texts := ARRAY['Are you involved in farming?','Do you use modern farming techniques?','Rate access to farming inputs','How important is food security?','Do you use agricultural apps?','Rate government support for farmers','How do you market farm produce?','Rate access to agricultural loans','Do you practice organic farming?'];
      WHEN 'Climate Change Kenya' THEN
        q_texts := ARRAY['Are you aware of climate change effects?','Do you practice recycling?','Rate air quality in your area','Do you plant trees?','How concerned are you about drought?','Rate government environmental policies'];
      WHEN 'Sports & Fitness' THEN
        q_texts := ARRAY['Do you exercise regularly?','Which sport do you follow?','Do you go to a gym?','Rate sports facilities in your area','Do you participate in marathons?'];
      WHEN 'Fashion & Style' THEN
        q_texts := ARRAY['How often do you buy new clothes?','Do you follow fashion trends?','Where do you prefer shopping for clothes?','How important is brand to you?','Do you buy second-hand clothes?','Rate online fashion stores','Do you support local designers?','How much do you spend on fashion monthly?'];
      WHEN 'Real Estate Kenya' THEN
        q_texts := ARRAY['Do you own or rent your home?','Are you interested in buying property?','Rate real estate prices in Kenya','How important is location to you?','Do you use property listing apps?','Rate mortgage options in Kenya','How do you view real estate as investment?','Rate construction quality in Kenya','Do you prefer apartment or house?','Rate estate management services'];
      ELSE
        q_texts := ARRAY['How would you rate this topic?','What is your overall experience?','Would you recommend to others?','How satisfied are you?','Any additional thoughts?'];
    END CASE;

    FOR q_count IN 1..array_length(q_texts, 1) LOOP
      INSERT INTO public.survey_questions (survey_id, question_text, question_order)
      VALUES (s.id, q_texts[q_count], q_count);
    END LOOP;
  END LOOP;
END $$;

-- Add more surveys
INSERT INTO public.surveys (title, questions, payout, category) VALUES
  ('Uber Kenya Experience', 8, 110, 'Transport'),
  ('Bolt Rider Survey', 6, 80, 'Transport'),
  ('DSTV Satisfaction', 7, 95, 'Entertainment'),
  ('Jumia Shopping', 9, 135, 'E-Commerce'),
  ('Glovo Delivery', 5, 65, 'Delivery'),
  ('KCB Banking', 8, 120, 'Finance'),
  ('Equity Bank', 7, 100, 'Finance'),
  ('Naivas Supermarket', 6, 75, 'Retail'),
  ('Carrefour Kenya', 5, 60, 'Retail'),
  ('Kenya Power Survey', 10, 160, 'Utilities'),
  ('Water Supply Kenya', 6, 85, 'Utilities'),
  ('Showmax Streaming', 5, 70, 'Entertainment'),
  ('YouTube Kenya', 4, 50, 'Technology'),
  ('TikTok Usage', 6, 78, 'Social Media'),
  ('WhatsApp Business', 5, 55, 'Technology'),
  ('Betting Habits', 7, 90, 'Gambling'),
  ('Crypto Awareness', 8, 140, 'Finance'),
  ('Freelancing Kenya', 9, 175, 'Employment'),
  ('Job Market Survey', 10, 200, 'Employment'),
  ('Mental Health Kenya', 7, 115, 'Health');

-- Insert questions for new surveys
DO $$
DECLARE
  s RECORD;
  q_texts TEXT[];
  q_count INTEGER;
BEGIN
  FOR s IN SELECT id, title, questions FROM public.surveys WHERE title IN ('Uber Kenya Experience','Bolt Rider Survey','DSTV Satisfaction','Jumia Shopping','Glovo Delivery','KCB Banking','Equity Bank','Naivas Supermarket','Carrefour Kenya','Kenya Power Survey','Water Supply Kenya','Showmax Streaming','YouTube Kenya','TikTok Usage','WhatsApp Business','Betting Habits','Crypto Awareness','Freelancing Kenya','Job Market Survey','Mental Health Kenya') LOOP
    CASE s.title
      WHEN 'Uber Kenya Experience' THEN
        q_texts := ARRAY['How often do you use Uber?','Rate Uber pricing','How safe do you feel on Uber?','Rate driver professionalism','How is the Uber app experience?','Do you prefer Uber or Bolt?','Rate Uber customer support','Overall Uber satisfaction'];
      WHEN 'Bolt Rider Survey' THEN
        q_texts := ARRAY['How often do you use Bolt?','Rate Bolt pricing','Rate Bolt driver quality','How is the Bolt app?','Do you use Bolt Food?','Overall Bolt satisfaction'];
      WHEN 'DSTV Satisfaction' THEN
        q_texts := ARRAY['Do you subscribe to DSTV?','Rate DSTV content quality','How are DSTV prices?','Do you use DSTV Now app?','Rate DSTV customer service','Would you switch to streaming?','Overall DSTV satisfaction'];
      WHEN 'Jumia Shopping' THEN
        q_texts := ARRAY['How often do you shop on Jumia?','Rate Jumia delivery speed','How are Jumia product prices?','Rate Jumia product quality','Do you trust Jumia sellers?','Rate Jumia return policy','How is the Jumia app?','Do you use JumiaPay?','Overall Jumia satisfaction'];
      WHEN 'Glovo Delivery' THEN
        q_texts := ARRAY['How often do you use Glovo?','Rate Glovo delivery speed','How are Glovo delivery fees?','Rate Glovo app experience','Overall Glovo satisfaction'];
      WHEN 'KCB Banking' THEN
        q_texts := ARRAY['Are you a KCB customer?','Rate KCB mobile banking','How are KCB loan rates?','Rate KCB customer service','Do you use KCB Mpesa?','Rate KCB branch experience','How are KCB charges?','Overall KCB satisfaction'];
      WHEN 'Equity Bank' THEN
        q_texts := ARRAY['Are you an Equity customer?','Rate Equity mobile app','How are Equity loan products?','Rate Equity customer service','Do you use Eazzy Banking?','Rate Equity branch experience','Overall Equity satisfaction'];
      WHEN 'Naivas Supermarket' THEN
        q_texts := ARRAY['How often do you shop at Naivas?','Rate Naivas product variety','How are Naivas prices?','Rate Naivas customer service','Do you use Naivas online?','Overall Naivas satisfaction'];
      WHEN 'Carrefour Kenya' THEN
        q_texts := ARRAY['How often do you shop at Carrefour?','Rate Carrefour pricing','Rate store cleanliness','Do you use Carrefour app?','Overall Carrefour satisfaction'];
      WHEN 'Kenya Power Survey' THEN
        q_texts := ARRAY['Rate power reliability in your area','How often do you experience blackouts?','Rate Kenya Power customer service','Do you use prepaid or postpaid?','How are electricity costs?','Do you use the KPLC app?','Rate response to outage reports','Do you use solar as backup?','How do power cuts affect you?','Overall Kenya Power satisfaction'];
      WHEN 'Water Supply Kenya' THEN
        q_texts := ARRAY['Rate water supply reliability','How is water quality?','Rate water billing accuracy','Do you use water tanks?','How affordable is water?','Overall water service satisfaction'];
      WHEN 'Showmax Streaming' THEN
        q_texts := ARRAY['Do you use Showmax?','Rate Showmax content','How are Showmax prices?','Rate streaming quality','Overall Showmax satisfaction'];
      WHEN 'YouTube Kenya' THEN
        q_texts := ARRAY['How much time on YouTube daily?','Do you subscribe to YouTube Premium?','Do you follow Kenyan YouTubers?','Rate YouTube ad experience'];
      WHEN 'TikTok Usage' THEN
        q_texts := ARRAY['How often do you use TikTok?','Do you create TikTok content?','Rate TikTok algorithm','Do you shop via TikTok?','How does TikTok affect you?','Overall TikTok experience'];
      WHEN 'WhatsApp Business' THEN
        q_texts := ARRAY['Do you use WhatsApp for business?','Rate WhatsApp Business features','Do you buy via WhatsApp?','Rate WhatsApp payment feature','Overall WhatsApp satisfaction'];
      WHEN 'Betting Habits' THEN
        q_texts := ARRAY['Do you participate in sports betting?','How often do you bet?','Which platform do you use?','How much do you spend on betting?','Do you think betting is regulated enough?','Has betting affected you financially?','Rate betting platforms in Kenya'];
      WHEN 'Crypto Awareness' THEN
        q_texts := ARRAY['Do you own cryptocurrency?','Which crypto do you invest in?','Rate crypto awareness in Kenya','Do you trade crypto regularly?','How do you view crypto regulation?','Do you use P2P platforms?','Rate crypto exchange platforms','Overall crypto confidence'];
      WHEN 'Freelancing Kenya' THEN
        q_texts := ARRAY['Do you freelance?','Which platform do you use?','How much do you earn freelancing?','Rate freelancing opportunities','Do you freelance full-time?','How do you receive payments?','Rate client quality','Do you have repeat clients?','Overall freelancing satisfaction'];
      WHEN 'Job Market Survey' THEN
        q_texts := ARRAY['Are you currently employed?','How long did it take to find a job?','Rate the job market in Kenya','Do you use job listing platforms?','How important is remote work?','Rate employer treatment','Do you have side hustles?','How do you view internships?','Rate salary levels in Kenya','Overall job satisfaction'];
      WHEN 'Mental Health Kenya' THEN
        q_texts := ARRAY['How would you rate your mental health?','Do you have access to counseling?','How aware are you of mental health resources?','Does your workplace support mental health?','Rate mental health awareness in Kenya','How do you cope with stress?','Overall mental health support satisfaction'];
      ELSE
        q_texts := ARRAY['How would you rate this?','What is your experience?','Would you recommend?','How satisfied are you?','Any thoughts?'];
    END CASE;

    FOR q_count IN 1..array_length(q_texts, 1) LOOP
      INSERT INTO public.survey_questions (survey_id, question_text, question_order)
      VALUES (s.id, q_texts[q_count], q_count);
    END LOOP;
  END LOOP;
END $$;

-- Update Attapoll Survey title to Pinecoin Survey
UPDATE public.surveys SET title = 'Pinecoin Survey' WHERE title = 'Attapoll Survey';
