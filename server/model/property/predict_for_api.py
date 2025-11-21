import sys, pickle, pandas as pd, shap, numpy as np, os, json, warnings

# Suppress warnings
warnings.filterwarnings("ignore")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

# --- NEW: Define absolute paths based on this script's location ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, 'random_forest_model.sav')
FEATURES_PATH = os.path.join(SCRIPT_DIR, 'model_features.sav')
# --- END NEW ---

# --- Helper Function to Load Files (No print statements) ---
def load_model_files(model_path, features_path):
    if not os.path.exists(model_path) or not os.path.exists(features_path):
        # Updated error message to show the full path for easier debugging
        raise FileNotFoundError(f"Model files not found. Check '{model_path}' and '{features_path}'")
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    with open(features_path, 'rb') as f:
        features = pickle.load(f)
    return model, features

# --- Prediction Logic (No changes needed) ---
def get_prediction_and_analysis(model, features, location, bedrooms, toilet, garage, LT, LB):
    input_data_numeric = pd.DataFrame({'bedrooms': [bedrooms], 'toilet': [toilet], 'garage': [garage], 'LT': [LT], 'LB': [LB]})
    target_location_col = f'loc_{location}'
    all_location_cols = [col for col in features if col.startswith('loc_')]
    location_df = pd.DataFrame({col: [1 if col == target_location_col else 0] for col in all_location_cols})
    input_data = pd.concat([input_data_numeric, location_df], axis=1)
    
    for col in features:
        if col not in input_data.columns:
            input_data[col] = 0
    input_data = input_data[features]
    
    predicted_price = model.predict(input_data)[0]
    
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(input_data)
    abs_contrib = np.abs(shap_values[0])
    contribution_df = pd.DataFrame({'Feature': features, 'Contribution': abs_contrib})
    loc_contrib = contribution_df[contribution_df['Feature'].str.startswith('loc_')]['Contribution'].sum()
    main_contrib = contribution_df[~contribution_df['Feature'].str.startswith('loc_')].copy()
    loc_df = pd.DataFrame({'Feature': ['Location'], 'Contribution': [loc_contrib]})
    main_contrib = pd.concat([main_contrib, loc_df], ignore_index=True)
    total_contribution = main_contrib['Contribution'].sum()
    main_contrib['Percentage'] = (main_contrib['Contribution'] / total_contribution) * 100 if total_contribution > 0 else 0.0
    main_contrib = main_contrib.sort_values(by='Percentage', ascending=False)
    
    feature_importance = main_contrib[['Feature', 'Percentage']].to_dict('records')
    top_feature = main_contrib.iloc[0]['Feature'] if not main_contrib.empty else "N/A"

    return {
        "predicted_price_raw": predicted_price,
        "predicted_price_formatted": f"Rp {predicted_price:,.0f}",
        "most_influential_feature": top_feature,
        "feature_importance": feature_importance
    }

if __name__ == "__main__":
    try:
        # --- 1. Parse Arguments ---
        if len(sys.argv) != 7:
            raise ValueError("Incorrect number of arguments. Expected 6.")
        
        location = sys.argv[1]
        bedrooms = int(sys.argv[2])
        toilet = int(sys.argv[3])
        garage = int(sys.argv[4])
        LT = float(sys.argv[5])
        LB = float(sys.argv[6])
        
        # --- 2. Load Model ---
        # MODIFIED: Use the absolute paths defined at the top
        model, features = load_model_files(MODEL_PATH, FEATURES_PATH)
        
        # --- 3. Get Result ---
        result = get_prediction_and_analysis(model, features, location, bedrooms, toilet, garage, LT, LB)
        
        # --- 4. Print FINAL JSON to stdout ---
        print(json.dumps(result))
        
    except Exception as e:
        # --- Print error as JSON to stderr ---
        error_output = {"error": True, "message": str(e)}
        print(json.dumps(error_output), file=sys.stderr)
        sys.exit(1)

