const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

function flattenZodError(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const fieldErrors = (error as { fieldErrors?: Record<string, string[]> }).fieldErrors;
  if (!fieldErrors) return null;
  const parts = Object.entries(fieldErrors)
    .filter(([, msgs]) => msgs && msgs.length > 0)
    .map(([field, msgs]) => `${field}: ${msgs!.join(", ")}`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(`Impossible de joindre l'API (${API_URL}). Le backend tourne-t-il ?`, 0);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (typeof body?.error === "string" ? body.error : flattenZodError(body?.error)) || `Erreur ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}
