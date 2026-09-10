import type { User } from '../types/domain';
import { supabase } from './supabase';
import { apiFetch } from './api';
import { mapUser } from './mappers';

export interface Credentials {
  email: string;
  password: string;
}

export interface LoginResult {
  user: User;
  token: string;
}

/**
 * Sign in via Supabase Auth, then fetch the profile from the Express API
 * (`GET /api/auth/me`) using the issued JWT. The returned token is sent as
 * `Authorization: Bearer <token>` on every subsequent API call.
 */
export async function loginAction({ email, password }: Credentials): Promise<LoginResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  const token = data.session?.access_token;
  if (!token) throw new Error('Signed in, but no session token was returned.');
  const user = await fetchCurrentUser(token);
  return { user, token };
}

/** GET /api/auth/me — the authenticated user's profile. */
export async function fetchCurrentUser(token?: string): Promise<User> {
  const me = await apiFetch<Record<string, unknown>>('/api/auth/me', {}, token);
  return mapUser(me ?? {});
}

/** Restore the persisted Supabase session on app boot. */
export async function restoreSessionAction(): Promise<{ user: User | null; token: string | null }> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return { user: null, token: null };
  try {
    const user = await fetchCurrentUser(session.access_token);
    return { user, token: session.access_token };
  } catch {
    // Stale/invalid session — the caller clears local auth state.
    return { user: null, token: null };
  }
}

/** Sign out of Supabase (invalidates the JWT server-side). */
export async function signOutAction(): Promise<void> {
  await supabase.auth.signOut();
}
