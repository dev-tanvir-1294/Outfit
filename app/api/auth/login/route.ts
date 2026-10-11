import { login, setSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    const user = await login(email, password);
    await setSession(user);
    return Response.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Login failed" },
      { status: 401 }
    );
  }
}
