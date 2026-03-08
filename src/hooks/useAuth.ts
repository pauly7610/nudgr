import { useState, useEffect } from 'react';
import { apiRequest, setAccessToken } from '@/lib/apiClient';

interface AuthUser {
  id: string;
  email: string;
  fullName?: string | null;
}

interface AuthSession {
  accessToken: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const me = await apiRequest<{
          id: string;
          email: string;
          fullName?: string | null;
        }>('/auth/me');

        if (!isMounted) return;

        setUser({
          id: me.id,
          email: me.email,
          fullName: me.fullName,
        });
        setSession({ accessToken: '' });
      } catch {
        if (!isMounted) return;

        setUser(null);
        setSession(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadCurrentUser();

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'nudgr_access_token') {
        if (!event.newValue) {
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        setLoading(true);
        void loadCurrentUser();
      }
    };

    window.addEventListener('storage', onStorage);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const signOut = async () => {
    try {
      await apiRequest<{ ok: true }>('/auth/logout', { method: 'POST' });
    } catch {
      // ignore network failures and clear local token anyway
    } finally {
      setAccessToken(null);
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  };

  return { user, session, loading, signOut };
};
