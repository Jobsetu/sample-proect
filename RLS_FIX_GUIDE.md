# RLS Policy Fix Guide

This guide will help you fix the "new row violates row-level security policy" error.

## The Problem

The error occurs because:
1. The Row Level Security (RLS) policy is blocking database inserts
2. The user ID might not match between the authenticated user and the database operation
3. The RLS policies might not be configured correctly

## Step 1: Run the RLS Fix Script

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `fix_rls_policy.sql`
4. Click **Run** to execute the script

This script will:
- Drop and recreate the RLS policies
- Temporarily disable/enable RLS to reset it
- Create more permissive policies
- Test the RLS configuration
- Show you the current policy status

## Step 2: Check the Test Results

After running the script, look for the test result output. It should show:
- `RLS policy test passed for user: [your-user-id]` ✅
- Or `RLS policy test failed: [error message]` ❌

## Step 3: Verify Authentication

The updated code now includes better authentication checks:

1. **User Authentication**: Verifies the user is logged in
2. **User ID Matching**: Ensures the database operation uses the correct user ID
3. **Debug Logging**: Shows detailed information in the console

## Step 4: Test the Upload

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Try uploading a resume file
4. Check the console for debug messages

You should see logs like:
```
Saving resume data: { userId: "...", resumeData: {...} }
Authenticated user: { id: "...", email: "..." }
Resume data saved successfully: [...]
```

## Troubleshooting

### If you still get RLS policy violations:

1. **Check User Authentication**:
   - Make sure you're logged in to your application
   - Verify the user session is valid

2. **Check Database Policies**:
   - Run the RLS fix script again
   - Look for any error messages in the SQL Editor

3. **Check User ID Mismatch**:
   - Look at the console logs
   - Verify the user ID being used matches the authenticated user

### If the test function fails:

1. **Check Table Permissions**:
   - Ensure the `user_resumes` table exists
   - Verify RLS is enabled on the table

2. **Check User Permissions**:
   - Make sure your user has the correct role
   - Verify the user is in the `authenticated` role

### Common Error Messages and Solutions:

| Error Message | Solution |
|---------------|----------|
| "User not authenticated" | Log out and log back in |
| "Permission denied" | Run the RLS fix script |
| "Table doesn't exist" | Run the database setup scripts |
| "User ID mismatch" | The code will auto-correct this |

## Code Changes Made

### 1. Enhanced Authentication Checks
- Added `supabase.auth.getUser()` calls
- Verify user is authenticated before database operations
- Use the authenticated user's ID instead of the passed parameter

### 2. Better Error Handling
- More specific error messages
- Console logging for debugging
- Graceful handling of authentication failures

### 3. RLS Policy Reset
- Drop and recreate all policies
- Temporarily disable/enable RLS
- Create more permissive policies

## Testing Checklist

- [ ] RLS fix script executed successfully
- [ ] Test function shows "RLS policy test passed"
- [ ] User is logged in to the application
- [ ] Console shows authentication debug messages
- [ ] Resume upload completes without errors
- [ ] Resume data appears in the database

## Next Steps

After fixing the RLS issue:

1. **Test Upload**: Try uploading a small PDF file
2. **Test Download**: Verify you can view the uploaded file
3. **Test Delete**: Make sure you can delete files
4. **Check Database**: Verify data appears in the `user_resumes` table

## Support

If you're still having issues:

1. Check the browser console for detailed error messages
2. Verify all SQL scripts have been executed successfully
3. Ensure your user is properly authenticated
4. Check the Supabase logs in your dashboard

The RLS policy fix should resolve the "new row violates row-level security policy" error and allow resume uploads to work properly.
