import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SharedCV {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateLocation: string;
  candidatePosition: string;
  candidateBio: string;
  cvData: any; // Les données complètes du CV
  shareUrl: string;
  createdAt: Date;
  lastUpdated?: Date; // Dernière mise à jour du CV ou du lien
  lastViewed?: Date; // Dernière consultation par un recruteur
  viewedBy: string[]; // Liste des UIDs/IPs des visiteurs qui ont vu ce CV
  totalViews: number; // Nombre total de consultations (uniques)
  accountsCreated: number; // Nombre de comptes créés suite à la consultation de ce CV
}

export interface SharedCVView {
  sharedCvId: string;
  visitorId: string;
  visitorEmail: string;
  isUniqueView: boolean; // Indique si c'est la première vue de ce visiteur
  viewedAt: Date;
  userAgent?: string; // Pour analytics
}

export class SharedCVService {
  // Générer un lien partagé pour un CV spécifique
  static async generateShareableLink(candidateId: string, cvData: any, candidateProfile: any, cvId?: string): Promise<string> {
    try {
      // Utiliser un ID qui combine candidat + CV pour des liens uniques par CV
      // Si cvId n'est pas fourni, utiliser l'ancien format pour compatibilité
      const shareId = cvId ? `cv_${candidateId}_${cvId}` : `cv_${candidateId}`;
      
      // Vérifier si un CV partagé existe déjà
      const existingDoc = await getDoc(doc(db, 'shared_cvs', shareId));
      
      const sharedCVData: Omit<SharedCV, 'id'> = {
        candidateId,
        candidateName: `${candidateProfile.firstName} ${candidateProfile.lastName}`,
        candidateEmail: candidateProfile.email,
        candidateLocation: candidateProfile.location || '',
        candidatePosition: candidateProfile.position || '',
        candidateBio: candidateProfile.bio || '',
        cvData, // Toujours mettre à jour avec les dernières données du CV
        shareUrl: `${window.location.origin}/cv/${shareId}`,
        createdAt: existingDoc.exists() ? existingDoc.data()?.createdAt : new Date(),
        viewedBy: existingDoc.exists() ? existingDoc.data()?.viewedBy || [] : [],
        totalViews: existingDoc.exists() ? existingDoc.data()?.totalViews || 0 : 0,
        accountsCreated: existingDoc.exists() ? existingDoc.data()?.accountsCreated || 0 : 0
      };

      // Mettre à jour ou créer le document (préservation des vues)
      await setDoc(doc(db, 'shared_cvs', shareId), {
        ...sharedCVData,
        id: shareId,
        lastUpdated: new Date() // Garder une trace de la dernière mise à jour
      }, { merge: true }); // merge: true préserve les champs existants non spécifiés

      return sharedCVData.shareUrl;
    } catch (error) {
      console.error('Erreur lors de la génération du lien partagé:', error);
      throw new Error('Impossible de générer le lien partagé');
    }
  }

