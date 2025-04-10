import { getServerSession } from "next-auth"
import { authOptions } from "../auth/authOptions"
import { prisma } from "@/utils/prisma"


export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { searches: { orderBy: { createdAt: "desc" } } },
  })

  if (!user) return new Response("User not found", { status: 404 })

  return Response.json(user.searches)
}
