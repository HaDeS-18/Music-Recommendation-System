import spotipy
from spotipy.oauth2 import SpotifyOAuth

# Replace these with your actual values directly
CLIENT_ID='47043b1ddda24d77a4bab7751fcad1ec'
CLIENT_SECRET='134a4b3133994dccbc7819a3c7949648'
REDIRECT_URI = 'http://localhost:8888/callback'

sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    redirect_uri=REDIRECT_URI,
    scope='user-library-read'
))

# Search for track
query = "Bloody Sweet"
results = sp.search(q=query, limit=1, type='track')
track = results['tracks']['items'][0]

track_id = track['id']
print(f"✅ Found track: {track['name']} by {track['artists'][0]['name']}")
print(f"🔗 Spotify URL: {track['external_urls']['spotify']}")

# Fetch audio features
features = sp.audio_features([track_id])[0]
print("\n🎧 Audio Features:")
for key, value in features.items():
    print(f"{key}: {value}")
