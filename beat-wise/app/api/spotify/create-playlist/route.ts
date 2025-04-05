import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/authOptions";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  
  try {
    const { trackIds, playlistName } = await request.json();
    
    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return NextResponse.json({ error: "No tracks provided" }, { status: 400 });
    }
    
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    
    if (!userResponse.ok) {
      throw new Error("Failed to fetch user profile");
    }
    
    const userData = await userResponse.json();
    const userId = userData.id;
    
    const createPlaylistResponse = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playlistName || "My Search Results Playlist",
          description: "Created from search results",
          public: false,
        }),
      }
    );
    
    if (!createPlaylistResponse.ok) {
      throw new Error("Failed to create playlist");
    }
    
    const playlistData = await createPlaylistResponse.json();
    const playlistId = playlistData.id;
    
    const addTracksResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: trackIds.map((id: string) => `spotify:track:${id}`),
        }),
      }
    );
    
    if (!addTracksResponse.ok) {
      throw new Error("Failed to add tracks to playlist");
    }
    
    return NextResponse.json({
      success: true,
      playlist: {
        id: playlistId,
        name: playlistData.name,
        external_url: playlistData.external_urls.spotify,
      },
    });
  } catch (error) {
    console.error("Error creating playlist:", error);
    return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 });
  }
}