  // Récupérer un CV partagé par son ID
  static async getSharedCV(shareId: string): Promise<SharedCV | null> {
    try {
      const cvDoc = await getDoc(doc(db, 'shared_cvs', shareId));
      
      if (cvDoc.exists()) {
        return cvDoc.data() as SharedCV;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du CV partagé:', error);
      throw new Error('Impossible de récupérer le CV');
    }
  }

  // Enregistrer la consultation d'un CV par un visiteur (anonyme ou connecté)
  static async recordCVView(shareId: string, visitorId: string, visitorEmail: string = 'anonymous@visitor'): Promise<void> {
    try {
      const sharedCVRef = doc(db, 'shared_cvs', shareId);
      const currentDoc = await getDoc(sharedCVRef);
      const currentData = currentDoc.data();
      
      // Vérifier si ce visiteur a déjà vu ce CV (éviter les doublons)
      const viewedBy = currentData?.viewedBy || [];
      const hasAlreadyViewed = viewedBy.includes(visitorId);
      
      const updates: any = {
        lastViewed: new Date() // Toujours mettre à jour la dernière vue
      };
      
      // Incrémenter le compteur seulement si c'est une nouvelle vue
      if (!hasAlreadyViewed) {
        updates.viewedBy = arrayUnion(visitorId);
        updates.totalViews = (currentData?.totalViews || 0) + 1;
      }
      
      await updateDoc(sharedCVRef, updates);

      // Enregistrer la vue dans la collection des vues pour analytics détaillés
      await addDoc(collection(db, 'cv_views'), {
        sharedCvId: shareId,
        visitorId,
        visitorEmail,
        isUniqueView: !hasAlreadyViewed,
        viewedAt: new Date(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
      });

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la consultation:', error);
      throw new Error('Impossible d\'enregistrer la consultation');
    }
  }

  // Récupérer tous les CVs consultés par un recruteur (basé sur cv_views)
  static async getRecruiterViewedCVs(recruiterId: string): Promise<SharedCV[]> {
    try {
      // Récupérer toutes les vues de ce recruteur depuis la collection cv_views
      const viewsQuery = await getDocs(
        query(
          collection(db, 'cv_views'),
          where('visitorId', '==', recruiterId)
        )
      );

      // Extraire les IDs uniques des CVs consultés
      const uniqueCVIds = [...new Set(
        viewsQuery.docs.map(doc => doc.data().sharedCvId)
      )];

      // Récupérer les détails de chaque CV
      const cvPromises = uniqueCVIds.map((cvId: string) => 
        getDoc(doc(db, 'shared_cvs', cvId))
      );

      const cvDocs = await Promise.all(cvPromises);
      return cvDocs
        .filter(doc => doc.exists())
        .map(doc => doc.data() as SharedCV);

    } catch (error) {
      console.error('Erreur lors de la récupération des CVs consultés:', error);
      throw new Error('Impossible de récupérer les CVs consultés');
    }
  }

  // Enregistrer qu'un utilisateur a créé un compte après avoir vu un CV
  static async recordAccountCreatedFromCV(shareId: string, newUserId: string, userEmail: string): Promise<void> {
    try {
      const sharedCVRef = doc(db, 'shared_cvs', shareId);
      const currentDoc = await getDoc(sharedCVRef);
      const currentData = currentDoc.data();
      
      // Incrémenter le compteur de comptes créés
      await updateDoc(sharedCVRef, {
        accountsCreated: (currentData?.accountsCreated || 0) + 1
      });

      // Enregistrer l'événement pour analytics
      await addDoc(collection(db, 'cv_conversions'), {
        sharedCvId: shareId,
        convertedUserId: newUserId,
        convertedUserEmail: userEmail,
        convertedAt: new Date(),
        candidateId: currentData?.candidateId
      });

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la conversion:', error);
      throw new Error('Impossible d\'enregistrer la conversion');
    }
  }

  // Récupérer les statistiques du CV d'un candidat (pour un CV spécifique ou le CV principal)
  static async getCandidateCVStats(candidateId: string, cvId?: string): Promise<{totalViews: number, accountsCreated: number, lastViewed?: Date} | null> {
    try {
      // Utiliser le même format que pour la génération de lien
      const shareId = cvId ? `cv_${candidateId}_${cvId}` : `cv_${candidateId}`;
      const cvDoc = await getDoc(doc(db, 'shared_cvs', shareId));
      
      if (cvDoc.exists()) {
        const data = cvDoc.data();
        return {
          totalViews: data.totalViews || 0,
          accountsCreated: data.accountsCreated || 0,
          lastViewed: data.lastViewed
        };
      }
      
      return {
        totalViews: 0,
        accountsCreated: 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  }

  // Vérifier si un CV partagé existe pour un candidat (CV spécifique ou principal)
  static async getCandidateSharedCV(candidateId: string, cvId?: string): Promise<SharedCV | null> {
    try {
      const shareId = cvId ? `cv_${candidateId}_${cvId}` : `cv_${candidateId}`;
      return await this.getSharedCV(shareId);
    } catch (error) {
      console.error('Erreur lors de la récupération du CV candidat:', error);
      return null;
    }
  }
}