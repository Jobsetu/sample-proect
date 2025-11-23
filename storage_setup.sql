-- Supabase Storage and Resume Management Setup
-- Run this in your Supabase SQL Editor to set up storage and resume functionality

-- 1. Create the resumes storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes', 
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- 2. Create user_resumes table if it doesn't exist
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

-- 3. Enable RLS on user_resumes table
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_resumes
CREATE POLICY "Users can view their own resumes" ON public.user_resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes" ON public.user_resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" ON public.user_resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" ON public.user_resumes
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create storage policies for resumes bucket
CREATE POLICY "Users can upload their own resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own resumes" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'resumes' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own resumes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'resumes' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_resumes TO anon, authenticated;

-- 7. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_resumes_updated_at ON public.user_resumes;
CREATE TRIGGER update_user_resumes_updated_at
  BEFORE UPDATE ON public.user_resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON public.user_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resumes_created_at ON public.user_resumes(created_at);

-- 10. Insert some sample data for testing (optional)
-- You can remove this section if you don't want sample data
INSERT INTO public.user_resumes (user_id, file_path, file_url, file_name, file_size, skills, summary)
SELECT 
  auth.uid(),
  'resumes/sample-resume.pdf',
  'https://example.com/sample-resume.pdf',
  'sample-resume.pdf',
  1024,
  ARRAY['JavaScript', 'React', 'Node.js'],
  'Sample resume for testing purposes'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;
