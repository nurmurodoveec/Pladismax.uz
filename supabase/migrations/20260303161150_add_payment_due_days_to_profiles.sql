/*
  # Add payment due days to profiles

  1. Changes
    - Add `payment_due_days` column to profiles table
    - Default value is 15 days
    - This allows admin to set custom payment due period per client

  2. Notes
    - When creating orders, this value will be used instead of fixed 15 days
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'payment_due_days'
  ) THEN
    ALTER TABLE profiles ADD COLUMN payment_due_days integer DEFAULT 15;
  END IF;
END $$;
