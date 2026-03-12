/*
  # Fix Inventory Management Trigger Column Names

  1. Changes
    - Fix all references from `quantity` to `stock_quantity` in inventory triggers
    - This resolves the error: column "quantity" does not exist

  2. Details
    - Updates decrease_product_quantity() function
    - Updates update_product_quantity_on_change() function
*/

-- Fix function to decrease product quantity
CREATE OR REPLACE FUNCTION decrease_product_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_quantity INTEGER;
BEGIN
  -- Get current stock quantity
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

  -- Decrease the stock quantity
  UPDATE products
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$;

-- Fix function to restore product quantity
CREATE OR REPLACE FUNCTION restore_product_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Restore the stock quantity
  UPDATE products
  SET stock_quantity = stock_quantity + OLD.quantity
  WHERE id = OLD.product_id;

  RETURN OLD;
END;
$$;

-- Fix function to handle order item quantity updates
CREATE OR REPLACE FUNCTION update_product_quantity_on_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

    -- Update the stock quantity (subtract if increased, add if decreased)
    UPDATE products
    SET stock_quantity = stock_quantity - quantity_diff
    WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$;