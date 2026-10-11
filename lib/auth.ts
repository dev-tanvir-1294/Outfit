import "server-only";

import { cookies } from "next/headers";

const WP_URL = (
  process.env.WORDPRESS_URL ?? process.env.WOOCOMMERCE_URL ?? ""
).replace(/\/+$/, "");
const JWT_PATH =
  process.env.WORDPRESS_JWT_PATH ?? "/wp-json/jwt-auth/v1/token";
const SESSION_COOKIE = "wc_session";

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  token: string;
}

export async function login(
  email: string,
  password: string
): Promise<SessionUser> {
  const res = await fetch(`${WP_URL}${JWT_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Invalid email or password");
  }

  const json = await res.json();
  const token = json.token as string;
  const id = decodeUserId(token);

  if (!token || !id) {
    throw new Error(
      "Unable to establish a session. Ensure the JWT authentication plugin is configured."
    );
  }

  return {
    id,
    email: json.user_email ?? email,
    name: json.user_display_name ?? email,
    token,
  };
}

function decodeUserId(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
    const id = decoded?.data?.user?.id ?? decoded?.user?.id ?? decoded?.sub;
    const numeric = typeof id === "number" ? id : Number(id);
    return Number.isFinite(numeric) ? numeric : null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return null;

  try {
    return JSON.parse(value) as SessionUser;
  } catch {
    return null;
  }
}

export async function setSession(user: SessionUser): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
