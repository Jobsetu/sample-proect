# S3 Authentication Setup Guide

This guide explains how to set up S3 authentication for Supabase Storage using the session token method as recommended in the [Supabase Storage S3 Authentication documentation](https://supabase.com/docs/guides/storage/s3/authentication?queryGroups=language&language=javascript).

## What We've Implemented

### 1. AWS SDK Installation
```bash
npm install @aws-sdk/client-s3
```

### 2. S3 Service (`src/lib/s3Service.js`)
- Implements session token authentication
- Uses the project reference as access key ID
- Uses the anon key as secret access key
- Uses the user's JWT token as session token
- Provides methods for upload, download, and delete operations

### 3. Updated Resume Service (`src/lib/resumeService.js`)
- Now uses S3Service instead of Supabase Storage API
- Maintains the same interface for the rest of the application
- Handles authentication and error cases properly

## How It Works

### Session Token Authentication
Based on the [Supabase documentation](https://supabase.com/docs/guides/storage/s3/authentication?queryGroups=language&language=javascript), we use:

- **access_key_id**: `project_ref` (extracted from your Supabase URL)
- **secret_access_key**: `anonKey` (your Supabase anon key)
- **session_token**: `valid jwt token` (user's authentication token)

### S3 Client Configuration
```javascript
const client = new S3Client({
  forcePathStyle: true,
  region: 'us-east-1',
  endpoint: `https://${projectRef}.storage.supabase.co/storage/v1/s3`,
  credentials: {
    accessKeyId: projectRef,
    secretAccessKey: anonKey,
    sessionToken: session.access_token,
  },
})
```

## Benefits of This Approach

1. **RLS Compliance**: All operations respect Row Level Security policies
2. **User Scoped**: Files are automatically scoped to the authenticated user
3. **Better Performance**: Uses direct storage hostname for optimal performance
4. **S3 Compatibility**: Can use any S3-compatible service or tools
5. **Secure**: Uses JWT tokens for authentication instead of static keys

## File Organization

Files are organized in your `resume-storage` bucket as:
```
resume-storage/
├── {user-id-1}/
│   ├── {user-id-1}-{timestamp}.pdf
│   └── {user-id-1}-{timestamp}.doc
├── {user-id-2}/
│   └── {user-id-2}-{timestamp}.pdf
└── ...
```

## Testing the Setup

1. **Start your development server**: `npm run dev`
2. **Open browser Developer Tools** (F12) → Console tab
3. **Navigate to the Resume page**
4. **Try uploading a file**
5. **Check console logs** for S3 operations

You should see logs like:
```
Uploading file via S3: { fileName: "...", filePath: "...", userId: "..." }
File uploaded successfully: { ... }
Upload successful: { filePath: "...", publicUrl: "..." }
```

## Troubleshooting

### Common Issues

1. **"No active session found"**
   - Make sure you're logged in to your application
   - Check that the user session is valid

2. **"Access Denied" errors**
   - Verify your Supabase project settings
   - Check that the bucket exists and is accessible
   - Ensure RLS policies are configured correctly

3. **"Invalid credentials" errors**
   - Verify your Supabase URL and anon key
   - Check that the project reference is correct

### Debug Steps

1. **Check Authentication**:
   ```javascript
   const { data: { session } } = await supabase.auth.getSession()
   console.log('Session:', session)
   ```

2. **Verify S3 Client**:
   ```javascript
   const client = await S3Service.getS3Client()
   console.log('S3 Client:', client)
   ```

3. **Test Upload**:
   ```javascript
   const result = await S3Service.uploadFile('resume-storage', 'test/file.pdf', file, 'application/pdf')
   console.log('Upload result:', result)
   ```

## Security Features

- **User Isolation**: Each user can only access their own files
- **JWT Authentication**: Uses secure token-based authentication
- **RLS Policies**: Database operations respect Row Level Security
- **Session Scoped**: All operations are scoped to the current user session

## Performance Optimizations

- **Direct Storage Hostname**: Uses `project-ref.storage.supabase.co` for better performance
- **Proper Caching**: Sets appropriate cache control headers
- **Efficient File Handling**: Streams files directly to S3 without intermediate storage

## Next Steps

After implementing this setup:

1. **Test Upload**: Try uploading different file types (PDF, DOC, DOCX, TXT)
2. **Test Download**: Verify you can access uploaded files via public URLs
3. **Test Delete**: Ensure file deletion works properly
4. **Monitor Performance**: Check upload/download speeds
5. **Check Storage**: Verify files appear in your Supabase Storage dashboard

## Support

If you encounter any issues:

1. Check the browser console for detailed error messages
2. Verify your Supabase project configuration
3. Ensure all dependencies are installed correctly
4. Check the Supabase logs in your dashboard

This S3 implementation provides a robust, secure, and performant solution for file storage that integrates seamlessly with your existing Supabase authentication system.
