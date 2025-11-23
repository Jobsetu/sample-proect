-- Supabase Storage Policies for Resume Upload
-- Run this in your Supabase SQL Editor after creating the 'resumes' bucket

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow users to upload their own resumes
-- This policy allows users to upload files to the resumes bucket
-- The file path must start with their user ID
CREATE POLICY "Users can upload their own resumes" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Allow users to view their own resumes
-- This policy allows users to view/download files they uploaded
CREATE POLICY "Users can view their own resumes" ON storage.objects
FOR SELECT USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Allow users to delete their own resumes
-- This policy allows users to delete files they uploaded
CREATE POLICY "Users can delete their own resumes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow users to update their own resumes (optional)
-- This policy allows users to replace files they uploaded
CREATE POLICY "Users can update their own resumes" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
) WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
