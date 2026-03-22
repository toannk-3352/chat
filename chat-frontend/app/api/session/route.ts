import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: session.user,
      accessToken: session.accessToken,
    });
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
