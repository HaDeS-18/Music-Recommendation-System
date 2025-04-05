import pandas as pd
from sklearn.preprocessing import StandardScaler

# Step 1: Load original dataset
df = pd.read_csv("data.csv")

# Step 2: Drop unnecessary columns
columns_to_drop = ['id', 'release_date', 'Unnamed: 0']
df.drop(columns=[col for col in columns_to_drop if col in df.columns], inplace=True)

# Step 3: Keep a copy of non-numeric columns for reference
non_numeric_cols = ['name', 'artists', 'year']
non_numeric_df = df[non_numeric_cols]

# Step 4: Select numeric columns for scaling
numeric_cols = df.drop(columns=non_numeric_cols).columns

# Step 5: Scale the numeric features
scaler = StandardScaler()
scaled_features = scaler.fit_transform(df[numeric_cols])
scaled_df = pd.DataFrame(scaled_features, columns=numeric_cols)

# Step 6: Combine back with non-numeric columns
final_df = pd.concat([non_numeric_df, scaled_df], axis=1)

# Step 7: Add lowercase song names for matching
final_df['name_lower'] = final_df['name'].str.lower()

# Step 8: Save the cleaned & scaled dataset
final_df.to_csv("scaled_dataset.csv", index=False)

print("✅ Dataset scaled and saved as 'scaled_dataset.csv'")
