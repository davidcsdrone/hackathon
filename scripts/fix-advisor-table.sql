-- First, let's check if the user_id column exists and fix the table structure
DO $$ 
BEGIN
    -- Check if user_id column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Advisor' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public."Advisor" ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Clear any existing data that might be causing conflicts (optional - remove if you want to keep existing data)
-- DELETE FROM public."Advisor";

-- Make sure the id column is properly set up as auto-increment
ALTER TABLE public."Advisor" ALTER COLUMN id SET DEFAULT nextval('"Advisor_id_seq"'::regclass);

-- Ensure user_id is not nullable for new records
-- (We'll handle this in the application logic instead of making it NOT NULL to avoid issues with existing data)

-- Enable Row Level Security
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_advisor_user_id ON public."Advisor"(user_id);
CREATE INDEX IF NOT EXISTS idx_advisor_created_at ON public."Advisor"(created_at DESC);

-- Grant necessary permissions
GRANT ALL ON public."Advisor" TO authenticated;
GRANT USAGE ON SEQUENCE "Advisor_id_seq" TO authenticated;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Advisor' 
ORDER BY ordinal_position;
