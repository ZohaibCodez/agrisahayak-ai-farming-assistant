# Google Places API Setup Guide

## Current Status
⚠️ Your app is currently using **fallback methods** for supplier data:
- OpenStreetMap (free, no API key needed)
- Curated list of 8 real Pakistani agricultural companies

**The app works fine without Google Places API!** But adding it will give you:
- ✅ More real-time supplier data
- ✅ Better accuracy and coverage
- ✅ Phone numbers and websites
- ✅ Business hours and ratings

---

## Step 1: Get Google Places API Key

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a New Project (or select existing)
- Click "Select a Project" at the top
- Click "New Project"
- Name it: `AgriSahayak` or similar
- Click "Create"

### 3. Enable Places API
- In the search bar, type "Places API"
- Click on "Places API"
- Click "Enable"

### 4. Also Enable (for full functionality):
- **Places API (New)** - For detailed place information
- **Geocoding API** - For address lookup
- **Maps JavaScript API** - (optional, if you add maps later)

### 5. Create API Credentials
- Go to "Credentials" in left sidebar
- Click "Create Credentials" → "API Key"
- Your API key will be generated (looks like: `AIzaSyC1234567890abcdefghijklmnopqrs`)
- **IMPORTANT**: Click "Restrict Key" (see Step 2)

---

## Step 2: Secure Your API Key

### 1. Click "Restrict Key" or "Edit" on your API key

### 2. Application Restrictions
Choose: **HTTP referrers (web sites)**

Add these referrers:
```
http://localhost:*
https://localhost:*
http://127.0.0.1:*
https://yourdomain.com/*
https://*.yourdomain.com/*
```

### 3. API Restrictions
Choose: **Restrict key**

Select these APIs:
- ✅ Places API
- ✅ Places API (New)
- ✅ Geocoding API

### 4. Save

---

## Step 3: Add API Key to Your Project

### 1. Open `.env.local` file in your project root
```bash
d:\Vibe Coding Hackathon Project\New folder\studio\.env.local
```

### 2. Replace the placeholder with your real API key:
```bash
# Google Places API for real supplier data
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrs

# Alternative: Bing Maps API (optional)
NEXT_PUBLIC_BING_MAPS_API_KEY=your_bing_maps_api_key_here
```

### 3. Save the file

### 4. Restart your development server:
```cmd
# Stop the current server (Ctrl+C)
npm run dev
```

---

## Step 4: Verify It's Working

### 1. Open your app at: http://localhost:9002/marketplace

### 2. Check the terminal/console
You should see:
```
✓ Compiled /api/suppliers/real in 22.1s
Fetching suppliers from Google Places API...
Found X suppliers from Google Places
```

**Instead of:**
```
Google Places API key not configured. Using fallback method.
```

### 3. The marketplace should show more suppliers with:
- ✅ Phone numbers
- ✅ Websites
- ✅ Business status (OPERATIONAL/CLOSED_TEMPORARILY)
- ✅ More accurate locations

---

## Pricing & Quotas

### Free Tier (Monthly)
Google gives you **$200 free credit** every month, which includes:
- **Nearby Search**: $32 per 1000 requests = ~6,250 free requests/month
- **Place Details**: $17 per 1000 requests = ~11,764 free requests/month

### Current Usage in AgriSahayak
- Each supplier search = 3 Nearby Search requests + 15 Place Details requests
- Estimated cost per search: ~$0.35
- With $200 credit: ~570 searches/month **FREE**

### To Monitor Usage
1. Go to: https://console.cloud.google.com/billing
2. Click "Reports" to see API usage
3. Set up billing alerts if needed

---

## Troubleshooting

### ❌ "This API key is not authorized to use this service"
**Solution**: Make sure you enabled **Places API** in Google Cloud Console

### ❌ "REQUEST_DENIED"
**Solution**: Check API key restrictions - add your domain/localhost to HTTP referrers

### ❌ Still seeing "Using fallback method"
**Solution**: 
1. Make sure `.env.local` has the correct key
2. Restart the dev server (`npm run dev`)
3. Clear browser cache (Ctrl+Shift+R)

### ❌ "OVER_QUERY_LIMIT"
**Solution**: 
1. You've exceeded the free quota
2. Enable billing in Google Cloud Console
3. Or reduce API calls by increasing cache time

---

## Alternative: Keep Using Free Method

**Your app works perfectly without Google Places API!**

Current fallback methods:
1. **OpenStreetMap** - Free, unlimited, no API key
   - Coverage: Global
   - Data: Name, location, address
   
2. **Curated List** - 8 verified Pakistani companies:
   - Engro Fertilizers
   - Fauji Fertilizer Company (FFC)
   - ICI Pakistan
   - Four Brothers Group
   - Sarsabz Fertilizers
   - Premier Seed Company
   - Sayban International
   - Guard Agricultural Services

These provide good coverage for agricultural suppliers in Pakistan!

---

## Next Steps

After setting up Google Places API:

1. **Add Caching** (recommended):
   - Cache supplier data for 1 hour
   - Reduces API calls = saves money
   - Faster response times

2. **Add More Keywords**:
   - Edit `src/lib/external-suppliers.ts`
   - Modify `AGRI_KEYWORDS` array to search for specific suppliers

3. **Increase Search Radius**:
   - Default: 50km
   - Change in: `src/lib/external-suppliers.ts` line 50

4. **Add Supplier Filtering**:
   - Filter by rating (>4.0 stars)
   - Filter by business status (operational only)
   - Filter by type (supplier/buyer/logistics)

---

## Configuration File Location

The API key check happens here:
```
d:\Vibe Coding Hackathon Project\New folder\studio\src\lib\external-suppliers.ts
Line 51-55
```

Current logic:
```typescript
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

if (!apiKey || apiKey === 'your_google_places_api_key_here') {
  console.warn('Google Places API key not configured. Using fallback method.');
  return fetchRealSuppliersFromOpenStreetMap(lat, lng, radiusMeters);
}
```

---

## Need Help?

- Google Cloud Console: https://console.cloud.google.com/
- Places API Docs: https://developers.google.com/maps/documentation/places/web-service
- Pricing Calculator: https://mapsplatform.google.com/pricing/

Good luck! 🚀
