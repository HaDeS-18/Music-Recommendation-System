'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { SearchResult } from "@/types/spotify";

export default function SpotifySearch() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
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
          
          <div className="w-full space-y-4">
            {searchResults.map((track) => (
              <div 
                key={track.id} 
                className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 hover:border-[#1DB954] transition duration-300"
              >
                <div className="flex items-center">
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