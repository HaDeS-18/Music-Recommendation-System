"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { SearchResult } from "@/types/spotify";
import { WelcomeHero } from "./WelcomeHero";
import { SearchBar } from "./SearchBar";
import { Features } from "./Features";

export default function SpotifySearch() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [playlistResult, setPlaylistResult] = useState<any>(null);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [playlistName, setPlaylistName] = useState("");

  const handleSearch = async (query = searchQuery) => {
    if (!session?.accessToken || !query) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Failed to search");
      const data = await response.json();
      setSearchResults(data.tracks.items);
      setSelectedTracks(new Set());
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
    }
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
          playlistName: playlistName || `My ${searchQuery} Playlist`,
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
        <div className="flex flex-col items-center justify-center pt-10 pb-24">
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

          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              loading={isLoading}
            />
          </div>

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
