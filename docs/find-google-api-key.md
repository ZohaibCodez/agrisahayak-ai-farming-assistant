# How to Find Your Google Places API Key

Since you've already enabled Places API in your project, here's how to find or create the API key:

## Step 1: Go to Google Cloud Console

1. Visit: **https://console.cloud.google.com/**
2. Sign in with your Google account

## Step 2: Select Your Project

1. At the top of the page, click the project dropdown (next to "Google Cloud")
2. Select your existing project where you enabled Places API

## Step 3: Navigate to API Credentials

### Option A: Direct Link
Visit: **https://console.cloud.google.com/apis/credentials**

### Option B: Use Navigation Menu
1. Click the hamburger menu (☰) on the top left
2. Hover over **"APIs & Services"**
3. Click **"Credentials"**

## Step 4: Find or Create API Key

### If you already have an API key:
1. Look under **"API Keys"** section
2. You'll see a list of your API keys
3. Click the **key name** to see the full key
4. Or click the **copy icon** (📋) to copy it directly

### If you need to create a new API key:
1. Click **"+ CREATE CREDENTIALS"** at the top
2. Select **"API key"**
3. Your API key will be created instantly!
4. **Copy the API key** (it looks like: `AIzaSyC1234567890abcdefghijklmnopqrs`)

## Step 5: Copy Your API Key

Your API key will look something like this:
```
AIzaSyC1234567890abcdefghijklmnopqrs
```

**IMPORTANT**: It MUST start with `AIza` to be a valid Google API key!

## Step 6: Add It to Your Project

1. Open your project folder:
   ```
   d:\Vibe Coding Hackathon Project\New folder\studio
   ```

2. Open the file: **`.env.local`**

3. Find this line:
   ```bash
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
   ```

4. Replace `your_google_places_api_key_here` with your actual API key:
   ```bash
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrs
   ```

5. **Save the file**

## Step 7: Restart Your Development Server

1. Stop the current server (press **Ctrl+C** in terminal)
2. Start it again:
   ```cmd
   npm run dev
   ```

## Step 8: Verify It's Working

1. Open your app: **http://localhost:9002/marketplace**
2. Check the terminal - you should see:
   ```
   Fetching suppliers from Google Places API...
   Found X suppliers from Google Places
   ```
3. **NOT**: "Google Places API key not configured. Using fallback method."

## Troubleshooting

### ❌ "This API project is not authorized to use this API"
**Solution**: 
1. Go to: https://console.cloud.google.com/apis/library
2. Search for **"Places API"**
3. Click on it and make sure it says **"API Enabled"**
4. If not, click **"Enable"**

### ❌ "REQUEST_DENIED" error
**Solution**: The API key might have restrictions
1. Go to Credentials page
2. Click on your API key
3. Under **"Application restrictions"**, select **"None"** (for testing)
4. Or add **HTTP referrers**: `http://localhost:*` and `https://localhost:*`
5. Under **"API restrictions"**, make sure **"Places API"** is selected
6. Click **"Save"**

### ❌ Still seeing "Using fallback method"
**Checklist**:
- [ ] API key starts with `AIza`
- [ ] No extra spaces before/after the key in `.env.local`
- [ ] Restarted dev server after editing `.env.local`
- [ ] Places API is enabled in Google Cloud Console
- [ ] API key has no restrictions (or correct restrictions)

## Quick Commands

### Check if your API key is configured:
```cmd
.\check-api-config.bat
```

### View your .env.local file:
```cmd
type .env.local
```

### Test if Places API is enabled (PowerShell):
```powershell
$apiKey = "YOUR_API_KEY_HERE"
$lat = 31.5204
$lng = 74.3587
$url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=$lat,$lng&radius=50000&keyword=agricultural+supply&key=$apiKey"
Invoke-RestMethod -Uri $url
```

If you see `"status": "OK"`, it's working! ✅

---

## Need Help?

If you're still having trouble:
1. Make sure you're logged into the correct Google account
2. Check if billing is enabled (required even for free tier)
3. Make sure your Google Cloud project is the correct one
4. Try creating a fresh API key and use that instead

**Direct Links**:
- Credentials: https://console.cloud.google.com/apis/credentials
- Enable Places API: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
- Your Projects: https://console.cloud.google.com/projectselector2

Good luck! 🚀
