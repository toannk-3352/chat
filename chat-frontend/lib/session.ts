import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export type SessionUser = {
  id?: number;
  name?: string;
  email?: string;
};

export type Session = {
  user: SessionUser;
  accessToken: string;
};

const secretKey = process.env.SESSION_SECRET_KEY!;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(payload: Session) {
  const session = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(encodedKey);

  const expiredAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  (await cookies()).set("session", session, {
    expires: expiredAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(cookie, encodedKey, {
      algorithms: ["HS256"],
    });

    return payload as Session;
  } catch (error) {
    console.log("Invalid session", error);
    redirect("/auth/signin");
  }
}

export async function destroySession() {
  (await cookies()).delete("session");
}
