import { supabase } from '@/lib/supabaseClient';

/**
 * @param {string} iso
 */
export function formatNotificationTime(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 0) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * @param {string} userId
 * @param {number} [limit]
 * @returns {Promise<Array<{ id: string, message: string, isRead: boolean, createdAt: string, type: string, time: string }>>}
 */
export async function fetchNotificationsForUser(userId, limit = 50) {
  if (!supabase || !userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('notification_id, message_content, is_read, created_at, type')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data || []).map((row) => ({
    id: String(row.notification_id),
    message: row.message_content || '',
    isRead: !!row.is_read,
    createdAt: row.created_at,
    type: row.type || '',
    time: formatNotificationTime(row.created_at),
  }));
}

/**
 * @param {string} userId
 */
export async function markAllNotificationsReadForUser(userId) {
  if (!supabase || !userId) {
    return;
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    throw error;
  }
}

/**
 * @param {string} userId
 * @param { (n: { id: string, message: string, isRead: boolean, createdAt: string, type: string, time: string }) => void } onInsert
 * @returns {() => void} unsubscribe
 */
export function subscribeToUserNotifications(userId, onInsert) {
  if (!supabase || !userId) {
    return () => {};
  }

  const channel = supabase
    .channel(`user-notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const row = payload.new;
        if (!row || String(row.user_id) !== String(userId)) {
          return;
        }
        onInsert({
          id: String(row.notification_id),
          message: row.message_content || '',
          isRead: !!row.is_read,
          createdAt: row.created_at,
          type: row.type || '',
          time: formatNotificationTime(row.created_at),
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
