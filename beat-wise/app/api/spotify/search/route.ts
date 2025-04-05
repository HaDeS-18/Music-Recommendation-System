import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/authOptions";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }
  
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Spotify API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error searching Spotify:", error);
    return NextResponse.json({ error: "Failed to search Spotify" }, { status: 500 });
  }
}