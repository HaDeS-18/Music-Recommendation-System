from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

data_scaled_df = pd.read_csv("scaled_dataset.csv")
data_scaled_df['name_lower'] = data_scaled_df['name'].str.lower()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SongRequest(BaseModel):
    songs: list[str]

def get_song_data(song_name: str):
    song_name = song_name.strip().lower()
    matches = data_scaled_df[data_scaled_df['name_lower'] == song_name]
    if not matches.empty:
        return matches.sort_values(by='year', ascending=False).iloc[0]
    return None

@app.get("/")
def read_root():
    return {"message": "Welcome to the Music Recommendation API"}

@app.post("/recommend")
def recommend_songs(request: SongRequest):
    input_songs_data = [get_song_data(song) for song in request.songs]
    input_songs_data = [s for s in input_songs_data if s is not None]

    if not input_songs_data:
        return {"message": "No valid input songs found", "recommendations": []}

    input_features = pd.DataFrame(input_songs_data)[[
        'danceability', 'energy', 'key', 'loudness', 'mode',
        'speechiness', 'acousticness', 'instrumentalness',
        'liveness', 'valence', 'tempo'
    ]]

    all_features = data_scaled_df[input_features.columns]
    similarities = cosine_similarity(input_features, all_features)
    similarity_scores = np.mean(similarities, axis=0)

    song_names_years = [(s['name'].lower(), s['year']) for s in input_songs_data]
    mask = ~(
        data_scaled_df.apply(lambda x: (x['name'].lower(), x['year']) in song_names_years, axis=1)
    )

    data_scaled_df_filtered = data_scaled_df[mask].copy()
    data_scaled_df_filtered['similarity_score'] = similarity_scores[mask]

    recommended = data_scaled_df_filtered.sort_values(by='similarity_score', ascending=False).head(10)

    return {
        "recommendations": recommended[['name', 'artists', 'year', 'similarity_score']].to_dict(orient='records')
    }
