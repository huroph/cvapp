// Service pour gérer les actions spécifiques aux recruteurs
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SharedCVService } from './sharedCVService';

export interface RecruiterProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  position?: string;
  savedCVs: string[]; // IDs des CVs sauvegardés
  createdAt: Date;
  updatedAt: Date;
}

export class RecruiterService {
  /**
   * Créer ou mettre à jour le profil recruteur
   */
  static async createOrUpdateRecruiterProfile(uid: string, data: Partial<RecruiterProfile>): Promise<void> {
    const recruiterRef = doc(db, 'recruiters', uid);
    
    const recruiterData = {
      uid,
      ...data,
      savedCVs: data.savedCVs || [],
      updatedAt: new Date(),
      createdAt: data.createdAt || new Date(),
    };

    await setDoc(recruiterRef, recruiterData, { merge: true });
    console.log('✅ Profil recruteur créé/mis à jour pour:', uid);
  }

  /**
   * Récupérer le profil recruteur
   */
  static async getRecruiterProfile(uid: string): Promise<RecruiterProfile | null> {
    try {
      const recruiterRef = doc(db, 'recruiters', uid);
      const recruiterSnap = await getDoc(recruiterRef);

      if (recruiterSnap.exists()) {
        return recruiterSnap.data() as RecruiterProfile;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors du chargement du profil recruteur:', error);
      return null;
    }
  }

  /**
   * Ajouter un CV à la liste des CVs sauvegardés du recruteur
   */
  static async saveCVToRecruiterList(recruiterUid: string, shareId: string): Promise<void> {
    try {
      // Vérifier que le CV partagé existe
      const sharedCV = await SharedCVService.getSharedCV(shareId);
      if (!sharedCV) {
        throw new Error('CV partagé non trouvé');
      }

      // Récupérer le profil recruteur
      let recruiterProfile = await this.getRecruiterProfile(recruiterUid);
      
      if (!recruiterProfile) {
        // Créer un profil basique si il n'existe pas
        recruiterProfile = {
          uid: recruiterUid,
          email: '',
          firstName: '',
          lastName: '',
          savedCVs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      // Ajouter le CV à la liste si pas déjà présent
      if (!recruiterProfile.savedCVs.includes(shareId)) {
        recruiterProfile.savedCVs.push(shareId);
        await this.createOrUpdateRecruiterProfile(recruiterUid, recruiterProfile);
        
        // Enregistrer la consultation dans SharedCVService
        await SharedCVService.recordCVView(shareId, recruiterUid, recruiterProfile.email);
        
        console.log('✅ CV ajouté à la liste du recruteur:', shareId);
      } else {
        console.log('ℹ️ CV déjà dans la liste du recruteur');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du CV:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les CVs sauvegardés par un recruteur
   */
  static async getRecruiterSavedCVs(recruiterUid: string) {
    try {
      const recruiterProfile = await this.getRecruiterProfile(recruiterUid);
      if (!recruiterProfile || recruiterProfile.savedCVs.length === 0) {
        return [];
      }

      // Récupérer les détails de chaque CV sauvegardé
      const savedCVs = await Promise.all(
        recruiterProfile.savedCVs.map(async (shareId) => {
          const sharedCV = await SharedCVService.getSharedCV(shareId);
          return sharedCV ? { ...sharedCV, shareId } : null;
        })
      );

      // Filtrer les CVs qui n'existent plus
      return savedCVs.filter(cv => cv !== null);
    } catch (error) {
      console.error('Erreur lors du chargement des CVs sauvegardés:', error);
      return [];
    }
  }

  /**
   * Retirer un CV de la liste des CVs sauvegardés
   */
  static async removeCVFromRecruiterList(recruiterUid: string, shareId: string): Promise<void> {
    try {
      const recruiterProfile = await this.getRecruiterProfile(recruiterUid);
      if (!recruiterProfile) return;

      recruiterProfile.savedCVs = recruiterProfile.savedCVs.filter(id => id !== shareId);
      await this.createOrUpdateRecruiterProfile(recruiterUid, recruiterProfile);
      
      console.log('✅ CV retiré de la liste du recruteur:', shareId);
    } catch (error) {
      console.error('Erreur lors de la suppression du CV:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un recruteur a déjà sauvegardé un CV
   */
  static async hasRecruiterSavedCV(recruiterUid: string, shareId: string): Promise<boolean> {
    try {
      const recruiterProfile = await this.getRecruiterProfile(recruiterUid);
      return recruiterProfile ? recruiterProfile.savedCVs.includes(shareId) : false;
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return false;
    }
  }
}