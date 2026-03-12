/*
  # Fix check_and_unblock_client trigger function

  1. Problem
    - The trigger was referencing NEW.client_id which doesn't exist in payments table
    - Payments table has order_id, not client_id directly
  
  2. Solution
    - Update the function to get client_id from the orders table via order_id
*/

CREATE OR REPLACE FUNCTION check_and_unblock_client()
RETURNS TRIGGER AS $$
DECLARE
  total_debt numeric;
  client_blocked boolean;
  v_client_id uuid;
BEGIN
  -- Get client_id from the order
  SELECT client_id INTO v_client_id
  FROM orders
  WHERE id = NEW.order_id;

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
      unblocked_reason = 'Долг обнулён автоматически'
    WHERE id = v_client_id;

    -- Log the unblock action
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, reason)
    VALUES (
      'profiles',
      v_client_id,
      'auto_unblock',
      jsonb_build_object('is_blocked', true),
      jsonb_build_object('is_blocked', false, 'total_debt', total_debt),
      'Автоматическая разблокировка: долг обнулён'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
