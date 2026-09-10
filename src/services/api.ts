import { supabase } from './supabase';

// No localhost fallback — the API must be a hosted deployment. The .env
// example documents the required VITE_API_URL value.
const BASE_URL = 'https://backend-sfa.vercel.app';

/** Envelope returned by the Express backend for every endpoint. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  code?: string;
  data: T;
}

/**
 * Thin REST helper for the Express API: attaches the Supabase JWT as a Bearer
 * token and unwraps the { success, message, data } envelope. Throws on
 * non-2xx responses or `success: false`.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const accessToken = token ?? (await supabase.auth.getSession()).data.session?.access_token;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
  const body = (await res.json().catch(() => ({}))) as Partial<ApiEnvelope<T>>;
  if (!res.ok || body.success === false) {
    throw new Error(body.message ?? `Request failed (${res.status}).`);
  }
  return body.data as T;
}
