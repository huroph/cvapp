import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserType } from '../../types/user';

interface UserTypeRedirectProps {
  children: React.ReactNode;
}

export default function UserTypeRedirect({ children }: UserTypeRedirectProps) {
  const navigate = useNavigate();
  const { currentUser, getUserType, loading } = useAuth();

  useEffect(() => {
    console.log('🔍 UserTypeRedirect - Effect - État:', {
      loading,
      currentUser
    });

    if (!loading && currentUser) {
      const userType = getUserType();
      const currentPath = window.location.pathname;
      
      // Permettre l'accès aux pages publiques pour tous les utilisateurs
      const publicPaths = ['/shared/', '/login', '/register', '/cv'];
      const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
      
      if (isPublicPath) {
        return; // Ne pas rediriger sur les pages publiques
      }

      console.log('🔍 UserTypeRedirect - Vériesfesfsefication:', {
        userType
        
      });

      // Si c'est un recruteur et qu'il n'est pas déjà sur son dashboard
      if (userType === UserType.RECRUTEUR  ) {
        console.log('➡️ Redirection vers le dashboard recruteur');
        navigate('/recruiter/dashboard');
        return;
      }
      
      // Si c'est un candidat et qu'il est sur le dashboard recruteur
      if (userType === UserType.CANDIDAT && currentPath.startsWith('/recruiter')) {
        navigate('/');
        return;
      }
    }
  }, [currentUser, getUserType, loading, navigate]);

  return <>{children}</>;
}