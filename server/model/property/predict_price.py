import sys
import pickle
import pandas as pd
import shap
import numpy as np
import os # Added to check for file existence

# --- Helper Function to Load Files ---
def load_model_files(model_path, features_path):
    """Loads the pickled model and features list."""
    if not os.path.exists(model_path):
        print(f"Error: Model file not found at '{model_path}'")
        sys.exit(1)
    if not os.path.exists(features_path):
        print(f"Error: Features file not found at '{features_path}'")
        sys.exit(1)
        
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        print(f"Successfully loaded model from '{model_path}'")

        with open(features_path, 'rb') as f:
            features = pickle.load(f)
        print(f"Successfully loaded features from '{features_path}'")
        
        return model, features
    except Exception as e:
        print(f"Error loading model files: {e}")
        sys.exit(1)

# --- Main Prediction Function ---
def predict_price(model, features, location, bedrooms, toilet, garage, LT, LB):
    """
    Prepares the input data, runs the prediction, and prints the analysis.
    """
    
    # === 1. Prepare Input Data ===
    # This logic is identical to your Streamlit app
    
    # Create the base numeric feature DataFrame
    input_data_numeric = pd.DataFrame({
        'bedrooms': [bedrooms],
        'toilet': [toilet],
        'garage': [garage],
        'LT': [LT],
        'LB': [LB]
    })
    
    # Create the one-hot encoded location DataFrame
    target_location_col = f'loc_{location}'
    all_location_cols = [col for col in features if col.startswith('loc_')]

    if target_location_col not in all_location_cols:
        print(f"\nWarning: Location '{location}' was not found in the model's training data.")
        print("Model will treat this as an unknown location (all location features set to 0).")
        
    location_df = pd.DataFrame({
        col: [1 if col == target_location_col else 0] for col in all_location_cols
    })

    # Combine both dataframes
    input_data = pd.concat([input_data_numeric, location_df], axis=1)

    # Ensure all original features exist and are in the correct order
    for col in features:
        if col not in input_data.columns:
            input_data[col] = 0
    
    input_data = input_data[features] # Final, model-ready DataFrame

    # === 2. Run Prediction ===
    try:
        predicted_price = model.predict(input_data)[0]
        print("\n--- Prediction Result ---")
        print(f"Predicted House Price: Rp {predicted_price:,.0f}")

        # === 3. SHAP Interpretation (Printed to Console) ===
        print("\n--- Feature Influence ---")
        
        # Note: You must have 'shap' installed: pip install shap
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(input_data)

        # Get absolute contribution per feature for this prediction
        abs_contrib = np.abs(shap_values[0])
        contribution_df = pd.DataFrame({
            'Feature': features,
            'Contribution': abs_contrib
        })

        # Combine all 'loc_' columns into a single 'Location' feature
        loc_contrib = contribution_df[contribution_df['Feature'].str.startswith('loc_')]['Contribution'].sum()
        main_contrib = contribution_df[~contribution_df['Feature'].str.startswith('loc_')].copy()
        
        # Use pd.concat to add the combined Location contribution
        loc_df = pd.DataFrame({'Feature': ['Location'], 'Contribution': [loc_contrib]})
        main_contrib = pd.concat([main_contrib, loc_df], ignore_index=True)

        # Normalize to percentage
        total_contribution = main_contrib['Contribution'].sum()
        if total_contribution > 0:
            main_contrib['Percentage'] = (main_contrib['Contribution'] / total_contribution) * 100
        else:
            main_contrib['Percentage'] = 0.0 # Avoid division by zero
            
        main_contrib = main_contrib.sort_values(by='Percentage', ascending=False)

        # Display as a text-based list
        for _, row in main_contrib.iterrows():
            if row['Percentage'] > 0:
                print(f"- {row['Feature']}: {row['Percentage']:.1f}%")

        top_feature = main_contrib.iloc[0]
        print(f"\nMost influential factor: **{top_feature['Feature']}** ({top_feature['Percentage']:.1f}%)")

    except Exception as e:
        print(f"An error occurred during prediction or analysis: {str(e)}")
        sys.exit(1)

# --- Main execution block ---
if __name__ == "__main__":
    # --- 1. Check for correct number of arguments ---
    if len(sys.argv) != 7: # script name + 6 features
        print("Usage: python predict_price_cli.py \"<Location>\" <Bedrooms> <Toilets> <Garage> <LandArea_LT> <BuildingArea_LB>")
        print('Example: python predict_price_cli.py "Cipayung, Jakarta Timur" 3 2 1 60 70')
        print("\nNote: Location must be in quotes if it contains spaces.")
        sys.exit(1)

    # --- 2. Load Model and Features ---
    model_path = 'random_forest_model.sav'
    features_path = 'model_features.sav'
    model, features = load_model_files(model_path, features_path)
    
    # --- 3. Parse Command-Line Arguments ---
    try:
        location = sys.argv[1]
        bedrooms = int(sys.argv[2])
        toilet = int(sys.argv[3])
        garage = int(sys.argv[4])
        LT = float(sys.argv[5])
        LB = float(sys.argv[6])
    except ValueError as e:
        print(f"\nError: Invalid input. Bedrooms, toilets, garage, LT, and LB must be numbers.")
        print(f"Details: {e}")
        sys.exit(1)
        
    # --- 4. Run Prediction ---
    predict_price(model, features, location, bedrooms, toilet, garage, LT, LB)