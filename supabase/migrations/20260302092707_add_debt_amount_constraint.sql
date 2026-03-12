/*
  # Add constraint to prevent negative debt amounts

  1. Changes
    - Add CHECK constraint to ensure debt_amount is never negative
    - This prevents data integrity issues

  2. Security
    - No changes to RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'orders_debt_amount_non_negative'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_debt_amount_non_negative CHECK (debt_amount >= 0);
  END IF;
END $$;
