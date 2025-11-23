-- Fix Resume Setup - Run this in your Supabase SQL Editor
-- This script fixes the database table and storage bucket issues

-- 1. Create user_resumes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  skills TEXT[],
  experience JSONB,
  education JSONB,
  summary TEXT,
  raw_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on user_resumes table
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own resumes" ON public.user_resumes;
DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.user_resumes;
DROP POLICY IF EXISTS "Users can update their own resumes" ON public.user_resumes;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.user_resumes;

-- 4. Create RLS policies for user_resumes
CREATE POLICY "Users can view their own resumes" ON public.user_resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes" ON public.user_resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" ON public.user_resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" ON public.user_resumes
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_resumes TO anon, authenticated;

-- 6. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_resumes_updated_at ON public.user_resumes;
CREATE TRIGGER update_user_resumes_updated_at
  BEFORE UPDATE ON public.user_resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON public.user_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resumes_created_at ON public.user_resumes(created_at);

-- 9. Check if the resume-storage bucket exists and create storage policies
-- Note: The bucket should already exist in your Supabase project
-- If it doesn't exist, you'll need to create it manually in the Storage section

-- Create storage policies for resume-storage bucket
CREATE POLICY "Users can upload their own resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resume-storage' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resume-storage' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own resumes" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'resume-storage' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own resumes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'resume-storage' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 10. Verify the setup
SELECT 'user_resumes table created successfully' as status;
SELECT 'Storage policies created for resume-storage bucket' as status;
