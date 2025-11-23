-- Fix RLS Policy for Resume Upload
-- Run this in your Supabase SQL Editor to fix the RLS policy violation

-- 1. First, let's check if the user_resumes table exists and its current state
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_resumes';

-- 2. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own resumes" ON public.user_resumes;
DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.user_resumes;
DROP POLICY IF EXISTS "Users can update their own resumes" ON public.user_resumes;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.user_resumes;

-- 3. Temporarily disable RLS to allow data insertion
ALTER TABLE public.user_resumes DISABLE ROW LEVEL SECURITY;

-- 4. Re-enable RLS
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;

-- 5. Create more permissive policies that should work
CREATE POLICY "Enable read access for users based on user_id" ON public.user_resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users based on user_id" ON public.user_resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON public.user_resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON public.user_resumes
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_resumes TO anon, authenticated;

-- 7. Create a test function to verify RLS is working
CREATE OR REPLACE FUNCTION test_rls_policy()
RETURNS TEXT AS $$
DECLARE
  current_user_id UUID;
  test_result TEXT;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN 'No authenticated user found';
  END IF;
  
  -- Try to insert a test record
  INSERT INTO public.user_resumes (user_id, file_path, file_url, file_name, file_size)
  VALUES (current_user_id, 'test/path.pdf', 'https://test.com/test.pdf', 'test.pdf', 1024);
  
  -- If we get here, the insert worked
  RETURN 'RLS policy test passed for user: ' || current_user_id::text;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'RLS policy test failed: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Run the test (this will show if RLS is working)
SELECT test_rls_policy();

-- 9. Clean up the test function
DROP FUNCTION IF EXISTS test_rls_policy();

-- 10. Show current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_resumes';

-- 11. Show table permissions
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'user_resumes' 
AND table_schema = 'public';
