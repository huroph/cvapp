import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';
import { auth, db } from '../lib/firebase';
import { AuthService, type AuthUser, type LoginData, type RegisterData } from '../services/authService';
import { UserType } from '../types/user';

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  getUserType: () => UserType | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Récupérer le type d'utilisateur depuis Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          const authUser = { ...user, userType: userData?.userType } as AuthUser;
          setCurrentUser(authUser);
          setUserType(userData?.userType || null);
        } catch (error) {
          console.error('Erreur lors de la récupération du type d\'utilisateur:', error);
          setCurrentUser(user as AuthUser);
          setUserType(null);
        }
      } else {
        setCurrentUser(null);
        setUserType(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Connexion
  const login = async (data: LoginData) => {
    try {
      setError(null);
      setLoading(true);
      await AuthService.login(data);
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la connexion';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Inscription
  const register = async (data: RegisterData) => {
    try {
      setError(null);
      setLoading(true);
      await AuthService.register(data);
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la création du compte';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      setError(null);
      await AuthService.logout();
      toast.success('Déconnexion réussie');
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la déconnexion';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  };

  // Effacer les erreurs
  const clearError = () => {
    setError(null);
  };

  // Obtenir le type d'utilisateur
  const getUserType = () => {
    return userType;
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    getUserType,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};