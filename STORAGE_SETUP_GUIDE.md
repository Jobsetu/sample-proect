# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for resume uploads in your JobYatra application.

## Prerequisites

- Supabase project created
- Database tables already set up (from previous setup scripts)
- Admin access to your Supabase dashboard

## Step 1: Run the Storage Setup Script

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `storage_setup.sql` into a new query
4. Run the script

This script will:
- Create the `resumes` storage bucket
- Set up the `user_resumes` table
- Configure Row Level Security (RLS) policies
- Set up storage policies for file access
- Create necessary indexes and triggers

## Step 2: Verify Storage Bucket Creation

1. In your Supabase dashboard, go to **Storage** in the left sidebar
2. You should see a `resumes` bucket listed
3. Click on the bucket to verify it's properly configured

## Step 3: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to the Resume page in your application
3. Try uploading a test resume file (PDF, DOC, DOCX, or TXT)
4. Check the browser console for any errors

## Step 4: Troubleshooting

### Common Issues and Solutions

#### "Bucket not found" Error
- **Cause**: The storage bucket wasn't created properly
- **Solution**: Re-run the `storage_setup.sql` script in your Supabase SQL Editor

#### "Permission denied" Error
- **Cause**: RLS policies are blocking access
- **Solution**: Ensure you're logged in and the user has proper authentication

#### "File too large" Error
- **Cause**: File exceeds the 10MB limit
- **Solution**: Compress or reduce the file size

#### "Invalid file type" Error
- **Cause**: File type not in allowed MIME types
- **Solution**: Use PDF, DOC, DOCX, or TXT files only

### Storage Configuration Details

The setup uses the following configuration:

- **Bucket Name**: `resumes`
- **File Size Limit**: 10MB
- **Allowed MIME Types**: 
  - `application/pdf`
  - `text/plain`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Public Access**: Yes (for viewing uploaded resumes)
- **File Organization**: Files are stored in user-specific folders (`{userId}/{filename}`)

### Security Features

- **Row Level Security**: Users can only access their own resumes
- **Storage Policies**: Users can only upload, view, update, and delete their own files
- **Authentication Required**: All operations require valid user authentication

## Step 5: Production Considerations

For production deployment:

1. **Environment Variables**: Store your Supabase credentials in environment variables
2. **File Validation**: Consider adding server-side file validation
3. **Virus Scanning**: Implement virus scanning for uploaded files
4. **Backup Strategy**: Set up regular backups of your storage bucket
5. **Monitoring**: Monitor storage usage and set up alerts

## API Reference

### Storage Endpoints

Based on the [Supabase Storage S3 Authentication documentation](https://supabase.com/docs/guides/storage/s3/authentication), your storage is accessible at:

- **Direct Storage URL**: `https://qcbxdkgbcqxedkyyanby.storage.supabase.co`
- **API Endpoint**: `https://qcbxdkgbcqxedkyyanby.supabase.co/storage/v1/s3`

### Authentication Methods

1. **Session Token** (Recommended for client-side):
   - Uses user JWT token for authentication
   - Respects RLS policies
   - Limited access scoped to authenticated user

2. **S3 Access Keys** (Server-side only):
   - Full access to all S3 operations
   - Bypasses RLS policies
   - Should only be used on the server

## Support

If you encounter any issues:

1. Check the browser console for detailed error messages
2. Verify your Supabase project settings
3. Ensure all SQL scripts have been run successfully
4. Check that your user is properly authenticated

The setup follows Supabase best practices and should work seamlessly with your existing authentication system.
