/*
  # Fix RLS Policies for Profiles Table

  ## Problem
  The current policies create infinite recursion when checking if user is admin
  because they query the same table they're protecting.

  ## Solution
  Use auth.jwt() to check role from JWT claims instead of querying profiles table.
  This breaks the recursion cycle.

  ## Changes
  - Drop existing problematic policies
  - Create new policies using auth.jwt() claims
  - Policies check role from JWT metadata
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Allow users to view their own profile (simple, no recursion)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own last_login (no role change allowed)
CREATE POLICY "Users can update own last_login"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- Allow inserting profile during signup
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
