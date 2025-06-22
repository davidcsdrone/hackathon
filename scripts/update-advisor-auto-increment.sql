-- Update the Advisor table to use auto-incrementing primary key
-- This script assumes you've already added the id column

-- First, let's check the current structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'Advisor' 
ORDER BY ordinal_position;

-- Make sure the id column is set up properly as auto-increment
-- If you haven't created the sequence yet, create it
CREATE SEQUENCE IF NOT EXISTS "Advisor_id_seq";

-- Set the id column to use the sequence for auto-increment
ALTER TABLE public."Advisor" 
ALTER COLUMN id SET DEFAULT nextval('"Advisor_id_seq"'::regclass);

-- Make sure the sequence is owned by the id column
ALTER SEQUENCE "Advisor_id_seq" OWNED BY public."Advisor".id;

-- Grant permissions on the sequence
GRANT USAGE ON SEQUENCE "Advisor_id_seq" TO authenticated;
GRANT SELECT ON SEQUENCE "Advisor_id_seq" TO authenticated;

-- Verify the table structure
\d public."Advisor"

-- Test insert to make sure auto-increment works
-- (This will be cleaned up by the test endpoint)
-- INSERT INTO public."Advisor" (content_saved, user_id, created_at) 
-- VALUES ('Test auto-increment', '00000000-0000-0000-0000-000000000000', NOW());
