import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  position: string;
  avatar?: string;
  onboardingDone?: boolean;
}

interface ProfileContextType {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  updateProfile: (profileData: ProfileData) => Promise<void>;
  resetProfile: () => void;
  isProfileComplete: () => boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger le profil quand l'utilisateur change
  useEffect(() => {
    let isMounted = true;
    
    const loadProfile = async () => {
      if (!currentUser) {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
        console.log('🚫 Pas d\'utilisateur connecté');
        return;
      }

      try {
        if (isMounted) setLoading(true);
        console.log('⏳ Chargement profil pour:', currentUser.uid);
        
        const profileRef = doc(db, 'profiles', currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (!isMounted) return; // Component unmounted

        if (profileSnap.exists()) {
            const profileData = profileSnap.data() as ProfileData;
            
            // Forcer l'email à correspondre à l'utilisateur
            if (profileData.email !== currentUser.email) {
              profileData.email = currentUser.email!;
              await setDoc(profileRef, { ...profileData, updatedAt: new Date() }, { merge: true });
            }
            // Valeur par défaut onboardingDone si absent
            if (typeof profileData.onboardingDone === 'undefined') {
              profileData.onboardingDone = false;
            }
            setProfile(profileData);
            console.log('✅ Profil chargé:', profileData.firstName);
        } else {
          setProfile(null);
          console.log('❌ Aucun profil trouvé');
        }
      } catch (err) {
        console.error('❌ Erreur chargement profil:', err);
        if (isMounted) {
          setError('Erreur lors du chargement du profil');
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Délai court pour éviter les flickers
    const timer = setTimeout(loadProfile, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentUser]);

  // Mettre à jour le profil
  const updateProfile = async (profileData: ProfileData) => {
    if (!currentUser) {
      toast.error('Utilisateur non connecté');
      throw new Error('Utilisateur non connecté');
    }

    try {
      setError(null);
      
      // Forcer l'email à être celui de l'utilisateur
      const profileWithCorrectEmail = {
        ...profileData,
        email: currentUser.email!,
      };

      const profileRef = doc(db, 'profiles', currentUser.uid);
      await setDoc(profileRef, {
        ...profileWithCorrectEmail,
        onboardingDone: true,
        updatedAt: new Date(),
        uid: currentUser.uid,
      }, { merge: true });
      setProfile({ ...profileWithCorrectEmail, onboardingDone: true });
      toast.success('Profil mis à jour');
      console.log('✅ Profil sauvegardé');
    } catch (err) {
      const errorMsg = 'Erreur lors de la sauvegarde';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  };

  // Supprimer le profil
  const resetProfile = () => {
    setProfile(null);
    console.log('🗑️ Profil supprimé');
  };

  // Vérifier si le profil est complet
  const isProfileComplete = () => {
    if (!profile) return false;
    
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'location', 'position'];
    return requiredFields.every(field => {
      const value = profile[field as keyof ProfileData];
      return value && typeof value === 'string' && value.trim().length > 0;
    });
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        updateProfile,
        resetProfile,
        isProfileComplete,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}