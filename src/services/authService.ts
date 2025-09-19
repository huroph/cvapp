import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserType } from '../types/user';
import { RecruiterService } from './recruiterService';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  shareId?: string; // ID du CV à ajouter automatiquement si inscription depuis SharedCVPage
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  userType: UserType;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  // Inscription simplifiée
  static async register(data: RegisterData): Promise<User> {
    try {
      console.log('🚀 Début inscription:', data.email, data.userType);
      
      // 1. Créer l'utilisateur Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      console.log('✅ Utilisateur Firebase créé:', user.uid);

      // 2. Mettre à jour le profil Firebase
      const displayName = `${data.firstName} ${data.lastName}`;
      await updateProfile(user, { displayName });
      console.log('✅ Profil Firebase mis à jour');

      // 3. Créer le document utilisateur dans Firestore
      const userData: UserData = {
        uid: user.uid,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName,
        userType: data.userType,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('✅ Document utilisateur Firestore créé');

      // 4. Créer un profil de base UNIQUE et LIÉ pour les candidats (pour déclencher l'onboarding)
      if (data.userType === UserType.CANDIDAT) {
        const profileData = {
          uid: user.uid, // Lien unique avec l'utilisateur
          userId: user.uid, // Référence explicite à l'utilisateur
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email, // MÊME email que l'utilisateur
          phone: '', // Vide pour déclencher l'onboarding
          location: '', // Vide pour déclencher l'onboarding
          position: '', // Vide pour déclencher l'onboarding
          bio: '',
          onboardingDone: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Utilisation de l'UID comme clé pour garantir l'unicité
        await setDoc(doc(db, 'profiles', user.uid), profileData);
  console.log("✅ Profil candidat incomplet créé et lié à l'utilisateur:", user.uid);
      }

      // 5. Pour les recruteurs, créer le profil recruteur et ajouter le CV si fourni
      if (data.userType === UserType.RECRUTEUR) {
        console.log('🏢 Création du profil recruteur pour:', user.uid);
        
        // Créer le profil recruteur de base
        const recruiterProfile = {
          uid: user.uid,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          savedCVs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await RecruiterService.createOrUpdateRecruiterProfile(user.uid, recruiterProfile);
        console.log('✅ Profil recruteur créé');

        // Si un shareId est fourni, ajouter automatiquement le CV à la liste
        if (data.shareId) {
          try {
            console.log('🔗 Ajout automatique du CV à la liste du recruteur:', data.shareId);
            await RecruiterService.saveCVToRecruiterList(user.uid, data.shareId);
            console.log('✅ CV automatiquement ajouté à la liste du nouveau recruteur');
          } catch (cvError) {
            console.error('⚠️ Erreur lors de l\'ajout automatique du CV (inscription réussie):', cvError);
            // Ne pas faire échouer l'inscription pour cette erreur
          }
        }
      }

      console.log('🎉 Inscription terminée avec succès');
      return user;
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      throw this.handleAuthError(error);
    }
  }

  // Connexion
  static async login(data: LoginData): Promise<User> {
    try {
      console.log('🚀 Début connexion:', data.email);
      
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      console.log('✅ Connexion réussie:', userCredential.user.uid);
      
      return userCredential.user;
    } catch (error: any) {
      console.error('❌ Erreur lors de la connexion:', error);
      throw this.handleAuthError(error);
    }
  }

  // Déconnexion
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
      console.log('✅ Déconnexion réussie');
    } catch (error: any) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      throw this.handleAuthError(error);
    }
  }

  // Récupérer les données utilisateur depuis Firestore
  static async getUserData(uid: string): Promise<UserData | null> {
    try {
      console.log('🔍 Récupération données utilisateur:', uid);
      
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        console.log('✅ Données utilisateur récupérées:', data.userType);
        return data;
      }
      
      console.log('❌ Aucune donnée utilisateur trouvée');
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }

  // Gestion des erreurs
  private static handleAuthError(error: any): Error {
    let message = 'Une erreur inattendue s\'est produite';

    switch (error.code) {
      case 'auth/user-not-found':
        message = 'Aucun utilisateur trouvé avec cet email';
        break;
      case 'auth/wrong-password':
        message = 'Mot de passe incorrect';
        break;
      case 'auth/email-already-in-use':
        message = 'Cet email est déjà utilisé';
        break;
      case 'auth/weak-password':
        message = 'Le mot de passe est trop faible';
        break;
      case 'auth/invalid-email':
        message = 'Email invalide';
        break;
      case 'auth/too-many-requests':
        message = 'Trop de tentatives. Réessayez plus tard';
        break;
      default:
        message = error.message || message;
    }

    return new Error(message);
  }
}