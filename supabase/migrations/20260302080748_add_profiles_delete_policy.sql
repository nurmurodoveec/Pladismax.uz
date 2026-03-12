/*
  # Add delete policy for profiles

  1. Changes
    - Add DELETE policy for profiles table (admin only)
    - Add DELETE policy for audit_log table (admin only)
    
  2. Purpose
    - Allow admins to completely remove clients from database
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can delete profiles') THEN
    CREATE POLICY "Admins can delete profiles" ON profiles FOR DELETE TO authenticated USING (is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_log' AND policyname = 'Admins can delete audit_log') THEN
    CREATE POLICY "Admins can delete audit_log" ON audit_log FOR DELETE TO authenticated USING (is_admin());
  END IF;
END $$;
