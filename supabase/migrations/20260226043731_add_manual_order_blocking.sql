/*
  # Add Manual Order Blocking System

  ## Overview
  Replace automatic debt-based blocking with manual control system.
  Admin can manually block/unblock clients from placing orders with a time limit.

  ## Changes
  1. Add `is_blocked` column to profiles
  2. Add `blocked_until` column to profiles to track block expiration
  3. Add `blocked_reason` column for admin notes
  4. Remove automatic debt blocking logic
  5. Add policy to check if client is blocked

  ## Security
  - Only admins can block/unblock clients
  - Clients can view their own block status
*/

-- Add blocking columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS blocked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

-- Create function to check if client is currently blocked
CREATE OR REPLACE FUNCTION is_client_blocked(client_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  blocked BOOLEAN;
  block_expiry TIMESTAMPTZ;
BEGIN
  SELECT is_blocked, blocked_until INTO blocked, block_expiry
  FROM profiles
  WHERE id = client_id;
  
  -- If not blocked at all, return false
  IF blocked IS FALSE OR blocked IS NULL THEN
    RETURN false;
  END IF;
  
  -- If blocked but no expiry date, return true (permanent block)
  IF block_expiry IS NULL THEN
    RETURN true;
  END IF;
  
  -- If blocked but expiry date has passed, auto-unblock and return false
  IF block_expiry < NOW() THEN
    UPDATE profiles
    SET is_blocked = false,
        blocked_until = NULL,
        blocked_reason = NULL
    WHERE id = client_id;
    RETURN false;
  END IF;
  
  -- Still blocked
  RETURN true;
END;
$$;

-- Create function to block a client
CREATE OR REPLACE FUNCTION block_client(
  client_id UUID,
  days_count INTEGER DEFAULT NULL,
  reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expiry_date TIMESTAMPTZ;
BEGIN
  -- Only admins can block clients
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can block clients';
  END IF;
  
  -- Calculate expiry date if days provided
  IF days_count IS NOT NULL AND days_count > 0 THEN
    expiry_date := NOW() + (days_count || ' days')::INTERVAL;
  END IF;
  
  UPDATE profiles
  SET is_blocked = true,
      blocked_until = expiry_date,
      blocked_reason = reason
  WHERE id = client_id;
END;
$$;

-- Create function to unblock a client
CREATE OR REPLACE FUNCTION unblock_client(client_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only admins can unblock clients
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can unblock clients';
  END IF;
  
  UPDATE profiles
  SET is_blocked = false,
      blocked_until = NULL,
      blocked_reason = NULL
  WHERE id = client_id;
END;
$$;

-- Add constraint to prevent blocked clients from creating orders
CREATE OR REPLACE FUNCTION check_client_not_blocked()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF is_client_blocked(NEW.client_id) THEN
    RAISE EXCEPTION 'Client is blocked from placing orders. Please contact administrator.';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_blocked_client_orders ON orders;

CREATE TRIGGER prevent_blocked_client_orders
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION check_client_not_blocked();
