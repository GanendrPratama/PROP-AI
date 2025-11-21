import os
import pandas as pd

def merge_csv_files(root_folder='output', output_file='properties_combined.csv'):
    """
    Finds all .csv files in all subdirectories of root_folder and merges them.
    """
    all_csv_files = []
    # Walk through all directories and subdirectories
    for dirpath, dirnames, filenames in os.walk(root_folder):
        for file in filenames:
            if file.endswith('.csv'):
                all_csv_files.append(os.path.join(dirpath, file))

    if not all_csv_files:
        print(f"No CSV files found in '{root_folder}' or its subdirectories.")
        return

    print(f"Found {len(all_csv_files)} CSV files to merge.")
    
    df_list = []
    for file in all_csv_files:
        try:
            df = pd.read_csv(file)
            df_list.append(df)
        except pd.errors.EmptyDataError:
            print(f"Warning: '{file}' is empty and will be skipped.")

    if not df_list:
        print("All CSV files were empty. No output file created.")
        return

    combined_df = pd.concat(df_list, ignore_index=True)
    combined_df.to_csv(output_file, index=False)
    
    print(f"✅ Success! Merged {len(df_list)} files from {len(all_csv_files)} total files into '{output_file}'.")

if __name__ == "__main__":
    merge_csv_files()