const API_URL = 'http://localhost:3000/api';

export function getToken(): string | null {
  return localStorage.getItem('supstar_token');
}

export function setToken(token: string): void {
  localStorage.setItem('supstar_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('supstar_token');
}

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const token = getToken();

  const headers = new Headers(options.headers);

  if (
    options.body !== undefined &&
    !headers.has('Content-Type')
  ) {
    headers.set(
      'Content-Type',
      'application/json',
    );
  }

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`,
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
      body:
        options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
    },
  );

  if (!response.ok) {
    let message = `Erreur ${response.status}`;

    try {
      const errorData =
        (await response.json()) as {
          message?: string | string[];
        };

      if (Array.isArray(errorData.message)) {
        message =
          errorData.message.join(', ');
      } else if (errorData.message) {
        message = errorData.message;
      }
    } catch {
      // Réponse sans JSON.
    }

    if (
      response.status === 401 &&
      token
    ) {
      clearToken();
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType =
    response.headers.get(
      'content-type',
    );

  if (
    contentType?.includes(
      'application/json',
    )
  ) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

export { API_URL };