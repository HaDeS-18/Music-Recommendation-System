'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { SearchResult } from "@/types/spotify";

export default function NormalUISearch() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [playlistResult, setPlaylistResult] = useState<any>(null);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [playlistName, setPlaylistName] = useState("");

  const handleSearch = async () => {
    if (!session?.accessToken || !searchQuery) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search');
      }
      
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
    if (newSelection.has(trackId)) {
      newSelection.delete(trackId);
    } else {
      newSelection.add(trackId);
    }
    setSelectedTracks(newSelection);
  };

  const createPlaylist = async () => {
    if (selectedTracks.size === 0) return;
    
    setIsCreatingPlaylist(true);
    try {
      const response = await fetch('/api/spotify/create-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackIds: Array.from(selectedTracks),
          playlistName: playlistName || `My ${searchQuery} Playlist`,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create playlist');
      }
      
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
    <div className="w-full max-w-3xl mx-auto p-4">
      {!session ? (
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-4xl font-bold mb-8">Spotify Song Search</h1>
          <button
            onClick={() => signIn("spotify")}
            className="bg-[#1DB954] text-black font-bold py-3 px-6 rounded-full flex items-center hover:bg-opacity-90 transition duration-300"
          >
            Login with Spotify
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-8">Spotify Song Search</h1>
          
          <div className="w-full flex mb-8">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a song..."
              className="flex-1 p-3 rounded-l-full bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-[#1DB954]"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-[#1DB954] text-black font-bold p-3 rounded-r-full hover:bg-opacity-90 transition duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="w-full mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Search Results</h2>
                {selectedTracks.size > 0 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      placeholder="Playlist name"
                      className="p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-[#1DB954]"
                    />
                    <button
                      onClick={createPlaylist}
                      disabled={isCreatingPlaylist || selectedTracks.size === 0}
                      className="bg-[#1DB954] text-black font-bold py-2 px-4 rounded hover:bg-opacity-90 transition duration-300 disabled:opacity-50"
                    >
                      {isCreatingPlaylist ? 'Creating...' : `Create Playlist (${selectedTracks.size})`}
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
                    className="text-[#1DB954] hover:underline"
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
              
              <div className="w-full space-y-4">
                {searchResults.map((track) => (
                  <div 
                    key={track.id} 
                    className={`bg-zinc-800 p-4 rounded-lg border ${
                      selectedTracks.has(track.id) ? 'border-[#1DB954]' : 'border-zinc-700'
                    } hover:border-zinc-500 transition duration-300`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTracks.has(track.id)}
                        onChange={() => toggleTrackSelection(track.id)}
                        className="w-5 h-5 mr-4 accent-[#1DB954]"
                      />
                      {track.album.images[0] && (
                        <img 
                          src={track.album.images[0].url} 
                          alt={track.album.name}
                          className="w-16 h-16 rounded-md mr-4"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-xl">{track.name}</h3>
                        <p className="text-zinc-400">{track.artists.map(a => a.name).join(', ')}</p>
                        <p className="text-zinc-500 text-sm">Released: {new Date(track.album.release_date).getFullYear()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button 
            onClick={() => signOut()} 
            className="mt-8 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-full transition duration-300"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}