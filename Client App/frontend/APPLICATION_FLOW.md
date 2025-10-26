# PROP-AI Application Flow

## User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOME PAGE (/)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Hero Section: "Predict Your Property Value with AI"  │  │
│  │  • Features Section: AI-Powered, Instant Results        │  │
│  │  • How It Works: 3-Step Process                         │  │
│  │  • CTA: Get Started Button                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓ Click "Get Started"                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   CALCULATION PAGE (/calculation)               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  INPUT FORM:                                             │  │
│  │  • Location (City/Neighborhood) *                        │  │
│  │  • Land Size (m²) *                                      │  │
│  │  • Building Area (m²) *                                  │  │
│  │  • Bedrooms * | Bathrooms *                              │  │
│  │  • Floors | Garage Capacity                              │  │
│  │  • Year Built                                            │  │
│  │  • Additional Facilities (dynamic list)                  │  │
│  │                                                           │  │
│  │  [Calculate Price Button]                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓ Submit Form                         │
│                           ↓ API Call to Backend                 │
│              POST /api/predict                                  │
│              {location, landSize, rooms, ...}                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    RESULT PAGE (/result)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │      ESTIMATED PROPERTY VALUE                      │  │  │
│  │  │      Rp 1.500.000.000                              │  │  │
│  │  │      Price Range: Rp 1.4M - Rp 1.6M                │  │  │
│  │  │      Confidence: 85% ████████▓▓                    │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌─────────────────────┐  ┌─────────────────────────┐  │  │
│  │  │ PROPERTY DETAILS    │  │  PRICE ANALYSIS         │  │  │
│  │  │ • Location: ...     │  │  • Price/m² (Land)      │  │  │
│  │  │ • Land: 100 m²      │  │  • Price/m² (Building)  │  │  │
│  │  │ • Building: 80 m²   │  │  • Market Comparison    │  │  │
│  │  │ • Bedrooms: 3       │  │                          │  │  │
│  │  │ • Bathrooms: 2      │  │                          │  │  │
│  │  └─────────────────────┘  └─────────────────────────┘  │  │
│  │                                                           │  │
│  │  [Calculate Another Property] [Print Report]             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## API Integration Flow

```
Frontend (Calculation.jsx)
        ↓
    handleSubmit()
        ↓
    Validate Form Data
        ↓
    Prepare propertyData object:
    {
      location: string,
      landSize: number,
      rooms: number,
      bathrooms: number,
      garage: number,
      buildingArea: number,
      floors: number,
      yearBuilt: number,
      otherFacilities: string[]
    }
        ↓
    POST http://localhost:5000/api/predict
        ↓
    Backend Processing
        ↓
    Response:
    {
      estimatedPrice: number,
      priceRange: { min, max },
      confidence: number (0-1),
      marketComparison: string,
      notes: string
    }
        ↓
    navigate('/result', { state: { propertyData, result } })
        ↓
    Result Page Displays Data
```

## Component Structure

```
App.jsx (Routing)
├── Home.jsx
│   ├── NavBar
│   ├── HeroSection
│   ├── FeaturesSection
│   ├── HowItWorksSection
│   ├── CTASection
│   └── Footer
│
├── Calculation.jsx
│   ├── NavBar (imported from NavBar.jsx)
│   ├── CalculationForm
│   │   ├── PlusIcon (for facilities)
│   │   └── Form Fields
│   └── Footer
│
├── Result.jsx
│   ├── NavBar
│   ├── PricePredictionCard (main result)
│   ├── PropertyDetailsCard
│   ├── PriceAnalysisCard
│   └── Footer
│
├── Login.jsx
│   ├── NavBar
│   ├── Login Form
│   └── Footer
│
└── Register.jsx
    ├── NavBar
    ├── Register Form
    └── Footer
```

## Color Scheme Usage

```css
Primary Colors:
├── Navy Blue (#3A3C6C)
│   └── Used in: NavBar, buttons, accents, headings
│
├── Red (#B91C1C)
│   └── Used in: Borders, primary buttons, highlights
│
├── White (#FFFFFF)
│   └── Used in: Cards, form backgrounds, text on dark
│
└── Gray Shades
    └── Used in: Backgrounds, secondary text, borders
```

## Responsive Breakpoints

```
Mobile:       < 768px    (Single column layout)
Tablet:   768px - 1023px (2 columns where applicable)
Desktop:     > 1024px    (Full multi-column layout)
```

## Key Features

✅ **Reusable NavBar** - Single component used across all pages
✅ **Form Validation** - Client-side validation with error messages
✅ **Loading States** - Visual feedback during API calls
✅ **Error Handling** - User-friendly error messages
✅ **Responsive Design** - Works on all device sizes
✅ **Dynamic Facilities** - Add/remove additional facilities
✅ **Price Formatting** - Indonesian Rupiah format (Rp)
✅ **Confidence Indicator** - Visual progress bar
✅ **Print Functionality** - Print results
✅ **Navigation Flow** - Logical user journey

## Next Steps for Development

1. **Backend Integration**
   - Update API endpoints in code
   - Test API connectivity
   - Handle API errors

2. **Authentication**
   - Implement JWT token handling
   - Protected routes
   - User session management

3. **Testing**
   - Unit tests for components
   - Integration tests for API calls
   - E2E tests for user flows

4. **Deployment**
   - Build production version
   - Configure environment variables
   - Deploy to hosting service
