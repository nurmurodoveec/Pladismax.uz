/*
  # Fix Client Privacy and Stock Visibility

  1. Changes
    - Update profiles RLS: clients can only see their own profile
    - Admins can see all profiles
    - Update products RLS: hide out-of-stock products from clients
    - Admins can see all products

  2. Security
    - Clients cannot see other clients' data
    - Clients only see products with stock > 0
    - Admins have full visibility
*/

-- Fix profiles SELECT policy
DROP POLICY IF EXISTS "Users can view own profile or admin can view all" ON profiles;

CREATE POLICY "Users can view own profile or admin can view all"
ON profiles FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR is_admin()
);

-- Fix products SELECT policy to hide out-of-stock items from clients
DROP POLICY IF EXISTS "Users can view active products or admin can view all" ON products;

CREATE POLICY "Clients can view in-stock active products"
ON products FOR SELECT
TO authenticated
USING (
  is_admin() OR (is_active = true AND stock_quantity > 0)
);