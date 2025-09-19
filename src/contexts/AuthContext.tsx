import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';
import { AuthService } from '../services/authService';
import type { RegisterData, LoginData, UserData } from '../services/authService';
import { UserType } from '../types/user';

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  userType: UserType | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  getUserType: () => UserType | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Écouter les changements d'authentification
  useEffect(() => {
    console.log('🔄 Initialisation AuthContext');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 État auth changé:', user?.uid || 'non connecté');
      
      if (user) {
        setCurrentUser(user);
        
        // Récupérer les données utilisateur depuis Firestore
        const data = await AuthService.getUserData(user.uid);
        if (data) {
          setUserData(data);
          setUserType(data.userType);
          console.log('✅ Utilisateur connecté:', data.userType, data.displayName);
        } else {
          console.log('❌ Pas de données utilisateur trouvées');
          setUserData(null);
          setUserType(null);
        }
      } else {
        console.log('🚪 Utilisateur déconnecté');
        setCurrentUser(null);
        setUserData(null);
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
      toast.success('Connexion réussie !');
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
      // Forcer le rechargement des données utilisateur après inscription
      if (auth.currentUser) {
        const data = await AuthService.getUserData(auth.currentUser.uid);
        if (data) {
          setUserData(data);
          setUserType(data.userType);
        }
      }
      toast.success(`Compte créé avec succès ! Bienvenue ${data.firstName} !`);
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
    userData,
    userType,
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
}