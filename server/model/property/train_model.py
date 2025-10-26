import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error
from sklearn.base import BaseEstimator, TransformerMixin
import numpy as np
import joblib
import sys
import os

# --- Custom SafeLabelEncoder (Handles unseen labels and 2D input) ---
class SafeLabelEncoder(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.encoder = LabelEncoder()
        self.classes_ = None
        self.unseen_value_ = -1 # Value for unseen labels

    def fit(self, X, y=None):
        # --- FIX: Extract the first column if X is 2D ---
        # ColumnTransformer passes X as a DataFrame slice (n_samples, 1)
        if isinstance(X, pd.DataFrame):
            x_series = X.iloc[:, 0] # Select the first (and only) column as a Series
        else:
            x_series = pd.Series(X) # Assume it's already 1D or convert

        X_flat = x_series.astype(str)
        self.encoder.fit(X_flat)
        self.classes_ = set(self.encoder.classes_) # Use set for faster lookups
        self.unseen_value_ = len(self.encoder.classes_) # Assign next integer value
        return self

    def transform(self, X, y=None):
        # --- FIX: Extract the first column if X is 2D ---
        if isinstance(X, pd.DataFrame):
            x_series = X.iloc[:, 0] # Select the first (and only) column as a Series
        else:
            x_series = pd.Series(X) # Assume it's already 1D or convert

        X_flat = x_series.astype(str)

        # Apply transformation using map
        transformed = X_flat.map(lambda item: self.encoder.transform([item])[0] if item in self.classes_ else self.unseen_value_)

        # Convert Series to numpy array and reshape
        output_array = transformed.to_numpy().reshape(-1, 1)
        return output_array

# --- Main Training Logic ---
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("❌ Error: Please provide the input CSV filename as an argument.")
        print("Usage: python train_model.py <your_data.csv>")
        sys.exit(1)

    csv_filename = sys.argv[1]
    if not os.path.exists(csv_filename):
        print(f"❌ Error: File '{csv_filename}' not found.")
        sys.exit(1)

    try:
        df = pd.read_csv(csv_filename)
        print(f"Loaded {len(df)} rows from '{csv_filename}'")
    except Exception as e:
        print(f"❌ Error loading data from '{csv_filename}': {e}")
        sys.exit(1)

    print("Cleaning data...")
    required_cols = ['price', 'location', 'LT', 'LB', 'bedrooms', 'toilet', 'garage']
    if not all(col in df.columns for col in required_cols):
        print(f"❌ Error: Input CSV must contain the columns: {', '.join(required_cols)}")
        sys.exit(1)

    # Convert location to string first before dropping NA based on it
    df['location'] = df['location'].astype(str)
    df.dropna(subset=required_cols, how='any', inplace=True)

    numeric_cols = ['price', 'LT', 'LB', 'bedrooms', 'toilet', 'garage']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    df.dropna(subset=numeric_cols, how='any', inplace=True) # Drop again after coercion
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(subset=numeric_cols, how='any', inplace=True) # Drop again after inf replacement

    # Final type casting
    df['price'] = df['price'].astype(float)
    int_cols = ['bedrooms', 'toilet', 'garage']
    for col in int_cols:
        df[col] = df[col].astype(int)
    float_cols = ['LT', 'LB']
    for col in float_cols:
        df[col] = df[col].astype(float)

    print(f"Data cleaned. Remaining rows for training: {len(df)}")
    if len(df) < 10:
        print("❌ Error: Not enough valid data remaining after cleaning.")
        sys.exit(1)

    features = ['location', 'bedrooms', 'toilet', 'garage', 'LT', 'LB']
    target = 'price'
    X = df[features].copy()
    y = df[target].copy() # y is already a pandas Series (1D)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"Data split: {len(X_train)} training samples, {len(X_test)} testing samples.")

    # Define numeric features for the imputer
    numeric_features = ['bedrooms', 'toilet', 'garage', 'LT', 'LB']

    preprocessor = ColumnTransformer(
        transformers=[
            # Pass the single column name 'location'
            ('loc_encoder', SafeLabelEncoder(), ['location']),
            # Apply imputer only to numeric features
            ('num_imputer', SimpleImputer(strategy='median'), numeric_features)
        ],
        remainder='passthrough'
    )

    rf_model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1, max_depth=10, min_samples_split=5)

    pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                               ('regressor', rf_model)])

    print("Training the Random Forest model...")
    pipeline.fit(X_train, y_train) # Pass y_train as is (it's a Series)
    print("Training complete.")

    print("\nEvaluating model performance on the test set...")
    try:
        predictions = pipeline.predict(X_test)
        predictions = np.nan_to_num(predictions, nan=np.nanmedian(y_train), posinf=np.nanmax(y_train), neginf=np.nanmin(y_train))
        mae = mean_absolute_error(y_test, predictions)
        print(f"Mean Absolute Error on Test Set: Rp {mae:,.0f}")
    except Exception as e:
        print(f"An error occurred during evaluation: {e}")

    pipeline_filename = 'property_price_pipeline.joblib'
    joblib.dump(pipeline, pipeline_filename)
    print(f"\n✅ Trained pipeline saved to '{pipeline_filename}'")