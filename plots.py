import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

data_scaled_df = pd.read_csv("scaled_dataset.csv")

data_scaled_df['name_lower'] = data_scaled_df['name'].str.lower()

def get_song_features(song_name):
    song_name = song_name.strip().lower()
    matches = data_scaled_df[data_scaled_df['name_lower'] == song_name]
    if matches.empty:
        print(f"Song '{song_name}' not found.")
        return None
    latest_song = matches.sort_values(by='year', ascending=False).iloc[0]
    print(f"Found: {latest_song['name']} ({latest_song['year']}) by {latest_song['artists']}")
    return latest_song

def plot_song_feature_comparison(song_name):
    song = get_song_features(song_name)
    if song is None:
        return
    
    features_to_plot = ['danceability', 'energy', 'speechiness', 'acousticness', 
                        'instrumentalness', 'liveness', 'valence', 'tempo']
    
    song_features = song[features_to_plot]
    avg_features = data_scaled_df[features_to_plot].mean()

    df_plot = pd.DataFrame({
        'Feature': features_to_plot,
        'Song': song_features.values,
        'Average': avg_features.values
    })

    df_plot.set_index('Feature', inplace=True)
    df_plot.plot(kind='bar', figsize=(12, 6), colormap='Set2')
    plt.title(f"🎵 {song['name']} Feature Comparison vs Average")
    plt.ylabel("Feature Value")
    plt.xticks(rotation=45)
    plt.grid(axis='y')
    plt.tight_layout()
    plt.show()

# Example usage
if __name__ == "__main__":
    plot_song_feature_comparison("Sicko Mode")
