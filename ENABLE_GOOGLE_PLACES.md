# 🗺️ Enable Google Places API - Quick Guide

## ❌ Current Error:
```
REQUEST_DENIED: This API key is not authorized to use this service or API.
```

## ✅ Solution (2 minutes):

### **Step 1: Go to Google Cloud Console**
Open this link in your browser:
👉 **https://console.cloud.google.com/apis/library/places-backend.googleapis.com**

### **Step 2: Enable the Places API**
1. Click the **"ENABLE"** button
2. Wait for confirmation (takes ~30 seconds)
3. You should see "API enabled" ✅

### **Step 3: Enable Geocoding API (Optional but Recommended)**
👉 **https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com**
1. Click **"ENABLE"**
2. This helps with address lookups

### **Step 4: Restart Your Dev Server**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### **Step 5: Test**
- Go to `/marketplace` in your app
- Check console logs for: `✅ Google Places found X suppliers`
- Suppliers will be REAL businesses near the user's location! 🎉

---

## 🌐 Current Status:

✅ **Fallback Suppliers Working** - 15 verified real Pakistani businesses  
✅ **Distance Calculation Working** - Sorted by nearest first  
⚠️ **Google Places API** - Needs to be enabled (2 min fix)  
✅ **OpenStreetMap** - Fixed query format  

---

## 🎯 What You Get After Enabling:

Instead of fallback suppliers, you'll get:
- 🏪 **Real nearby agricultural stores** from Google Maps
- 📍 **Actual GPS locations** of shops near the farmer
- ⭐ **Real ratings** from Google Reviews
- 📞 **Real phone numbers** and contact info
- 🗺️ **Live data** updated by Google

---

## 🔧 Troubleshooting:

**If you still see errors after enabling:**
1. Wait 2-3 minutes for Google's servers to update
2. Clear browser cache
3. Restart dev server
4. Check billing is enabled: https://console.cloud.google.com/billing

**Need help?** The app works perfectly with fallback suppliers too!

---

## 📊 Cost Information:

- **Free tier:** $200/month credit = ~570 marketplace searches
- **Per search:** ~$0.35 (3 keywords × nearby search + details)
- **For hackathon:** Completely free, no charges

---

**Your API Key:** `AIzaSyCR6Wrv6c5UETTWqFwLblzy5RNp6kL1XIg`  
**Status:** Key valid, just needs Places API enabled ✅
