"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState} from "react";
import { SearchResult } from "@/types/spotify";
import { WelcomeHero } from "./WelcomeHero";
import { Features } from "./Features";

type Recommendation = {
  name: string;
  artists: string;
  year: number;
  similarity_score: number;
};

export default function SpotifySearch() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [playlistResult, setPlaylistResult] = useState<any>(null);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [playlistName, setPlaylistName] = useState("");
  const [customSongs, setCustomSongs] = useState<string[]>([""]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  

  const updateCustomSong = (index: number, value: string) => {
    const updated = [...customSongs];
    updated[index] = value;
    setCustomSongs(updated);
  };

  const addCustomSongField = () => {
    setCustomSongs([...customSongs, ""]);
  };

  const handleGetRecommendations = async () => {
    const nonEmptySongs = customSongs.map((s) => s.trim()).filter(Boolean);
    if (nonEmptySongs.length === 0) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ songs: nonEmptySongs }),
      });

      const data = await res.json();
      setRecommendations(data.recommendations || []);

      for(const songs in data.recommendations) {
        const song = data.recommendations[songs].name + " " + data.recommendations[songs].artists

        // Fetch the track details from Spotify
        
        const searchRes = await fetch(
          `/api/spotify/search?q=${encodeURIComponent(song)}`
        );
        const searchData = await searchRes.json();
        const track = searchData.tracks.items[0];
        if (track) {
          setSearchResults((prev) => [...prev, track]);
          setSelectedTracks((prev) => new Set([...prev, track.id]));
        }
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCustomSongs([""]);
    setRecommendations([]);
  };

  const toggleTrackSelection = (trackId: string) => {
    const newSelection = new Set(selectedTracks);
    newSelection.has(trackId)
      ? newSelection.delete(trackId)
      : newSelection.add(trackId);
    setSelectedTracks(newSelection);
  };

  const createPlaylist = async () => {
    if (selectedTracks.size === 0) return;
    setIsCreatingPlaylist(true);
    try {
      const response = await fetch("/api/spotify/create-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackIds: Array.from(selectedTracks),
          playlistName: playlistName || `My Recommended Playlist`,
        }),
      });
      if (!response.ok) throw new Error("Failed to create playlist");
      const data = await response.json();
      setPlaylistResult(data.playlist);
      setSelectedTracks(new Set());
      setPlaylistName("");
    } catch (error) {
      console.error("Error creating playlist:", error);
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white font-inter">
      {!session ? (
        <div className="flex flex-col items-center justify-center pt-1 pb-24">
          <WelcomeHero />
          <button
            onClick={() => signIn("spotify")}
            className="bg-green-500 text-black font-bold py-4 px-10 rounded-full transition-all duration-200 shadow-md hover:bg-green-400 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            Login with Spotify
          </button>
          <Features />
        </div>
      ) : (
        <div className="px-4 py-12 max-w-4xl mx-auto">
          <WelcomeHero />

          <div className="bg-zinc-900 p-5 rounded-2xl mb-12 max-w-md mx-auto shadow-xl border border-zinc-800">
            <h2 className="text-lg font-semibold text-center text-white mb-4 tracking-wide">
              Enter Songs for Recommendations
            </h2>

            <div className="space-y-3">
              {customSongs.map((song, idx) => (
                <input
                  key={idx}
                  value={song}
                  onChange={(e) => updateCustomSong(idx, e.target.value)}
                  placeholder={`Song ${idx + 1}`}
                  disabled={isLoading}
                  className="w-full px-3 py-2 text-sm rounded-md bg-zinc-800 border border-zinc-700 placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50"
                />
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-5">
              <button
                onClick={addCustomSongField}
                disabled={isLoading}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-sm text-white rounded-lg transition shadow-sm disabled:opacity-50"
              >
                + Add Song
              </button>

              <button
                onClick={handleGetRecommendations}
                disabled={isLoading || customSongs.length === 0}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition ${
                  isLoading
                    ? "bg-emerald-400 cursor-not-allowed text-black"
                    : "bg-emerald-500 hover:bg-emerald-400 text-black"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Loading...
                  </div>
                ) : (
                  "Get Recommendations"
                )}
              </button>

              <button
                onClick={handleReset}
                disabled={isLoading}
                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-sm text-white rounded-lg transition shadow-sm disabled:opacity-50"
              >
                Reset All
              </button>
            </div>
          </div>

          {/* Search results from Spotify */}

          {searchResults.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Search Results</h2>
                {selectedTracks.size > 0 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      placeholder="Playlist name"
                      className="p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-green-500"
                    />
                    <button
                      onClick={createPlaylist}
                      disabled={isCreatingPlaylist}
                      className="bg-green-500 text-black font-bold py-2 px-4 rounded-full hover:bg-green-400 transition disabled:opacity-50"
                    >
                      {isCreatingPlaylist
                        ? "Creating..."
                        : `Create Playlist (${selectedTracks.size})`}
                    </button>
                  </div>
                )}
              </div>

              {/* Post Playlist creation */}

              {playlistResult && (
                <div className="mb-4 p-4 bg-green-900 bg-opacity-20 border border-green-800 rounded-lg">
                  <p className="font-bold text-green-400">
                    Playlist "{playlistResult.name}" created successfully!
                  </p>
                  <a
                    href={playlistResult.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:underline"
                  >
                    Open in Spotify
                  </a>
                  <button
                    onClick={() => setPlaylistResult(null)}
                    className="ml-4 text-sm text-zinc-400 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Search results from Spotify mapped with artist name and photo */}

              <div className="space-y-4">
                {searchResults.map((track) => (
                  <div
                    key={track.id}
                    className={`bg-zinc-900 p-4 rounded-xl border transition duration-300 flex items-center gap-4 ${
                      selectedTracks.has(track.id)
                        ? "border-green-500"
                        : "border-zinc-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTracks.has(track.id)}
                      onChange={() => toggleTrackSelection(track.id)}
                      className="w-5 h-5 accent-green-500"
                    />
                    {track.album.images[0] && (
                      <img
                        src={track.album.images[0].url}
                        alt={track.album.name}
                        className="w-16 h-16 rounded-md"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-xl">{track.name}</h3>
                      <p className="text-zinc-400">
                        {track.artists.map((a) => a.name).join(", ")}
                      </p>
                      <p className="text-zinc-500 text-sm">
                        Released:{" "}
                        {new Date(track.album.release_date).getFullYear()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation results from the Model */}

          {recommendations.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-4">Recommended Songs</h2>
              <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <div
                    key={`${rec.name}-${rec.year}-${idx}`}
                    className="bg-zinc-900 p-4 rounded-xl border border-zinc-700"
                  >
                    <h3 className="text-xl font-bold">{rec.name}</h3>
                    <p className="text-zinc-400">{rec.artists}</p>
                    <p className="text-zinc-500 text-sm">Year: {rec.year}</p>
                    <p className="text-green-400 text-sm">
                      Similarity Score: {rec.similarity_score.toFixed(4)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center mt-8">
            <button
              onClick={() => signOut()}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-full transition duration-300 font-semibold shadow-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
