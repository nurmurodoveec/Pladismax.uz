/*
  # Add Inventory Management

  ## Overview
  Automatically decrease product stock quantity when order items are created.
  Prevents overselling by checking available quantity before allowing order creation.

  ## Changes
  1. Create function to update product quantities when order items are added
  2. Create trigger that fires on order_items insert
  3. Add quantity validation to prevent negative stock

  ## Security
  - Function runs with SECURITY DEFINER to update products regardless of RLS
  - Validates that sufficient quantity is available before deducting
  - Raises exception if insufficient stock
*/

-- Function to decrease product quantity when order item is created
CREATE OR REPLACE FUNCTION decrease_product_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_quantity INTEGER;
BEGIN
  -- Get current quantity
  SELECT quantity INTO current_quantity
  FROM products
  WHERE id = NEW.product_id;

  -- Check if sufficient quantity is available
  IF current_quantity IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  IF current_quantity < NEW.quantity THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', current_quantity, NEW.quantity;
  END IF;

  -- Decrease the quantity
  UPDATE products
  SET quantity = quantity - NEW.quantity
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$;

-- Create trigger that fires when order item is inserted
DROP TRIGGER IF EXISTS on_order_item_created ON order_items;

CREATE TRIGGER on_order_item_created
  BEFORE INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION decrease_product_quantity();

-- Function to restore product quantity when order item is deleted
CREATE OR REPLACE FUNCTION restore_product_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Restore the quantity
  UPDATE products
  SET quantity = quantity + OLD.quantity
  WHERE id = OLD.product_id;

  RETURN OLD;
END;
$$;

-- Create trigger for order item deletion
DROP TRIGGER IF EXISTS on_order_item_deleted ON order_items;

CREATE TRIGGER on_order_item_deleted
  AFTER DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION restore_product_quantity();

-- Function to handle order item quantity updates
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
    -- Get current quantity
    SELECT quantity INTO current_quantity
    FROM products
    WHERE id = NEW.product_id;

    -- Check if sufficient quantity is available for increase
    IF quantity_diff > 0 AND current_quantity < quantity_diff THEN
      RAISE EXCEPTION 'Insufficient stock. Available: %, Additional needed: %', current_quantity, quantity_diff;
    END IF;

    -- Update the quantity (subtract if increased, add if decreased)
    UPDATE products
    SET quantity = quantity - quantity_diff
    WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for order item updates
DROP TRIGGER IF EXISTS on_order_item_updated ON order_items;

CREATE TRIGGER on_order_item_updated
  BEFORE UPDATE ON order_items
  FOR EACH ROW
  WHEN (OLD.quantity IS DISTINCT FROM NEW.quantity)
  EXECUTE FUNCTION update_product_quantity_on_change();
