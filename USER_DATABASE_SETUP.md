# User Database Setup Guide for JobYatra

This guide explains how user information is stored in your Supabase database and how to set it up properly.

## Overview

Your JobYatra application stores user information in **two places**:

1. **Supabase Auth (`auth.users`)** - Handles authentication (email, password, etc.)
2. **Custom Tables** - Store additional user profile data, skills, preferences, etc.

## Database Schema

### 1. Users Table (`public.Users`)
Main user profile information:
- `id` (UUID) - References `auth.users(id)`
- `full_name` (TEXT)
- `email` (TEXT, UNIQUE)
- `phone` (TEXT)
- `current_city` (TEXT)
- `education_level` (TEXT)
- `experience_level` (TEXT)
- `linkedin_url` (TEXT)
- `github_url` (TEXT)
- `profile_picture_url` (TEXT)
- `bio` (TEXT)
- `is_verified` (BOOLEAN)
- `is_active` (BOOLEAN)
- `last_login` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 2. User Skills Table (`public.user_skills`)
Many-to-many relationship for user skills:
- `id` (UUID)
- `user_id` (UUID) - References `Users(id)`
- `skill_name` (TEXT)
- `skill_level` (TEXT) - 'beginner', 'intermediate', 'advanced', 'expert'
- `years_experience` (INTEGER)
- `created_at` (TIMESTAMP)

### 3. User Preferences Table (`public.user_preferences`)
Job search preferences:
- `id` (UUID)
- `user_id` (UUID) - References `Users(id)`
- `job_function` (TEXT)
- `job_type` (TEXT) - 'Full-time', 'Part-time', etc.
- `location_preference` (TEXT)
- `open_to_remote` (BOOLEAN)
- `work_authorization_required` (BOOLEAN)
- `salary_expectation_min` (INTEGER)
- `salary_expectation_max` (INTEGER)
- `preferred_company_size` (TEXT)
- `job_search_status` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 4. Additional Tables
- `user_resumes` - Resume files and data
- `user_cover_letters` - Cover letter templates
- `user_applications` - Job application tracking
- `jobs` - Job postings
- `usage_tracker` - API usage tracking

## Setup Instructions

### Step 1: Run the Database Schema
1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `complete_user_schema.sql`
4. Run the script

This will create all necessary tables, indexes, and RLS policies.

### Step 2: Verify Tables Created
Check that these tables exist in your database:
- `public.Users`
- `public.user_skills`
- `public.user_preferences`
- `public.user_resumes`
- `public.user_cover_letters`
- `public.user_applications`
- `public.jobs`
- `public.usage_tracker`

### Step 3: Test User Signup
1. Go to your signup page
2. Fill out the complete signup form
3. Check the database to verify data is stored in all tables

## How User Data is Stored

### During Signup Process:
1. **Auth Creation**: User account created in `auth.users`
2. **Profile Creation**: Basic profile created in `Users` table
3. **Skills Storage**: User skills stored in `user_skills` table
4. **Preferences Storage**: Job preferences stored in `user_preferences` table

### Data Flow:
```
Signup Form → Auth Signup → Database Tables
     ↓              ↓              ↓
Form Data → auth.users → Users + user_skills + user_preferences
```

## Code Structure

### SignupPage.jsx
- Collects user information through multi-step form
- Creates auth user via `supabase.auth.signUp()`
- Stores additional data in custom tables

### AuthContext.jsx
- Handles authentication state
- Updated to also create user profiles during signup

### UserService.js
- New service class for managing user data
- Methods for CRUD operations on user profiles
- Handles skills, preferences, applications, etc.

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Public read access for job listings
- Secure data isolation between users

## Testing Your Setup

1. **Create a test user** through the signup form
2. **Check the database** to verify data appears in all tables
3. **Test profile updates** through the profile page
4. **Verify RLS** by trying to access other users' data (should fail)

## Troubleshooting

### Common Issues:

1. **"Users table doesn't exist"**
   - Run the `complete_user_schema.sql` script

2. **"Permission denied"**
   - Check RLS policies are correctly set up
   - Verify user is authenticated

3. **"Foreign key constraint"**
   - Ensure `auth.users` table exists (created automatically by Supabase)

4. **Data not saving**
   - Check browser console for errors
   - Verify Supabase connection settings

### Debug Steps:
1. Check Supabase logs in the dashboard
2. Use browser dev tools to see network requests
3. Verify table schemas match the code expectations
4. Test with a simple insert query in SQL editor

## Next Steps

After setting up the database:
1. Test the complete signup flow
2. Verify profile editing works
3. Test resume upload functionality
4. Set up job application tracking
5. Implement usage analytics

Your user data is now properly stored and managed in Supabase! 🎉
