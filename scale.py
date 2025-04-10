import pandas as pd
from sklearn.preprocessing import StandardScaler

df = pd.read_csv("data.csv")

columns_to_drop = ['id', 'release_date', 'Unnamed: 0']
df.drop(columns=[col for col in columns_to_drop if col in df.columns], inplace=True)

non_numeric_cols = ['name', 'artists', 'year']
non_numeric_df = df[non_numeric_cols]

numeric_cols = df.drop(columns=non_numeric_cols).columns

scaler = StandardScaler()
scaled_features = scaler.fit_transform(df[numeric_cols])
scaled_df = pd.DataFrame(scaled_features, columns=numeric_cols)

final_df = pd.concat([non_numeric_df, scaled_df], axis=1)

final_df['name_lower'] = final_df['name'].str.lower()

final_df.to_csv("scaled_dataset.csv", index=False)

print("Dataset scaled and saved as 'scaled_dataset.csv'")
