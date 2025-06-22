-- Add user_id column to Advisor table to associate saved content with users
ALTER TABLE public."Advisor" ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make user_id not nullable (set a default first if there are existing rows)
UPDATE public."Advisor" SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;
-- Note: You may want to delete existing test rows instead: DELETE FROM public."Advisor";

-- Enable Row Level Security if not already enabled
ALTER TABLE public."Advisor" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own saved advice" ON public."Advisor";
DROP POLICY IF EXISTS "Users can create own saved advice" ON public."Advisor";
DROP POLICY IF EXISTS "Users can update own saved advice" ON public."Advisor";
DROP POLICY IF EXISTS "Users can delete own saved advice" ON public."Advisor";

-- Create RLS policies for the Advisor table
CREATE POLICY "Users can view own saved advice" ON public."Advisor" 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved advice" ON public."Advisor" 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved advice" ON public."Advisor" 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved advice" ON public."Advisor" 
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_advisor_user_id ON public."Advisor"(user_id);
CREATE INDEX IF NOT EXISTS idx_advisor_created_at ON public."Advisor"(created_at DESC);

-- Grant necessary permissions
GRANT ALL ON public."Advisor" TO authenticated;
GRANT USAGE ON SEQUENCE "Advisor_id_seq" TO authenticated;
