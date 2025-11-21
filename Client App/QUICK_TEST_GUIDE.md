# Quick Test Guide - Property Listing Feature

## ✅ What Was Fixed

1. **Images now upload only when clicking "Publish Listing"** (not immediately when selected)
2. **Listings are properly saved to the database**
3. **Listings are visible to all users** (can browse other people's listings)
4. **Images display correctly** in listing cards with fallback for missing images

## 🚀 Quick Start

### Start Backend:
```powershell
cd "Client App\backend"
npm run start
```

### Start Frontend:
```powershell
cd "Client App\frontend"
npm run dev
```

## 🧪 Test Scenarios

### Scenario 1: Create a Listing with Images

1. Login to the app
2. Click "Create Property Listing"
3. Fill in required fields (title, city, land size, building area, bedrooms, bathrooms, contact phone)
4. **Select images** - they will show as previews but NOT upload yet ✅
5. Click **"Publish Listing"**
6. **Now images upload** to Cloudinary and listing is saved ✅
7. You should be redirected to "My Listings"

**Expected Result:** Listing appears with images in "My Listings"

### Scenario 2: View All Listings

1. Go to "Property Marketplace"
2. You should see listings from OTHER users (not your own)
3. Each listing should show:
   - Primary image or placeholder
   - Title, description, price
   - Location, size, specs
   - Contact phone

**Expected Result:** All active listings from database are visible

### Scenario 3: Filter Listings

1. On "Property Marketplace" page
2. Try these filters:
   - Search by keywords
   - Filter by city
   - Set price range
   - Set minimum bedrooms
3. Click "Show My Listings" to toggle your own listings

**Expected Result:** Filters work correctly and update the listing display

### Scenario 4: Delete a Listing

1. Go to "My Listings"
2. Click "Remove" on any listing
3. Confirm deletion

**Expected Result:** Listing is removed from database and UI updates

## 🔍 What to Check

### In Browser Console:
- No errors when creating listing
- API responses show `success: true`
- Images upload successfully to Cloudinary

### In Database:
- New entries in `HousingAds` table
- New entries in `AdImages` table linked to the ad
- All fields populated correctly

### In UI:
- Images show correctly in cards
- Price formatted properly (IDR currency)
- All listing details visible
- Status badge shows "active"

## 🐛 Common Issues & Solutions

### "Publish Listing" button doesn't do anything
- Check: Are all required fields filled?
- Check: Is user logged in? (Look for 'user' in localStorage)
- Check: Browser console for errors

### Images don't show
- Check: Do images exist in database? (Check AdImages table)
- Check: Are Cloudinary URLs valid?
- Check: Network tab for failed image requests

### Listings don't appear
- Check: Backend server running on port 3000?
- Check: Database connection successful?
- Check: API call successful? (Network tab)
- Check: Listings have status='active'?

## 📊 Database Check Queries

```sql
-- Check if listing was created
SELECT * FROM "HousingAds" ORDER BY created_at DESC LIMIT 5;

-- Check if images were linked
SELECT * FROM "AdImages" ORDER BY uploaded_at DESC LIMIT 5;

-- Check listing with images
SELECT h.*, 
       (SELECT json_agg(json_build_object('image_id', image_id, 'cloudinary_url', cloudinary_url, 'is_primary', is_primary))
        FROM "AdImages" WHERE ad_id = h.ad_id) as images
FROM "HousingAds" h
ORDER BY h.created_at DESC
LIMIT 5;
```

## ✨ Success Indicators

- ✅ Image previews show before publishing
- ✅ "Uploading X images..." message appears when publishing
- ✅ Listing appears in "My Listings" after creation
- ✅ Other users can see the listing in "Property Marketplace"
- ✅ Images display in listing cards
- ✅ All listing information is accurate

## 📝 Key Changes Made

1. **CreateListing.jsx**: Images stored locally until publish
2. **housingAd.js**: Response mapping (payload → data)
3. **Listings.jsx**: Enhanced card with image display
4. **MyListings.jsx**: Enhanced card with image display

See `LISTING_INTEGRATION_FIXES.md` for complete technical details.
