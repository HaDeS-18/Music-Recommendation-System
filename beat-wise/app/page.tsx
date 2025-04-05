import NormalUISearch from "./components/normalUISearch";
import SpotifySearch from "./components/SpotifySearch";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <SpotifySearch />
    </main>
  );
}