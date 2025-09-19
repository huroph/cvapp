// Types pour l'authentification et les profils
export interface UserData {
  uid: string;
  email: string;
  userType: 'candidate' | 'recruiter';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileData {
  uid?: string;
  userId?: string; // Référence explicite vers l'utilisateur
  email: string; // DOIT être identique à l'email de l'utilisateur
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  bio: string;
  position: string;
  avatar?: string;
  userType?: 'candidate' | 'recruiter';
  isComplete?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  emailSyncedAt?: Date; // Timestamp de la dernière synchronisation d'email
}

export type UserType = 'candidate' | 'recruiter';

export interface AuthContextType {
  currentUser: any;
  userData: UserData | null;
  userType: UserType | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

export interface ProfileContextType {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  updateProfile: (profileData: ProfileData) => Promise<void>;
  resetProfile: () => void;
  isProfileComplete: () => boolean;
}