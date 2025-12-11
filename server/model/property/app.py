from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import os
import sys

app = Flask(__name__)

# Enable CORS
CORS(app)

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PREDICT_SCRIPT = os.path.join(BASE_DIR, 'predict_for_api.py')
# In deployment, use system python
PYTHON_ENV = sys.executable

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Property prediction API is running (Microservice)"
    }), 200

@app.route('/prediction', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        required_fields = ['location', 'bedrooms', 'toilet', 'garage', 'LT', 'LB']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
        
        location = str(data['location'])
        bedrooms = int(data['bedrooms'])
        toilet = int(data['toilet'])
        garage = int(data['garage'])
        LT = float(data['LT'])
        LB = float(data['LB'])
        
        print(f"[API] Prediction request: {location}")
        
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
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode != 0:
            error_msg = result.stderr or "Unknown error occurred"
            print(f"[API ERROR] Script failed: {error_msg}")
            return jsonify({"error": "Prediction failed", "details": error_msg}), 500
        
        try:
            # Try to find JSON in the output from the last line (in case of warnings)
            lines = result.stdout.strip().split('\n')
            last_line = lines[-1] if lines else ""
            prediction_result = json.loads(last_line)
            return jsonify(prediction_result), 200
            
        except json.JSONDecodeError:
            print(f"[API ERROR] Failed to parse output: {result.stdout}")
            return jsonify({"error": "Failed to parse result", "raw": result.stdout}), 500
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)
