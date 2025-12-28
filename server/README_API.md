# Property Prediction API Server

Flask-based REST API server for property price prediction with CORS support.

## Prerequisites

- Python 3.8 or higher
- Virtual environment (recommended)

## Installation

### 1. Install Flask and dependencies

```powershell
# Navigate to server directory
cd server

# Install Flask API dependencies
pip install -r requirements.txt
```

### 2. Verify ML model files exist

Make sure these files exist in `server/model/property/`:
- `random_forest_model.sav`
- `model_features.sav`
- `predict_for_api.py`

## Running the Server

### Start the API server

```powershell
# From the server directory
python api_server.py
```

The server will start on `http://localhost:8000`

You should see:
```
Property Prediction API Server
============================================================
Python executable: C:\...\python.exe
Prediction script: C:\...\predict_for_api.py
Script exists: True
------------------------------------------------------------
Starting server on http://localhost:8000
Endpoints:
  GET  /health      - Health check
  POST /prediction  - Property prediction
============================================================
```

## API Endpoints

### 1. Health Check
```
GET http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "Property prediction API is running"
}
```

### 2. Property Prediction
```
POST http://localhost:8000/prediction
Content-Type: application/json
```

**Request Body:**
```json
{
  "location": "Beji, Depok",
  "bedrooms": 3,
  "toilet": 2,
  "garage": 1,
  "LT": 100,
  "LB": 120
}
```

**Response:**
```json
{
  "predicted_price_raw": 1856708391.4431982,
  "predicted_price_formatted": "Rp 1,856,708,391",
  "most_influential_feature": "Location",
  "feature_importance": [
    {
      "Feature": "Location",
      "Percentage": 24.802021354749375
    },
    {
      "Feature": "LB",
      "Percentage": 18.744256854235626
    },
    ...
  ]
}
```

## CORS Configuration

The server is configured with CORS enabled for all origins (`*`). This allows the frontend to call the API from any domain.

**For production**, update the CORS configuration in `api_server.py`:
```python
CORS(app, resources={
    r"/*": {
        "origins": "https://your-frontend-domain.com",  # Replace with actual domain
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})
```

## Testing

### Using curl (PowerShell)
```powershell
# Health check
curl http://localhost:8000/health

# Prediction
curl -X POST http://localhost:8000/prediction `
  -H "Content-Type: application/json" `
  -d '{\"location\":\"Beji, Depok\",\"bedrooms\":3,\"toilet\":2,\"garage\":1,\"LT\":100,\"LB\":120}'
```

### Using Postman
1. Create a POST request to `http://localhost:8000/prediction`
2. Set header: `Content-Type: application/json`
3. Add JSON body with required fields
4. Send request

## Troubleshooting

### CORS Errors
If you still see CORS errors:
1. Make sure the server is running on port 8000
2. Check that `flask-cors` is installed: `pip install flask-cors`
3. Verify the frontend is calling `http://localhost:8000/prediction` (not `/predict`)

### Module Not Found
If you see "No module named flask" or "flask_cors":
```powershell
pip install flask flask-cors
```

### Prediction Script Fails
1. Check that the virtual environment has all ML dependencies:
   ```powershell
   cd model/property
   .\env\Scripts\activate
   pip install pandas numpy scikit-learn shap
   ```

2. Test the prediction script directly:
   ```powershell
   python model/property/predict_for_api.py "Beji, Depok" 3 2 1 100 120
   ```

### Port Already in Use
If port 8000 is already in use, either:
- Stop the other process using port 8000
- Or change the port in `api_server.py`:
  ```python
  app.run(host='0.0.0.0', port=8001, debug=True)
  ```
  And update the frontend to call `http://localhost:8001/prediction`

## Development

### Enable Debug Mode
Debug mode is enabled by default in `api_server.py`. Logs will show:
- Incoming requests
- Prediction parameters
- Command execution
- Results or errors

### Add Logging
The server logs all requests and errors to the console. Check the terminal where you started `api_server.py` for detailed logs.

## Integration with Frontend

The frontend in `Client App/frontend/src/services/predict.js` is already configured to call this API at `http://localhost:8000/prediction`.

Make sure:
1. The API server is running (`python api_server.py`)
2. The frontend dev server is running (`npm run dev`)
3. Both are accessible from the browser

The prediction service will automatically:
- Transform frontend payload to API format
- Send POST request with proper headers
- Wait for response (30 second timeout)
- Transform API response to frontend format
- Display results in the Result page
