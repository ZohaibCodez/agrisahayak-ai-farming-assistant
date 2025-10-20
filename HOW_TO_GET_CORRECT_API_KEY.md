# 🔑 How to Get the CORRECT Google Places API Key

## ⚠️ You might have the WRONG type of API key!

There are **TWO different types** of API keys in Google Cloud:
1. **Firebase API Key** (Browser key) - ❌ Does NOT work for Places API
2. **Google Maps/Places API Key** - ✅ This is what you need!

---

## 📋 Step-by-Step Guide to Get the RIGHT API Key:

### **Step 1: Go to Google Cloud Console**
Open this link:
👉 **https://console.cloud.google.com/google/maps-apis/credentials**

**Important:** Make sure you're in the SAME project as your Firebase app!

---

### **Step 2: Check Your Current API Keys**

You'll see a list of API keys. Look for:

**❌ WRONG KEY (Don't use):**
- Name: "Browser key (auto created by Firebase)"
- Created: Oct 17, 2025
- This is for Firebase, NOT for Google Places!

**✅ RIGHT KEY (Use this):**
- Name: Something like "Maps API key" or "Places API key"
- You might need to CREATE this one if it doesn't exist!

---

### **Step 3: Create a NEW API Key for Google Places**

If you don't have a Maps/Places API key:

1. Click **"+ CREATE CREDENTIALS"** at the top
2. Select **"API key"**
3. A new key will be created (looks like: `AIzaSy...`)
4. Copy it immediately!

---

### **Step 4: Configure the New API Key**

1. Click on your new API key to edit it
2. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check these APIs:
     - ✅ Places API
     - ✅ Places API (New)
     - ✅ Geocoding API
3. Under **"Application restrictions"**:
   - Select **"None"** (for server-side use)
4. Click **"Save"**

---

### **Step 5: Enable the Required APIs**

**Enable Places API:**
1. Go to: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
2. Click **"ENABLE"**
3. Wait 30 seconds

**Enable Geocoding API:**
1. Go to: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
2. Click **"ENABLE"**

---

### **Step 6: Update Your `.env.local` File**

Replace the key with your NEW one:
```bash
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSy[YOUR_NEW_KEY_HERE]
```

---

### **Step 7: Restart Dev Server**
```bash
# Press Ctrl+C to stop
npm run dev
```

---

## 🔍 How to Verify You Have the RIGHT Key:

### **Check in Google Cloud Console:**

1. Go to: https://console.cloud.google.com/google/maps-apis/credentials
2. Click on your API key
3. Scroll down to **"API restrictions"**
4. You should see:
   - ✅ Places API
   - ✅ Geocoding API

If you see **"24 APIs"** or **"Don't restrict key"**, you might have the Firebase key!

---

## 🎯 Quick Test:

After updating the key, you should see in console:
```
🔑 Google Places API Key configured: Yes (AIzaSyCR6W...)
🌍 Searching Google Places for agricultural suppliers...
✅ Google Places found X unique suppliers
```

**No more `REQUEST_DENIED` errors!** ✅

---

## 💡 Still Confused?

### **Use this test URL:**
Replace `YOUR_API_KEY` with your key and open in browser:

```
https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=31.5204,74.3587&radius=50000&keyword=agricultural%20supply&key=YOUR_API_KEY
```

**If you see:**
- ✅ `"status": "OK"` or `"ZERO_RESULTS"` → Key is correct!
- ❌ `"status": "REQUEST_DENIED"` → Wrong key or API not enabled

---

## 📸 Screenshot Guide:

Look for these in Google Cloud Console:

**Correct Location:**
```
Google Cloud Console
  └─ APIs & Services
      └─ Credentials
          └─ CREATE CREDENTIALS > API key
```

**NOT from:**
```
Firebase Console (❌)
  └─ Project Settings
      └─ General
          └─ Web API Key (This is NOT for Places API!)
```

---

## 🆘 Need Help?

If you're still stuck, just:
1. Go to: https://console.cloud.google.com/google/maps-apis/credentials
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. Copy the new key
4. Enable Places API
5. Update `.env.local`
6. Restart dev server

**Done!** 🎉
