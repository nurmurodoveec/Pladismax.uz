/*
  # Add phone number field to profiles

  1. Changes
    - Add phone column to profiles table
    - Phone will be used instead of email for display/identification

  2. Format
    - Phone numbers will be stored in Uzbekistan format: +998 XX XXX XX XX
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
END $$;
