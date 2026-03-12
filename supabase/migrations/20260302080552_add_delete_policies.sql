/*
  # Add delete policies for admins

  1. Changes
    - Add DELETE policy for orders table (admin only)
    - Add DELETE policy for payments table (admin only)
    - Add DELETE policy for order_items table (admin only)
    
  2. Purpose
    - Allow admins to fully delete orders and related data
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Admins can delete orders') THEN
    CREATE POLICY "Admins can delete orders" ON orders FOR DELETE TO authenticated USING (is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Admins can delete payments') THEN
    CREATE POLICY "Admins can delete payments" ON payments FOR DELETE TO authenticated USING (is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Admins can delete order_items') THEN
    CREATE POLICY "Admins can delete order_items" ON order_items FOR DELETE TO authenticated USING (is_admin());
  END IF;
END $$;
