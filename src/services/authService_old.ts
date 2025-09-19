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

export interface AuthUser extends User {
  displayName: string | null;
  email: string | null;
  uid: string;
  userType?: UserType;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: UserType;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  // Connexion
  static async login(data: LoginData): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      return userCredential.user as AuthUser;
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      throw this.handleAuthError(error);
    }
  }

  // Inscription
  static async register(data: RegisterData): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Mettre à jour le profil avec le nom d'affichage
      const displayName = `${data.firstName} ${data.lastName}`;
      await updateProfile(user, { displayName });

      // Créer le document utilisateur dans Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName,
        userType: data.userType,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Créer un profil de base vide pour les candidats (pour déclencher l'onboarding)
      if (data.userType === UserType.CANDIDAT) {
        await setDoc(doc(db, 'profiles', user.uid), {
          uid: user.uid,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: '',
          location: '',
          position: '',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      return { ...user, displayName } as AuthUser;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      throw this.handleAuthError(error);
    }
  }

  // Déconnexion
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      throw this.handleAuthError(error);
    }
  }

  // Récupérer les données utilisateur depuis Firestore
  static async getUserData(uid: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      throw error;
    }
  }

  // Gestion des erreurs d'authentification
  private static handleAuthError(error: any): Error {
    switch (error.code) {
      case 'auth/user-not-found':
        return new Error('Aucun utilisateur trouvé avec cet email');
      case 'auth/wrong-password':
        return new Error('Mot de passe incorrect');
      case 'auth/email-already-in-use':
        return new Error('Cet email est déjà utilisé');
      case 'auth/weak-password':
        return new Error('Le mot de passe doit contenir au moins 6 caractères');
      case 'auth/invalid-email':
        return new Error('Email invalide');
      case 'auth/too-many-requests':
        return new Error('Trop de tentatives. Réessayez plus tard');
      default:
        return new Error(error.message || 'Une erreur est survenue');
    }
  }
}