import { registerCustomer } from "@/lib/woocommerce";
import { login, setSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password, firstName, lastName, username } =
    await request.json();

  if (!email || !password) {
    return Response.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    await registerCustomer({ email, password, firstName, lastName, username });
    const user = await login(email, password);
    await setSession(user);
    return Response.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "Registration failed",
      },
      { status: 400 }
    );
  }
}
