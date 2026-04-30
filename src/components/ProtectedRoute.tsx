import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { isAuthDisabled } from '@/lib/authMode';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const authDisabled = isAuthDisabled();

  useEffect(() => {
    if (!authDisabled && !loading && !user) {
      navigate('/auth');
    }
  }, [authDisabled, user, loading, navigate]);

  if (!authDisabled && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authDisabled && !user) {
    return null;
  }

  return <>{children}</>;
};
