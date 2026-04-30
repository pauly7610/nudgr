import { useState, useEffect } from 'react';
import { apiRequest, clearAuthTokens, getAccessToken, getRefreshToken } from '@/lib/apiClient';
import { demoAuthUser, isAuthDisabled } from '@/lib/authMode';

interface AuthUser {
  id: string;
  email: string;
  fullName?: string | null;
}

interface AuthSession {
  accessToken: string;
}

export const useAuth = () => {
  const authDisabled = isAuthDisabled();
  const [user, setUser] = useState<AuthUser | null>(authDisabled ? demoAuthUser : null);
  const [session, setSession] = useState<AuthSession | null>(authDisabled ? { accessToken: 'auth-disabled' } : null);
  const [loading, setLoading] = useState(!authDisabled);

  useEffect(() => {
    if (authDisabled) {
      setUser(demoAuthUser);
      setSession({ accessToken: 'auth-disabled' });
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadCurrentUser = async () => {
      if (!getAccessToken() && !getRefreshToken()) {
        if (!isMounted) return;
        setUser(null);
        setSession(null);
        setLoading(false);
        return;
      }

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
      if (event.key === 'nudgr_access_token' || event.key === 'nudgr_refresh_token') {
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
  }, [authDisabled]);

  const signOut = async () => {
    if (authDisabled) {
      clearAuthTokens();
      setUser(demoAuthUser);
      setSession({ accessToken: 'auth-disabled' });
      setLoading(false);
      return;
    }

    const refreshToken = getRefreshToken();

    try {
      await apiRequest<{ ok: true }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify(refreshToken ? { refreshToken } : {}),
        skipAuthRefresh: true,
      });
    } catch {
      // ignore network failures and clear local token anyway
    } finally {
      clearAuthTokens();
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  };

  return { user, session, loading, signOut };
};
