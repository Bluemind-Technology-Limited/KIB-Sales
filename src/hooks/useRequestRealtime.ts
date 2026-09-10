import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAppDispatch, useAppSelector } from './redux';
import { selectUser } from '../store/slices/authSlice';
import { loadRequests } from '../store/slices/requestSlice';

/**
 * Subscribes to Supabase Realtime for `requests` table changes, then refetches
 * the affected list through the Express API so data stays permission-checked.
 * A distributor's own user id IS the distributor id in the requests table.
 */
export function useRequestRealtime() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const role = user?.role;
  const userId = user?.id;

  useEffect(() => {
    if (!role) return;
    const isAdmin = role === 'SUPER_ADMIN';
    if (!userId) return;

    const filter = isAdmin ? undefined : `distributor_id=eq.${userId}`;
    const channel = supabase
      .channel(`requests-live-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests', filter },
        () => {
          dispatch(loadRequests());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dispatch, role, userId]);
}
