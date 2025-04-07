
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/authOptions";
import { prisma } from "@/utils/prisma";

export async function POST(req: NextRequest) {

  const session = await getServerSession(authOptions)

  if(!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const backendURL = process.env.RECOMMENDER_API_URL || "http://localhost:8000"
  try {
    const body = await req.json();
    const { songs } = body;

    if (!Array.isArray(songs) || songs.length === 0) {
      return NextResponse.json({ message: "No songs provided" }, { status: 400 });
    }

    const response = await fetch(`${backendURL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songs }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Backend error:", errText);
      return NextResponse.json({ message: "Error from recommendation backend" }, { status: 500 });
    }

    const data = await response.json();

    const recomSongNames = data.recommendations.map((rec: { name: string }) => rec.name);

    const userInDb = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (userInDb) {
      await prisma.search.create({
        data: {
          userId: userInDb.id,
          inputSongs: songs,
          recommendedSongs: recomSongNames,
        },
      })
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
