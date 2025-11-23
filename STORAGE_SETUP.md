# Supabase Storage Setup Guide

## Problem
You're getting a "Bucket not found" error when trying to upload resumes. This happens because the `resumes` storage bucket doesn't exist in your Supabase project.

## Solution

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `qcbxdkgbcqxedkyyanby`
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"**
5. Configure the bucket:
   - **Name**: `resumes`
   - **Public**: `No` (we'll use RLS for security)
   - **File size limit**: `50MB` (or your preferred limit)
   - **Allowed MIME types**: `application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Step 2: Set Up Row Level Security (RLS) Policies

After creating the bucket, you need to set up RLS policies to control access:

1. Go to **Storage** → **Policies** in your Supabase dashboard
2. Click **"New Policy"** for the `resumes` bucket
3. Create these policies:

#### Policy 1: Allow users to upload their own resumes
```sql
CREATE POLICY "Users can upload their own resumes" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 2: Allow users to view their own resumes
```sql
CREATE POLICY "Users can view their own resumes" ON storage.objects
FOR SELECT USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 3: Allow users to delete their own resumes
```sql
CREATE POLICY "Users can delete their own resumes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 3: Update Storage Configuration

The current code structure is correct, but let's ensure proper error handling and bucket creation:

1. **File Path Structure**: The code uses `resumes/${userId}-${timestamp}.${extension}` which is correct
2. **Authentication**: Uses Supabase client with user authentication
3. **Error Handling**: Already implemented in the ResumeService

### Step 4: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to the Resume page
3. Try uploading a test resume file
4. Check the Supabase Storage dashboard to see if the file appears

## Alternative: Programmatic Bucket Creation

If you prefer to create the bucket programmatically, you can use the Supabase Management API, but the dashboard method is simpler for this use case.

## Troubleshooting

### Common Issues:

1. **"Bucket not found"**: Make sure the bucket name is exactly `resumes` (case-sensitive)
2. **"Permission denied"**: Check that RLS policies are properly set up
3. **"File too large"**: Adjust the file size limit in bucket settings
4. **"Invalid file type"**: Check the allowed MIME types in bucket settings

### Verification Steps:

1. Check bucket exists: Go to Storage → Buckets in Supabase dashboard
2. Check policies: Go to Storage → Policies and verify the three policies above exist
3. Check file uploads: Look in the `resumes` folder in Storage after uploading

## Security Notes

- The bucket is private (not public) for security
- RLS policies ensure users can only access their own files
- File paths include user ID to prevent unauthorized access
- File type validation is implemented in the frontend code

## Next Steps

After completing this setup:
1. Test resume upload functionality
2. Verify file storage in Supabase dashboard
3. Test resume download/viewing
4. Test resume deletion
