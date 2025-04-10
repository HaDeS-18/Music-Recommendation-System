"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { WelcomeHero } from "../components/WelcomeHero";
import { Features } from "../components/Features";

type Search = {
  id: string;
  inputSongs: string[];
  recommendedSongs: string[];
  createdAt: string;
};

export default function HistoryPage() {
  const { data: session } = useSession();
  const [searchHistory, setSearchHistory] = useState<Search[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSearch, setSelectedSearch] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchSearchHistory();
    }
  }, [session]);

  const fetchSearchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/history");
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      setSearchHistory(data);
    } catch (error) {
      console.error("Error fetching search history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleSearchDetails = (id: string) => {
    if (selectedSearch === id) {
      setSelectedSearch(null);
    } else {
      setSelectedSearch(id);
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
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            Your Beat Wise History
          </h1>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="h-10 w-10 rounded-full border-4 border-zinc-700 border-t-green-500 animate-spin"></div>
            </div>
          ) : searchHistory.length === 0 ? (
            <div className="bg-zinc-900 p-8 rounded-2xl text-center border border-zinc-800 shadow-xl">
              <h2 className="text-xl font-semibold mb-4">
                No search history yet
              </h2>
              <p className="text-zinc-400">
                Try searching for some songs to get recommendations!
              </p>
              <a
                href="/"
                className="mt-6 inline-block bg-green-500 text-black font-bold py-3 px-8 rounded-full hover:bg-green-400 transition"
              >
                Go to Beat Wise
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {searchHistory.map((search) => (
                <div
                  key={search.id}
                  className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl transition-all duration-300 hover:border-zinc-700"
                >
                  <div
                    onClick={() => toggleSearchDetails(search.id)}
                    className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between"
                  >
                    <div>
                      <div className="text-sm text-zinc-500 mb-1">
                        {formatDate(search.createdAt)}
                      </div>
                      <div className="font-medium">
                        {search.inputSongs.slice(0, 2).join(", ")}
                        {search.inputSongs.length > 2 && "..."}
                      </div>
                    </div>
                    <div className="mt-3 md:mt-0 flex items-center">
                      <span className="text-zinc-400 text-sm mr-3">
                        {search.recommendedSongs.length} recommendations
                      </span>
                      <svg
                        className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
                          selectedSearch === search.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {selectedSearch === search.id && (
                    <div className="px-5 pb-5 pt-2 border-t border-zinc-800">
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-zinc-400 mb-2">
                          Input Songs:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {search.inputSongs.map((song, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-zinc-800 rounded-full text-sm"
                            >
                              {song}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-zinc-400 mb-2">
                          Recommendations:
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {search.recommendedSongs.map((song, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-zinc-800 rounded-lg text-sm"
                            >
                              {song}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-10">
            <a
              href="/"
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-full transition duration-300 font-semibold shadow-md"
            >
              Back to Beat Wise
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
