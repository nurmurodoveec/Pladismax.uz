/*
  # Allow Trigger Stock Updates

  1. Changes
    - Recreate trigger functions to properly bypass RLS
    - Add explicit permission for stock updates

  2. Details
    - Functions will update stock_quantity field directly
    - RLS is bypassed through proper SECURITY DEFINER setup
*/

-- Recreate the decrease function with proper ownership
CREATE OR REPLACE FUNCTION decrease_product_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_quantity INTEGER;
BEGIN
  -- Get current stock quantity (bypass RLS with SECURITY DEFINER)
  SELECT stock_quantity INTO current_quantity
  FROM products
  WHERE id = NEW.product_id;

  -- Check if sufficient quantity is available
  IF current_quantity IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  IF current_quantity < NEW.quantity THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', current_quantity, NEW.quantity;
  END IF;

  -- Decrease the stock quantity (bypass RLS with SECURITY DEFINER)
  UPDATE products
  SET stock_quantity = stock_quantity - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$;

-- Recreate restore function
CREATE OR REPLACE FUNCTION restore_product_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Restore the stock quantity
  UPDATE products
  SET stock_quantity = stock_quantity + OLD.quantity,
      updated_at = now()
  WHERE id = OLD.product_id;

  RETURN OLD;
END;
$$;

-- Recreate update function
CREATE OR REPLACE FUNCTION update_product_quantity_on_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  quantity_diff INTEGER;
  current_quantity INTEGER;
BEGIN
  -- Calculate the difference
  quantity_diff = NEW.quantity - OLD.quantity;

  IF quantity_diff != 0 THEN
    -- Get current stock quantity
    SELECT stock_quantity INTO current_quantity
    FROM products
    WHERE id = NEW.product_id;

    -- Check if sufficient quantity is available for increase
    IF quantity_diff > 0 AND current_quantity < quantity_diff THEN
      RAISE EXCEPTION 'Insufficient stock. Available: %, Additional needed: %', current_quantity, quantity_diff;
    END IF;

    -- Update the stock quantity
    UPDATE products
    SET stock_quantity = stock_quantity - quantity_diff,
        updated_at = now()
    WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$;