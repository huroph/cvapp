import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Interface pour les données CV dans Firebase
export interface CVFirebase {
  id?: string;
  userId?: string; // ID de l'utilisateur propriétaire du CV
  basicInfo: {
    title: string;
    firstName: string;
    lastName: string;
    position: string;
    email: string;
    phone: string;
    location: string;
  };
  formations: Array<{
    id: string;
    degree: string;
    school: string;
    location: string;
    startYear: string;
    endYear: string;
    description: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    category: string;
    level: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';
  }>;
  experiences: Array<{
    id: string;
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrentJob: boolean;
    description: string;
    achievements: string[];
  }>;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const CVS_COLLECTION = 'cvs';

// Service pour gérer les CVs dans Firestore
export class CVService {
  // Récupérer tous les CVs
  static async getAllCVs(): Promise<CVFirebase[]> {
    try {
      const q = query(collection(db, CVS_COLLECTION), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CVFirebase));
    } catch (error) {
      console.error('Erreur lors de la récupération des CVs:', error);
      throw error;
    }
  }

  // Récupérer un CV par ID
  static async getCVById(id: string): Promise<CVFirebase | null> {
    try {
      const docRef = doc(db, CVS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as CVFirebase;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du CV:', error);
      throw error;
    }
  }

  // Créer un nouveau CV
  static async createCV(cvData: Omit<CVFirebase, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, CVS_COLLECTION), {
        ...cvData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création du CV:', error);
      throw error;
    }
  }

  // Mettre à jour un CV
  static async updateCV(id: string, cvData: Partial<CVFirebase>): Promise<void> {
    try {
      const docRef = doc(db, CVS_COLLECTION, id);
      await updateDoc(docRef, {
        ...cvData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du CV:', error);
      throw error;
    }
  }

  // Supprimer un CV
  static async deleteCV(id: string): Promise<void> {
    try {
      const docRef = doc(db, CVS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erreur lors de la suppression du CV:', error);
      throw error;
    }
  }

  // Supprimer tous les CVs d'un utilisateur
  static async deleteAllUserCVs(userId: string): Promise<void> {
    try {
      const allCVs = await this.getAllCVs();
      const userCVs = allCVs.filter(cv => cv.userId === userId);
      
      // Supprimer tous les CVs de l'utilisateur
      const deletePromises = userCVs.map(cv => this.deleteCV(cv.id!));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Erreur lors de la suppression de tous les CVs:', error);
      throw error;
    }
  }

  // Récupérer un résumé des CVs (titre + id seulement)
  static async getCVSummaries(): Promise<{ id: string; title: string }[]> {
    try {
      const allCVs = await this.getAllCVs();
      return allCVs.map(cv => ({
        id: cv.id!,
        title: cv.basicInfo.title
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des résumés de CVs:', error);
      throw error;
    }
  }
}