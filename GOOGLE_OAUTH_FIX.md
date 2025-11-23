# 🔧 Fix Google OAuth "Provider Not Enabled" Error

## ❌ **Current Error:**
```
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

## ✅ **Solution: Enable Google OAuth in Supabase**

### **Step 1: Access Supabase Dashboard**

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in with your account
   - Select your project: `qcbxdkgbcqxedkyyanby`

### **Step 2: Enable Google Provider**

1. **Navigate to Authentication**
   - In the left sidebar, click **"Authentication"**
   - Click on **"Providers"** tab

2. **Find Google Provider**
   - Look for **"Google"** in the list of providers
   - You should see a toggle switch next to it

3. **Enable Google Provider**
   - Toggle the switch to **"Enabled"** (it should turn green)
   - You'll see configuration fields appear

### **Step 3: Get Google OAuth Credentials**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select Project**
   - Click the project dropdown at the top
   - Either select an existing project or create a new one
   - Name it something like "JobYatra OAuth"

3. **Enable Google+ API**
   - Go to **"APIs & Services"** > **"Library"**
   - Search for **"Google+ API"**
   - Click on it and press **"Enable"**

4. **Create OAuth 2.0 Credentials**
   - Go to **"APIs & Services"** > **"Credentials"**
   - Click **"+ CREATE CREDENTIALS"**
   - Select **"OAuth 2.0 Client ID"**

5. **Configure OAuth Consent Screen**
   - If prompted, configure the OAuth consent screen:
     - Choose **"External"** user type
     - Fill in required fields:
       - App name: `JobYatra`
       - User support email: Your email
       - Developer contact: Your email
     - Click **"Save and Continue"**
     - Skip scopes for now, click **"Save and Continue"**
     - Add your email as a test user
     - Click **"Save and Continue"**

6. **Create OAuth Client**
   - Application type: **"Web application"**
   - Name: `JobYatra Web Client`
   - Authorized redirect URIs: Add this EXACT URL:
     ```
     https://qcbxdkgbcqxedkyyanby.supabase.co/auth/v1/callback
     ```
   - Click **"Create"**

7. **Copy Credentials**
   - Copy the **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
   - Copy the **Client Secret** (looks like: `GOCSPX-abcdefghijklmnop`)

### **Step 4: Configure Supabase**

1. **Back in Supabase Dashboard**
   - Go to **Authentication** > **Providers**
   - Find **Google** (should be enabled now)

2. **Enter Google Credentials**
   - **Client ID**: Paste the Google Client ID
   - **Client Secret**: Paste the Google Client Secret
   - Click **"Save"**

### **Step 5: Update Site URL**

1. **Go to Authentication > URL Configuration**
2. **Set Site URL to:**
   ```
   http://localhost:3000
   ```
3. **Add Redirect URLs:**
   ```
   http://localhost:3000/dashboard
   http://localhost:3000/**
   ```

### **Step 6: Test the Integration**

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test Google OAuth:**
   - Go to `http://localhost:3000`
   - Click **"Sign In"** button
   - Should redirect to Google OAuth
   - After successful auth, redirect to `/dashboard`

## 🚨 **Common Issues & Solutions:**

### **Issue 1: "Invalid redirect URI"**
- **Solution**: Make sure the redirect URI in Google Console is EXACTLY:
  ```
  https://qcbxdkgbcqxedkyyanby.supabase.co/auth/v1/callback
  ```

### **Issue 2: "Access blocked" error**
- **Solution**: Make sure you've added your email as a test user in OAuth consent screen

### **Issue 3: "Provider not enabled" still showing**
- **Solution**: 
  1. Refresh the Supabase dashboard
  2. Check that Google provider toggle is green
  3. Verify credentials are saved correctly

### **Issue 4: "Invalid client" error**
- **Solution**: 
  1. Double-check Client ID and Client Secret
  2. Make sure there are no extra spaces
  3. Regenerate credentials if needed

## 🧪 **Testing Steps:**

1. **Clear browser cache and cookies**
2. **Open incognito/private window**
3. **Go to `http://localhost:3000`**
4. **Click "Sign In"**
5. **Should redirect to Google OAuth**
6. **After successful auth, should redirect to `/dashboard`**

## 📋 **Verification Checklist:**

- [ ] Google provider is enabled in Supabase (toggle is green)
- [ ] Google Client ID is entered correctly
- [ ] Google Client Secret is entered correctly
- [ ] Redirect URI is exactly: `https://qcbxdkgbcqxedkyyanby.supabase.co/auth/v1/callback`
- [ ] Site URL is set to: `http://localhost:3000`
- [ ] Redirect URLs include: `http://localhost:3000/dashboard`
- [ ] Google+ API is enabled in Google Console
- [ ] OAuth consent screen is configured
- [ ] Your email is added as a test user

## 🎯 **Expected Result:**

After completing these steps, when you click "Sign In":
1. You'll be redirected to Google OAuth page
2. You'll see a consent screen asking for permissions
3. After granting permissions, you'll be redirected back to your app
4. You'll land on the dashboard page as an authenticated user

## 📞 **Need Help?**

If you're still getting errors after following these steps:
1. Check the browser console for any JavaScript errors
2. Verify all URLs are correct (no typos)
3. Make sure you're using the correct Supabase project
4. Try regenerating the Google OAuth credentials

The key is making sure the Google provider is actually enabled in Supabase and the redirect URI matches exactly!
