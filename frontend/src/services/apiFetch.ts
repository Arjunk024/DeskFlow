
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
