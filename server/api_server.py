from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import os
import sys

app = Flask(__name__)

# Enable CORS for all routes - allows frontend to call this API
CORS(app, resources={
    r"/*": {
        "origins": "*",  # In production, replace with your frontend URL
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PREDICT_SCRIPT = os.path.join(BASE_DIR, 'model', 'property', 'predict_for_api.py')
PYTHON_ENV = os.path.join(BASE_DIR, 'model', 'property', 'env', 'Scripts', 'python.exe')

# Check if virtual environment Python exists, otherwise use system Python
if not os.path.exists(PYTHON_ENV):
    PYTHON_ENV = sys.executable
    print(f"[WARNING] Virtual environment Python not found, using system Python: {PYTHON_ENV}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "Property prediction API is running"
    }), 200

@app.route('/prediction', methods=['POST', 'OPTIONS'])
def predict():
    """
    Prediction endpoint
    Accepts JSON: { "location", "bedrooms", "toilet", "garage", "LT", "LB" }
    Returns JSON: { "predicted_price_raw", "predicted_price_formatted", "most_influential_feature", "feature_importance" }
    """
    
    # Handle preflight OPTIONS request for CORS
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Parse request body
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        # Validate required fields
        required_fields = ['location', 'bedrooms', 'toilet', 'garage', 'LT', 'LB']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
        
        # Extract parameters
        location = str(data['location'])
        bedrooms = int(data['bedrooms'])
        toilet = int(data['toilet'])
        garage = int(data['garage'])
        LT = float(data['LT'])
        LB = float(data['LB'])
        
        print(f"[API] Prediction request: {location}, beds={bedrooms}, toilet={toilet}, garage={garage}, LT={LT}, LB={LB}")
        
        # Call Python prediction script
        cmd = [
            PYTHON_ENV,
            PREDICT_SCRIPT,
            location,
            str(bedrooms),
            str(toilet),
            str(garage),
            str(LT),
            str(LB)
        ]
        
        print(f"[API] Running command: {' '.join(cmd)}")
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30  # 30 second timeout
        )
        
        # Check if prediction script failed
        if result.returncode != 0:
            error_msg = result.stderr or "Unknown error occurred"
            print(f"[API ERROR] Prediction script failed: {error_msg}")
            return jsonify({
                "error": "Prediction failed",
                "details": error_msg
            }), 500
        
        # Parse JSON output from prediction script
        try:
            prediction_result = json.loads(result.stdout)
            print(f"[API] Prediction successful: {prediction_result.get('predicted_price_formatted')}")
            return jsonify(prediction_result), 200
            
        except json.JSONDecodeError as e:
            print(f"[API ERROR] Failed to parse prediction output: {result.stdout}")
            return jsonify({
                "error": "Failed to parse prediction result",
                "details": str(e),
                "raw_output": result.stdout
            }), 500
    
    except subprocess.TimeoutExpired:
        print("[API ERROR] Prediction script timeout")
        return jsonify({
            "error": "Prediction timeout",
            "message": "The prediction took too long to complete"
        }), 504
    
    except ValueError as e:
        print(f"[API ERROR] Invalid input: {str(e)}")
        return jsonify({
            "error": "Invalid input",
            "message": str(e)
        }), 400
    
    except Exception as e:
        print(f"[API ERROR] Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "error": "Endpoint not found",
        "message": "The requested endpoint does not exist"
    }), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({
        "error": "Internal server error",
        "message": str(e)
    }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("Property Prediction API Server")
    print("=" * 60)
    print(f"Python executable: {PYTHON_ENV}")
    print(f"Prediction script: {PREDICT_SCRIPT}")
    print(f"Script exists: {os.path.exists(PREDICT_SCRIPT)}")
    print("-" * 60)
    print("Starting server on http://localhost:8000")
    print("Endpoints:")
    print("  GET  /health      - Health check")
    print("  POST /prediction  - Property prediction")
    print("=" * 60)
    
    # Run Flask app on port 8000
    app.run(
        host='0.0.0.0',
        port=8000,
        debug=True,
        use_reloader=False  # Disable reloader to avoid double startup
    )
