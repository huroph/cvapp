// Types centralisés pour l'application CV

// Interface de base pour toutes les entités
export interface BaseEntity {
  id: string;
}

// Informations de base d'un CV
export interface BasicInfo {
  title: string;
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  phone: string;
  location: string;
}

// Formation
export interface Formation extends BaseEntity {
  degree: string;
  school: string;
  location: string;
  startYear: string;
  endYear: string;
  description: string;
}

// Compétence
export interface Skill extends BaseEntity {
  name: string;
  category: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';
}

// Expérience professionnelle
export interface Experience extends BaseEntity {
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrentJob: boolean;
  description: string;
  achievements: string[];
  skills?: string[]; // Pour le legacy code
  duration?: string; // Pour le legacy code
}

// CV complet
export interface CV extends BaseEntity {
  basicInfo: BasicInfo;
  formations: Formation[];
  skills: Skill[];
  experiences: Experience[];
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Version Firebase du CV
export interface CVFirebase extends Omit<CV, 'createdAt' | 'updatedAt'> {
  createdAt?: any; // Firestore timestamp
  updatedAt?: any; // Firestore timestamp
}

// Profil utilisateur
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  location: string;
  bio: string;
  profilePicture?: string;
}

// Props pour les composants wizard
export interface WizardStepProps<T> {
  data: T;
  onChange: (data: T) => void;
}

export interface BasicInfoStepProps extends WizardStepProps<BasicInfo> {}
export interface FormationStepProps extends WizardStepProps<Formation[]> {}
export interface ExperienceStepProps extends WizardStepProps<Experience[]> {}
export interface SkillStepProps extends WizardStepProps<Skill[]> {}

// Props pour les composants modaux
export interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface FormationWizardProps extends WizardModalProps {
  formations: Formation[];
  onSave: (formations: Formation[]) => void;
}

export interface ExperienceWizardProps extends WizardModalProps {
  experiences: Experience[];
  onSave: (experiences: Experience[]) => void;
}

export interface SkillWizardProps extends WizardModalProps {
  skills: Skill[];
  onSave: (skills: Skill[]) => void;
}

export interface CreateCVWizardProps extends WizardModalProps {
  onSave?: (cvData: CVData) => void;
}

// Data pour la création de CV
export interface CVData {
  basicInfo: BasicInfo;
  formations: Formation[];
  experiences: Experience[];
  skills: Skill[];
}

// Props pour les composants d'items
export interface ExperienceItemProps {
  experience: Experience;
  skillColors: string[];
  skillLabels: { [key: string]: string };
}

// Props pour les composants de cartes
export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface ExperienceCardProps {}
export interface FormationCardProps {}
export interface SkillCardProps {}
export interface ProfilCardProps {}

// Props pour le dropdown CV
export interface CVDropdownProps {
  onCVSelect?: (cv: CV) => void;
}

// Context types
export interface CVContextType {
  cvs: CV[];
  selectedCV: CV | null;
  createCV: (cvData: CVData) => Promise<void>;
  updateCV: (id: string, cvData: CVData) => Promise<void>;
  deleteCV: (id: string) => Promise<void>;
  selectCV: (cv: CV) => void;
  loadCVs: () => Promise<void>;
}

export interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export interface ProfileContextType {
  profile: UserProfile | null;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  deleteProfile: () => Promise<void>;
  loading: boolean;
}

// Auto-fill data types
export interface AutoFillCVData {
  basicInfo: BasicInfo;
  formations: Formation[];
  skills: Skill[];
  experiences: Experience[];
}

// Common form props
export interface FormInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'password';
  required?: boolean;
  className?: string;
}

export interface FormTextareaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}