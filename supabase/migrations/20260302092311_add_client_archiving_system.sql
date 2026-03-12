/*
  # Add client archiving system

  1. Changes
    - Add `is_archived` column to profiles table to distinguish archived from deleted clients
    - Add `archived_at` timestamp for tracking when client was archived
    - This allows viewing and restoring archived clients later
  
  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_archived boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'archived_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN archived_at timestamptz;
  END IF;
END $$;
