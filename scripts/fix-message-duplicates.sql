-- Optional: Clean up any duplicate messages that might have been created
-- This script removes duplicate messages based on content and conversation_id

WITH duplicate_messages AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY conversation_id, role, content 
      ORDER BY created_at DESC
    ) as rn
  FROM public.messages
)
DELETE FROM public.messages 
WHERE id IN (
  SELECT id FROM duplicate_messages WHERE rn > 1
);

-- Add a unique constraint to prevent future duplicates (optional)
-- ALTER TABLE public.messages 
-- ADD CONSTRAINT unique_message_per_conversation 
-- UNIQUE (conversation_id, role, content);
