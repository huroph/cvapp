// Utilitaires pour garantir l'unicité de la relation user-profil
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ProfileData {
  uid?: string;
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  bio: string;
  position: string;
  userType?: 'candidate' | 'recruiter';
  isComplete?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  emailSyncedAt?: Date;
}

export interface UserProfileRelation {
  isUnique: boolean;
  conflictingProfileId?: string;
  message: string;
}

/**
 * Vérifie l'unicité de la relation user-profil
 * Un utilisateur ne peut avoir qu'un seul profil avec son email
 */
export async function checkUserProfileUniqueness(
  userId: string, 
  userEmail: string
): Promise<UserProfileRelation> {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      const profileData = profileSnap.data() as ProfileData;
      
      // Vérifier que l'email correspond
      if (profileData.email === userEmail) {
        return {
          isUnique: true,
          message: `Profil unique valide pour l'utilisateur ${userId}`
        };
      } else {
        return {
          isUnique: false,
          conflictingProfileId: userId,
          message: `Email désynchronisé: profil=${profileData.email}, user=${userEmail}`
        };
      }
    } else {
      return {
        isUnique: true,
        message: `Aucun profil existant pour l'utilisateur ${userId}`
      };
    }
  } catch (error) {
    console.error('Erreur lors de la vérification d\'unicité:', error);
    return {
      isUnique: false,
      message: `Erreur de vérification: ${error}`
    };
  }
}

/**
 * Force la synchronisation email entre user et profil
 * L'email du profil DOIT être identique à celui de l'utilisateur
 */
export async function enforceEmailSync(
  userId: string, 
  userEmail: string
): Promise<boolean> {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      const profileData = profileSnap.data() as ProfileData;
      
      if (profileData.email !== userEmail) {
        // FORCER la synchronisation
        const syncedProfile = {
          ...profileData,
          email: userEmail,
          uid: userId, // S'assurer que le uid est correct
          userId: userId, // Référence explicite
          updatedAt: new Date(),
          emailSyncedAt: new Date(), // Timestamp de la synchronisation
        };

        await setDoc(profileRef, syncedProfile, { merge: true });
        
        console.log(`✅ Email forcé pour le profil ${userId}: ${userEmail}`);
        return true;
      } else {
        console.log(`✅ Email déjà synchronisé pour ${userId}: ${userEmail}`);
        return true;
      }
    } else {
      console.log(`⚠️ Aucun profil à synchroniser pour ${userId}`);
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation forcée:', error);
    return false;
  }
}

/**
 * Crée un profil vide lié à l'utilisateur avec email forcé
 */
export async function createLinkedProfile(
  userId: string,
  userEmail: string,
  userType: 'candidate' | 'recruiter' = 'candidate'
): Promise<ProfileData> {
  const newProfile: ProfileData = {
    uid: userId,
    userId: userId, // Référence explicite
    email: userEmail, // EMAIL FORCÉ depuis l'utilisateur
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    bio: '',
    position: '',
    userType: userType,
    isComplete: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    emailSyncedAt: new Date(),
  };

  const profileRef = doc(db, 'profiles', userId);
  await setDoc(profileRef, newProfile);
  
  console.log(`✅ Profil lié créé pour ${userId} avec email forcé: ${userEmail}`);
  return newProfile;
}

/**
 * Valide l'intégrité complète de la relation user-profil
 */
export async function validateUserProfileIntegrity(
  userId: string,
  userEmail: string
): Promise<{
  isValid: boolean;
  issues: string[];
  actions: string[];
}> {
  const issues: string[] = [];
  const actions: string[] = [];

  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      issues.push('Aucun profil trouvé pour cet utilisateur');
      actions.push('Créer un profil lié');
      return { isValid: false, issues, actions };
    }

    const profileData = profileSnap.data() as ProfileData;

    // Vérification 1: Email identique
    if (profileData.email !== userEmail) {
      issues.push(`Email désynchronisé: profil="${profileData.email}" vs user="${userEmail}"`);
      actions.push('Forcer la synchronisation de l\'email');
    }

    // Vérification 2: UID cohérent
    if (profileData.uid !== userId) {
      issues.push(`UID incohérent: profil="${profileData.uid}" vs user="${userId}"`);
      actions.push('Corriger le UID du profil');
    }

    // Vérification 3: Référence userId
    if (profileData.userId !== userId) {
      issues.push(`userId incohérent: profil="${profileData.userId}" vs user="${userId}"`);
      actions.push('Corriger la référence userId');
    }

    const isValid = issues.length === 0;
    
    if (isValid) {
      console.log(`✅ Intégrité validée pour ${userId}`);
    } else {
      console.log(`⚠️ Problèmes d'intégrité détectés pour ${userId}:`, issues);
    }

    return { isValid, issues, actions };
  } catch (error) {
    issues.push(`Erreur de validation: ${error}`);
    return { isValid: false, issues, actions };
  }
}