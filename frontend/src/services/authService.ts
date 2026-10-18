
const API_BASE_URL = "http://localhost:5251/api/Auth";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AuthResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? data.errors?.join(", ") ?? "Login failed.");
  }

  return data as AuthResponse;
}

export async function register(
  fullName: string,
  email: string,
  password: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fullName, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? data.errors?.join(", ") ?? "Registration failed.");
  }

  return data as { message: string };
}
