# Resume Upload Fix Guide

This guide will help you fix the resume upload functionality with your specific Supabase configuration.

## Issues Identified

1. **Database table missing**: `user_resumes` table doesn't exist
2. **Bucket name mismatch**: Code was looking for `resumes` but your bucket is `resume-storage`
3. **Storage policies**: Need to be configured for the correct bucket

## Step 1: Run the Database Fix Script

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `fix_resume_setup.sql`
4. Click **Run** to execute the script

This will:
- Create the `user_resumes` table
- Set up Row Level Security (RLS) policies
- Configure storage policies for your `resume-storage` bucket

## Step 2: Verify Your Storage Bucket

1. In your Supabase dashboard, go to **Storage**
2. Verify that `resume-storage` bucket exists
3. If it doesn't exist, create it manually:
   - Click **New bucket**
   - Name: `resume-storage`
   - Make it **Public**
   - Set file size limit to 10MB
   - Add allowed MIME types: `application/pdf`, `text/plain`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## Step 3: Test the Application

1. Start your development server: `npm run dev`
2. Navigate to the Resume page
3. Try uploading a test PDF file
4. Check the browser console for any remaining errors

## Your Supabase Configuration

Based on your provided credentials:

- **Project URL**: `https://qcbxdkgbcqxedkyyanby.supabase.co`
- **Storage Bucket**: `resume-storage`
- **Access Key ID**: `2db429662f2a891276750e625a8f3160`
- **Secret Access Key**: `ad8b0249f91414d639b48cb79cecd671f7b6fbb3a27f62facd4d3e7864918fc9`

## Code Changes Made

### 1. Updated Resume Service (`src/lib/resumeService.js`)
- Changed bucket name from `resumes` to `resume-storage`
- Updated all storage operations to use the correct bucket
- Improved error handling and logging

### 2. Updated Supabase Configuration (`src/lib/supabase.js`)
- Added storage URL configuration
- Added global headers for better compatibility

### 3. Created Database Fix Script (`fix_resume_setup.sql`)
- Creates the missing `user_resumes` table
- Sets up proper RLS policies
- Configures storage policies for your bucket

## Troubleshooting

### If you still get "Bucket not found" error:
1. Verify the bucket exists in your Supabase Storage dashboard
2. Check that the bucket name is exactly `resume-storage`
3. Ensure the bucket is public

### If you get "Permission denied" error:
1. Make sure you're logged in to your application
2. Check that the RLS policies were created successfully
3. Verify your user has the correct permissions

### If you get "Table doesn't exist" error:
1. Re-run the `fix_resume_setup.sql` script
2. Check the SQL Editor for any error messages
3. Verify the table was created in the Table Editor

## File Structure

Your uploaded files will be organized as:
```
resume-storage/
├── {user-id-1}/
│   ├── {user-id-1}-{timestamp}.pdf
│   └── {user-id-1}-{timestamp}.doc
├── {user-id-2}/
│   └── {user-id-2}-{timestamp}.pdf
└── ...
```

## Security Features

- **User Isolation**: Each user can only access their own files
- **Row Level Security**: Database queries are automatically filtered by user
- **Storage Policies**: File operations are restricted to the file owner
- **Authentication Required**: All operations require valid user login

## Next Steps

After running the fix script:

1. **Test Upload**: Try uploading a small PDF file
2. **Test Download**: Verify you can download the uploaded file
3. **Test Delete**: Make sure you can delete files
4. **Check Database**: Verify data is being saved to the `user_resumes` table

## Support

If you encounter any issues:

1. Check the browser console for detailed error messages
2. Verify all SQL scripts have been executed successfully
3. Ensure your Supabase project settings are correct
4. Check that your user is properly authenticated

The setup should now work with your existing `resume-storage` bucket and provide a secure, user-isolated file storage system.
