
-- Add nickname column with unique constraint
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nickname text;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_nickname_unique UNIQUE (nickname);

-- Create index for faster nickname lookups
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON public.profiles (nickname);
