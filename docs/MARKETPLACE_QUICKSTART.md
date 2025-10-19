# 🚀 Marketplace Agent - Quick Start Guide

## ⚡ 3-Minute Setup

### Step 1: Seed Suppliers (One-Time)
Open your terminal and run:
```bash
# Start your dev server
npm run dev

# In another terminal, seed the database
curl -X POST http://localhost:9002/api/marketplace \
  -H "Content-Type: application/json" \
  -d '{"action": "seed"}'
```

Or visit: http://localhost:9002/api/marketplace?action=seed

### Step 2: Test the Search
Navigate to: **Dashboard → Marketplace** or **/marketplace**

You should see:
- ✅ 6 sample suppliers in Lahore/Faisalabad/Multan
- ✅ Distance calculations from your profile location
- ✅ Ratings and verification badges
- ✅ Contact buttons (Call, WhatsApp, Contact Form)

### Step 3: Try Contacting a Supplier
1. Click "Contact Supplier" on any card
2. Select a product (e.g., "Fertilizers")
3. Click "✨ AI Generate" for a message
4. Review the AI-generated message
5. Click "Send via WhatsApp"
6. WhatsApp opens with pre-filled message! 🎉

---

## 🧪 Testing Scenarios

### Test 1: Location-Based Search
```typescript
// Your profile location: Lahore (31.5204, 74.3587)
// Should see:
// - Green Valley Seeds (Lahore) - ~0.5 km
// - Crop Care Solutions (Lahore) - ~1.2 km
// - Fresh Harvest Buyers (Lahore) - ~5.1 km
// - Faisalabad Seed Company (Faisalabad) - ~110 km (if radius > 100)
```

### Test 2: Filter by Type
```typescript
// Filter: "supplier"
// Should show: Green Valley, Crop Care, Faisalabad Seeds
// Filter: "buyer"
// Should show: Fresh Harvest, Punjab Organic
// Filter: "logistics"
// Should show: Agri Transport
```

### Test 3: Contact & AI Message
```typescript
// Input:
// - Product: "Fertilizers"
// - Quantity: "50 bags"
// - Budget: "10,000 PKR"

// AI Generated Message (example):
// "السلام علیکم, I am interested in purchasing Fertilizers. 
//  I need approximately 50 bags within a budget of 10,000 PKR. 
//  Please share your best rates and availability. JazakAllah."
```

---

## 📱 User Flow

```
User visits Marketplace page
    ↓
System gets user's GPS location from profile
    ↓
Searches Firestore for suppliers within 50km radius
    ↓
Calculates distances using Haversine formula
    ↓
Displays suppliers sorted by distance
    ↓
User clicks "Contact Supplier"
    ↓
Dialog opens with product selection
    ↓
User clicks "AI Generate"
    ↓
Gemini creates professional message
    ↓
User clicks "Send via WhatsApp"
    ↓
Contact saved to Firestore
    ↓
WhatsApp opens with pre-filled message
    ↓
✅ Success!
```

---

## 🎯 Key Features Demo

### 1. Smart Distance Calculation
- **Nearby** (Green badge): ≤ 5 km
- **Close** (Blue badge): 5-15 km
- **Far** (Orange badge): > 15 km

### 2. Rating System
- **Excellent** (Green): ≥ 4.5 ⭐
- **Good** (Blue): 4.0-4.4 ⭐
- **Fair** (Yellow): < 4.0 ⭐

### 3. Verification Status
- ✅ **Verified**: Has business license & documents
- ⚠️ **Unverified**: New or pending verification

### 4. AI-Powered Messages
- Professional tone
- Urdu greeting (السلام علیکم)
- Clear requirements
- Polite closing (JazakAllah)

---

## 🐛 Troubleshooting

### Issue: No suppliers showing
**Solution:** 
1. Check if suppliers were seeded: Visit Firebase Console → Firestore → `suppliers` collection
2. Ensure user profile has `lat` and `lon` fields
3. Check browser console for errors

### Issue: WhatsApp link not working
**Solution:**
1. Verify WhatsApp is installed (mobile) or WhatsApp Web is available (desktop)
2. Check supplier has valid phone number in `contact.whatsapp`

### Issue: AI message generation failing
**Solution:**
1. Check GOOGLE_API_KEY is set in environment
2. Verify Gemini API quota hasn't been exceeded
3. Fallback message will be used automatically

---

## 📊 Sample Data

### Suppliers Seeded:
1. **Green Valley Seeds & Fertilizers** (Lahore)
   - Products: Seeds, Fertilizers, Pesticides, Farming Tools
   - Rating: 4.5 ⭐
   - Type: Supplier

2. **Crop Care Solutions** (Lahore)
   - Products: Pesticides, Herbicides, Plant Protection
   - Rating: 4.2 ⭐
   - Type: Supplier

3. **Fresh Harvest Buyers** (Lahore)
   - Products: Wheat, Rice, Cotton, Vegetables
   - Rating: 4.7 ⭐
   - Type: Buyer

4. **Agri Transport Services** (Lahore)
   - Services: Crop Transportation, Cold Storage, Market Delivery
   - Rating: 4.0 ⭐
   - Type: Logistics

5. **Faisalabad Seed Company** (Faisalabad)
   - Products: Cotton Seeds, Wheat Seeds, Fertilizers
   - Rating: 4.6 ⭐
   - Type: Supplier

6. **Punjab Organic Buyers** (Multan)
   - Products: Organic Wheat, Vegetables, Fruits
   - Rating: 4.8 ⭐
   - Type: Buyer

---

## 🎉 Success Checklist

- [ ] Suppliers seeded in Firestore
- [ ] Marketplace page loads without errors
- [ ] Can see supplier cards with distances
- [ ] Filters work correctly
- [ ] Can open contact dialog
- [ ] AI generates professional messages
- [ ] WhatsApp opens with message
- [ ] Contact saved in Firestore
- [ ] Call and WhatsApp buttons work
- [ ] Ratings display correctly

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Verify Firebase configuration
3. Ensure all environment variables are set
4. Review Firestore security rules
5. Check network tab for failed requests

---

**Happy farming! 🌾🚜**

