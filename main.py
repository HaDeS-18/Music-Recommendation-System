import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

data_scaled_df = pd.read_csv("scaled_dataset.csv")
data_scaled_df['name_lower'] = data_scaled_df['name'].str.lower()

def get_song_data(song_name: str):
    """
    Fetch the most recent entry for the song from the dataset based on song name (case-insensitive).
    """
    song_name = song_name.strip().lower()
    matches = data_scaled_df[data_scaled_df['name_lower'] == song_name]
    if not matches.empty:
        latest_song = matches.sort_values(by='year', ascending=False).iloc[0]
        print(f"Found: {latest_song['name']} ({latest_song['year']}) by {latest_song['artists']}")
        return latest_song
    else:
        print(f"Song '{song_name}' not found in the dataset.")
        return None

def recommend_songs(input_songs, num_recommendations=10):
    """
    Recommend similar songs using cosine similarity.
    """
    input_songs_data = [get_song_data(song) for song in input_songs]
    input_songs_data = [s for s in input_songs_data if s is not None]
    
    if not input_songs_data:
        print("No valid input songs found.")
        return []

    input_features = pd.DataFrame(input_songs_data)[['danceability', 'energy', 'key', 'loudness',
                                                      'mode', 'speechiness', 'acousticness',
                                                      'instrumentalness', 'liveness', 'valence', 'tempo']]
    
    all_features = data_scaled_df[['danceability', 'energy', 'key', 'loudness', 'mode',
                                   'speechiness', 'acousticness', 'instrumentalness', 'liveness',
                                   'valence', 'tempo']]
    
    similarities = cosine_similarity(input_features, all_features)
    similarity_scores = np.mean(similarities, axis=0)

    song_names_years = [(s['name'].lower(), s['year']) for s in input_songs_data]
    mask = ~(
        data_scaled_df.apply(lambda x: (x['name'].lower(), x['year']) in song_names_years, axis=1)
    )

    data_scaled_df_filtered = data_scaled_df[mask].copy()
    data_scaled_df_filtered['similarity_score'] = similarity_scores[mask]

    recommended_songs = data_scaled_df_filtered.sort_values(by='similarity_score', ascending=False).head(num_recommendations)

    print("\n🎵 Recommended Songs:")
    for idx, row in recommended_songs.iterrows():
        print(f"{row['name']} ({row['year']}) by {row['artists']} — Score: {row['similarity_score']:.4f}")
    
    return recommended_songs[['name', 'artists', 'year', 'similarity_score']]

if __name__ == "__main__":
    input_songs = ['90210', 'Blinding Lights', 'Shape of You']
    recommend_songs(input_songs)
