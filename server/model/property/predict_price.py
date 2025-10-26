import pandas as pd
import joblib
import sys
import numpy as np
# --- Need these imports for the custom class ---
from sklearn.preprocessing import LabelEncoder
from sklearn.base import BaseEstimator, TransformerMixin

# --- FIX: Define the SafeLabelEncoder class here ---
class SafeLabelEncoder(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.encoder = LabelEncoder()
        self.classes_ = None
        self.unseen_value_ = -1 # Value for unseen labels

    def fit(self, X, y=None):
        if isinstance(X, pd.DataFrame):
            x_series = X.iloc[:, 0]
        else:
            x_series = pd.Series(X)

        X_flat = x_series.astype(str)
        self.encoder.fit(X_flat)
        self.classes_ = set(self.encoder.classes_)
        self.unseen_value_ = len(self.encoder.classes_)
        return self

    def transform(self, X, y=None):
        if isinstance(X, pd.DataFrame):
            x_series = X.iloc[:, 0]
        else:
            x_series = pd.Series(X)

        X_flat = x_series.astype(str)
        transformed = X_flat.map(lambda item: self.encoder.transform([item])[0] if item in self.classes_ else self.unseen_value_)
        output_array = transformed.to_numpy().reshape(-1, 1)
        return output_array
# --- End of SafeLabelEncoder definition ---

# --- Load the Trained Pipeline ---
pipeline_filename = 'property_price_pipeline.joblib'
try:
    pipeline = joblib.load(pipeline_filename)
    print(f"Loaded trained pipeline from '{pipeline_filename}'")
except FileNotFoundError:
    print(f"Error: Trained model file '{pipeline_filename}' not found.")
    print("Please run 'train_model.py' first to train and save the model.")
    sys.exit(1)
except AttributeError as e:
    # Catch the specific error if the class is still missing
    print(f"Error loading the pipeline: {e}")
    print("Ensure the 'SafeLabelEncoder' class definition is present in this script.")
    sys.exit(1)
except Exception as e:
    print(f"Error loading the pipeline: {e}")
    sys.exit(1)

# --- Function to Get Input Data ---
def get_input_data_from_args(args):
    """Parses command line arguments into a DataFrame for prediction."""
    if len(args) != 7: # Script name + 6 features
        print("Error: Incorrect number of arguments.")
        print("Usage: python predict_price.py <location> <bedrooms> <toilets> <garage> <LT> <LB>")
        print('Example: python predict_price.py "Cipayung, Jakarta Timur" 3 2 1 60 70')
        sys.exit(1)

    try:
        data = {
            'location': [args[1]], # Keep location as string
            'bedrooms': [int(args[2])],
            'toilet': [int(args[3])],
            'garage': [int(args[4])],
            'LT': [float(args[5])],
            'LB': [float(args[6])]
        }
        # Ensure correct column order as expected by the pipeline
        ordered_features = ['location', 'bedrooms', 'toilet', 'garage', 'LT', 'LB']
        return pd.DataFrame(data)[ordered_features]
    except ValueError as e:
        print(f"Error converting input arguments to numbers: {e}")
        print("Please ensure bedrooms, toilets, garage, LT, and LB are valid numbers.")
        sys.exit(1)

# --- Main Prediction Logic ---
if __name__ == "__main__":
    new_property_data = get_input_data_from_args(sys.argv)
    print("\nInput Data:")
    print(new_property_data)

    try:
        predicted_price = pipeline.predict(new_property_data)

        if np.isnan(predicted_price[0]) or np.isinf(predicted_price[0]):
             print("\nPrediction resulted in NaN or Infinite value. Cannot provide estimate.")
        else:
             print(f"\n==> Predicted Price: Rp {predicted_price[0]:,.0f} <==")

    except Exception as e:
        print(f"\nAn error occurred during prediction: {e}")
        print("This might happen if the input data format is unexpected or contains values the model cannot handle.")