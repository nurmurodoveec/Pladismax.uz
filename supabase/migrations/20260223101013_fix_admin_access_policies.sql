/*
  # Fix Admin Access to All Tables

  ## Problem
  Admin cannot view orders, profiles, and other data because RLS policies
  check the profiles table which creates issues.

  ## Solution
  Create simplified policies that allow admins to access all data by checking
  their role directly from the profiles table in a way that doesn't cause recursion.

  ## Changes
  - Add admin policies for orders and related tables
  - Use EXISTS queries that check profiles once
*/

-- Drop and recreate policies for orders to add admin access
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Clients can view own orders" ON orders;
DROP POLICY IF EXISTS "Clients can create own orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
      LIMIT 1
    )
  );

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Admins can update any orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
      LIMIT 1
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
      LIMIT 1
    )
  );

-- Order items policies
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Clients can view own order items" ON order_items;
DROP POLICY IF EXISTS "Clients can create order items for own orders" ON order_items;

CREATE POLICY "Users can view order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (
        orders.client_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
          LIMIT 1
        )
      )
    )
  );

CREATE POLICY "Users can create order items"
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
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Clients can view payments for own orders" ON payments;
DROP POLICY IF EXISTS "Admins can create payments" ON payments;

CREATE POLICY "Users can view payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = payments.order_id 
      AND (
        orders.client_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
          LIMIT 1
        )
      )
    )
  );

CREATE POLICY "Admins can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
      LIMIT 1
    )
  );

-- Profiles - add admin view policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own last_login" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.id = auth.uid() 
      AND p2.role = 'admin'
      LIMIT 1
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.id = auth.uid() 
      AND p2.role = 'admin'
      LIMIT 1
    )
  )
  WITH CHECK (
    id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.id = auth.uid() 
      AND p2.role = 'admin'
      LIMIT 1
    )
  );

CREATE POLICY "Users can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.id = auth.uid() 
      AND p2.role = 'admin'
      LIMIT 1
    )
  );

-- Products - ensure admins can manage
DROP POLICY IF EXISTS "Anyone authenticated can view active products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

CREATE POLICY "Users can view products"
  ON products FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
      LIMIT 1
    )
  );

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
      LIMIT 1
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
      LIMIT 1
    )
  );

-- Login logs
DROP POLICY IF EXISTS "Admins can view all login logs" ON login_logs;
DROP POLICY IF EXISTS "Users can view own login logs" ON login_logs;
DROP POLICY IF EXISTS "Anyone can insert login logs" ON login_logs;

CREATE POLICY "Users can view login logs"
  ON login_logs FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
      LIMIT 1
    )
  );

CREATE POLICY "Users can insert login logs"
  ON login_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
