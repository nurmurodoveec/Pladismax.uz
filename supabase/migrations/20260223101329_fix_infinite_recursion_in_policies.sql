/*
  # Fix Infinite Recursion in RLS Policies

  ## Problem
  Current policies create infinite recursion because checking admin role in profiles
  requires reading from profiles, which triggers the same policy check again.

  ## Solution
  1. Create a security definer function that bypasses RLS to check if user is admin
  2. Use this function in all policies instead of querying profiles directly
  3. Simplify all policies to use this helper function

  ## Changes
  - Create `is_admin()` helper function
  - Recreate all policies using this function to avoid recursion
*/

-- Create helper function to check if current user is admin
-- This function runs with SECURITY DEFINER and bypasses RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Profiles policies - simplified
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

CREATE POLICY "Users can view own profile or admin can view all"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "Users can update own profile or admin can update all"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert own profile or admin can insert all"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid() OR is_admin());

-- Products policies
DROP POLICY IF EXISTS "Users can view products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

CREATE POLICY "Users can view active products or admin can view all"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admins can update any orders" ON orders;

CREATE POLICY "Users can view own orders or admin can view all"
  ON orders FOR SELECT
  TO authenticated
  USING (client_id = auth.uid() OR is_admin());

CREATE POLICY "Clients can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Order items policies
DROP POLICY IF EXISTS "Users can view order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;

CREATE POLICY "Users can view own order items or admin can view all"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.client_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.client_id = auth.uid()
    )
  );

-- Payments policies
DROP POLICY IF EXISTS "Users can view payments" ON payments;
DROP POLICY IF EXISTS "Admins can create payments" ON payments;

CREATE POLICY "Users can view own payments or admin can view all"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND (orders.client_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Admins can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Login logs policies
DROP POLICY IF EXISTS "Users can view login logs" ON login_logs;
DROP POLICY IF EXISTS "Users can insert login logs" ON login_logs;

CREATE POLICY "Users can view own login logs or admin can view all"
  ON login_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert own login logs"
  ON login_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
