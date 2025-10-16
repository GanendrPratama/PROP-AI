import os
import pandas as pd

def merge_csv_files(input_folder='output', output_file='properties_combined.csv'):
    """
    Merges all CSV files in a folder into a single CSV file.
    """
    csv_files = [f for f in os.listdir(input_folder) if f.endswith('.csv')]
    
    if not csv_files:
        print(f"No CSV files found in the '{input_folder}' directory.")
        return

    print(f"Found {len(csv_files)} CSV files to merge.")
    
    # Create a list to hold the dataframes
    df_list = []
    for file in csv_files:
        file_path = os.path.join(input_folder, file)
        try:
            df = pd.read_csv(file_path)
            df_list.append(df)
        except pd.errors.EmptyDataError:
            print(f"Warning: '{file}' is empty and will be skipped.")

    if not df_list:
        print("All CSV files were empty. No output file created.")
        return

    # Concatenate all dataframes
    combined_df = pd.concat(df_list, ignore_index=True)
    
    # Save the merged dataframe to a new CSV file
    combined_df.to_csv(output_file, index=False)
    
    print(f"✅ Success! Merged {len(df_list)} files into '{output_file}'.")

if __name__ == "__main__":
    # You need to install pandas for this script: pip install pandas
    merge_csv_files()