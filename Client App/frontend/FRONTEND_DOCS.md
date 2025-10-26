# PROP-AI Frontend Documentation

## Overview
PROP-AI is a property valuation application powered by AI that helps users predict property values based on various parameters.

## Recent Updates

### 1. NavBar Component (NavBar.jsx)
- **Extracted** from Calculation.jsx to be reusable across all pages
- **Features:**
  - Links to Home, Calculate, Login, and Register pages
  - Responsive design with mobile-friendly navigation
  - Consistent color scheme: Navy Blue (#3A3C6C) and Red (#B91C1C)

### 2. Calculation Page (Calculation.jsx)
- **Enhanced form** with comprehensive property input fields:
  - Location (City/Neighborhood)
  - Land Size (m²)
  - Building Area (m²)
  - Number of Bedrooms
  - Number of Bathrooms
  - Number of Floors
  - Garage Capacity
  - Year Built
  - Additional Facilities (dynamic list)

- **Features:**
  - Form validation
  - Loading state during submission
  - Error handling
  - Dynamic facilities management (add/remove)
  - Submits data to backend API
  - Redirects to Result page with data

### 3. Result Page (Result.jsx)
- **Displays prediction results** including:
  - Estimated property value
  - Price range (min/max)
  - Confidence level with visual progress bar
  - Property details summary
  - Price analysis (price per m² for land and building)
  - Additional facilities display
  - Market comparison (if available)

- **Features:**
  - Print report functionality
  - Calculate another property button
  - Responsive grid layout
  - Color-coded information cards
  - Handles missing data gracefully

### 4. Home Page (Home.jsx)
- **Landing page** with:
  - Hero section with call-to-action
  - Features section (AI-Powered, Instant Results, Market Insights, Detailed Reports)
  - How It Works section (3-step process)
  - Call-to-action section
  - Responsive design

### 5. Login & Register Pages
- **Authentication pages** with:
  - Form validation
  - Error handling
  - Loading states
  - Links to backend API (to be implemented)
  - Option to continue without login

## Color Scheme
- **Primary Navy Blue:** #3A3C6C (navbar, buttons, accents)
- **Primary Red:** #B91C1C (borders, buttons, highlights)
- **Secondary Colors:** 
  - Gray shades for backgrounds and text
  - White for cards and forms

## API Integration

### Backend Endpoint Expected
```
POST http://localhost:5000/api/predict
```

### Request Body Format
```json
{
  "location": "Jakarta Selatan",
  "landSize": 100,
  "rooms": 3,
  "bathrooms": 2,
  "garage": 1,
  "buildingArea": 80,
  "floors": 1,
  "yearBuilt": 2020,
  "otherFacilities": ["Swimming Pool", "Garden"]
}
```

### Expected Response Format
```json
{
  "estimatedPrice": 1500000000,
  "priceRange": {
    "min": 1400000000,
    "max": 1600000000
  },
  "confidence": 0.85,
  "marketComparison": "Above average for the area",
  "notes": "Property value based on current market conditions"
}
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install React Router DOM (if not already installed):
```bash
npm install react-router-dom
```

3. Start development server:
```bash
npm run dev
```

## File Structure
```
frontend/
├── src/
│   ├── NavBar.jsx              # Reusable navigation component
│   ├── App.jsx                 # Main app with routing
│   ├── main.jsx                # Entry point with BrowserRouter
│   └── pages/
│       ├── Home.jsx            # Landing page
│       ├── Calculation.jsx     # Property input form
│       ├── Result.jsx          # Prediction results display
│       ├── Login.jsx           # Login page
│       └── Register.jsx        # Registration page
```

## Routes
- `/` - Home page
- `/calculation` - Property calculation form
- `/result` - Results display (requires state from calculation)
- `/login` - User login
- `/register` - User registration

## Development Notes

### TODO: Backend Integration
1. Update API endpoint URLs in:
   - `Calculation.jsx` (line ~76)
   - `Login.jsx` (line ~41)
   - `Register.jsx` (line ~61)

2. Implement authentication endpoints:
   - POST `/api/auth/login`
   - POST `/api/auth/register`

3. Implement prediction endpoint:
   - POST `/api/predict`

### Features to Add
- [ ] User profile management
- [ ] Save calculation history
- [ ] Export results as PDF
- [ ] Property comparison feature
- [ ] Map integration for location selection
- [ ] Image upload for properties
- [ ] Advanced filters and search

## Responsive Design
All pages are fully responsive and work on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing
When making changes:
1. Maintain consistent color scheme
2. Ensure responsive design
3. Add proper error handling
4. Update this documentation

## License
[Your License Here]
