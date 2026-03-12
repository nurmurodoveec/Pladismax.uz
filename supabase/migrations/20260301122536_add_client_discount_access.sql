/*
  # Add discount access flag for clients

  1. Changes
    - Add `can_see_discounts` column to profiles table
    - Default to true (all clients can see discounts by default)

  2. Purpose
    - Allow admins to control which clients can see promotional prices
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'can_see_discounts'
  ) THEN
    ALTER TABLE profiles ADD COLUMN can_see_discounts boolean DEFAULT true;
  END IF;
END $$;
