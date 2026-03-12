/*
  # Fix check_and_unblock_client trigger for orders table

  1. Problem
    - The trigger fires on both payments (INSERT) and orders (UPDATE) tables
    - For payments: NEW.order_id exists
    - For orders: NEW.id is the order_id, and NEW.client_id exists directly
    - The function was failing because it assumed order_id field always exists
  
  2. Solution
    - Update function to detect which table triggered it
    - Use appropriate field based on the trigger source
*/

CREATE OR REPLACE FUNCTION check_and_unblock_client()
RETURNS TRIGGER AS $$
DECLARE
  total_debt numeric;
  client_blocked boolean;
  v_client_id uuid;
BEGIN
  -- Determine client_id based on trigger source
  -- If NEW has client_id directly (orders table), use it
  -- If NEW has order_id (payments table), lookup client_id
  IF TG_TABLE_NAME = 'orders' THEN
    v_client_id := NEW.client_id;
  ELSIF TG_TABLE_NAME = 'payments' THEN
    SELECT client_id INTO v_client_id
    FROM orders
    WHERE id = NEW.order_id;
  ELSE
    RETURN NEW;
  END IF;

  IF v_client_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate total debt for client
  SELECT COALESCE(SUM(debt_amount), 0) INTO total_debt
  FROM orders
  WHERE client_id = v_client_id;

  -- Check if client is blocked
  SELECT is_blocked INTO client_blocked
  FROM profiles
  WHERE id = v_client_id;

  -- If debt is zero or negative and client is blocked, unblock them
  IF total_debt <= 0 AND client_blocked = true THEN
    UPDATE profiles
    SET 
      is_blocked = false,
      blocked_until = NULL,
      blocked_reason = NULL,
      unblocked_at = now(),
      unblocked_reason = 'Долг погашен автоматически'
    WHERE id = v_client_id;

    -- Log the unblock action
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, reason)
    VALUES (
      'profiles',
      v_client_id,
      'auto_unblock',
      jsonb_build_object('is_blocked', true),
      jsonb_build_object('is_blocked', false, 'total_debt', total_debt),
      'Автоматическая разблокировка: долг погашен'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
