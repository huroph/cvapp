import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';
import { CVService } from '../services/cvService';
import type { CVFirebase } from '../services/cvService';
import { useAuth } from './AuthContext';

interface CVContextType {
  cvs: CVFirebase[];
  selectedCV: CVFirebase | null;
  loading: boolean;
  error: string | null;
  selectCV: (cvId: string) => void;
  createCV: (cvData: Omit<CVFirebase, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCV: (id: string, cvData: Partial<CVFirebase>) => Promise<void>;
  deleteCV: (id: string) => Promise<void>;
  deleteAllCVs: () => Promise<void>;
  refreshCVs: () => Promise<void>;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

interface CVProviderProps {
  children: ReactNode;
}

export const CVProvider: React.FC<CVProviderProps> = ({ children }) => {
  const [cvs, setCvs] = useState<CVFirebase[]>([]);
  const [selectedCV, setSelectedCV] = useState<CVFirebase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Charger tous les CVs de l'utilisateur connecté
  const loadCVs = async () => {
    if (!currentUser) {
      setCvs([]);
      setSelectedCV(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const allCVs = await CVService.getAllCVs();
      // Filtrer les CVs de l'utilisateur connecté
      const userCVs = allCVs.filter(cv => cv.userId === currentUser.uid);
      setCvs(userCVs);
      
      // Sélectionner le premier CV par défaut s'il y en a
      if (userCVs.length > 0 && !selectedCV) {
        setSelectedCV(userCVs[0]);
      } else if (userCVs.length === 0) {
        setSelectedCV(null);
      }
    } catch (err) {
      setError('Erreur lors du chargement des CVs');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sélectionner un CV
  const selectCV = async (cvId: string) => {
    try {
      setError(null);
      const cv = await CVService.getCVById(cvId);
      if (cv) {
        setSelectedCV(cv);
      }
    } catch (err) {
      setError('Erreur lors de la sélection du CV');
      console.error('Erreur:', err);
    }
  };

  // Créer un nouveau CV
  const createCV = async (cvData: Omit<CVFirebase, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) {
      const errorMsg = 'Utilisateur non connecté';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      setError(null);
      // Ajouter l'ID utilisateur aux données du CV
      const cvDataWithUser = { ...cvData, userId: currentUser.uid };
      const newCVId = await CVService.createCV(cvDataWithUser);
      await refreshCVs();
      
      // Sélectionner le nouveau CV
      await selectCV(newCVId);
      // Toast de succès géré dans Sidebar.tsx
    } catch (err) {
      const errorMsg = 'Erreur lors de la création du CV';
      setError(errorMsg);
      console.error('Erreur:', err);
      throw err;
    }
  };

  // Mettre à jour un CV
  const updateCV = async (id: string, cvData: Partial<CVFirebase>) => {
    try {
      setError(null);
      await CVService.updateCV(id, cvData);
      await refreshCVs();
      
      // Recharger le CV sélectionné s'il a été modifié
      if (selectedCV && selectedCV.id === id) {
        await selectCV(id);
      }
      // Toast de succès géré dans Sidebar.tsx pour les cas spécifiques
    } catch (err) {
      const errorMsg = 'Erreur lors de la mise à jour du CV';
      setError(errorMsg);
      console.error('Erreur:', err);
      throw err;
    }
  };

  // Supprimer un CV
  const deleteCV = async (id: string) => {
    try {
      setError(null);
      await CVService.deleteCV(id);
      await refreshCVs();
      
      // Si le CV supprimé était sélectionné, sélectionner le premier CV disponible
      if (selectedCV && selectedCV.id === id) {
        const remainingCVs = cvs.filter(cv => cv.id !== id);
        setSelectedCV(remainingCVs.length > 0 ? remainingCVs[0] : null);
      }
      // Toast de succès géré dans Sidebar.tsx
    } catch (err) {
      const errorMsg = 'Erreur lors de la suppression du CV';
      setError(errorMsg);
      console.error('Erreur:', err);
      throw err;
    }
  };

  // Supprimer tous les CVs de l'utilisateur
  const deleteAllCVs = async () => {
    if (!currentUser) {
      const errorMsg = 'Utilisateur non connecté';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      setError(null);
      await CVService.deleteAllUserCVs(currentUser.uid);
      setCvs([]);
      setSelectedCV(null);
      // Toast de succès géré dans Sidebar.tsx
    } catch (err) {
      const errorMsg = 'Erreur lors de la suppression de tous les CVs';
      setError(errorMsg);
      console.error('Erreur:', err);
      throw err;
    }
  };

  // Actualiser la liste des CVs
  const refreshCVs = async () => {
    await loadCVs();
  };

  // Charger les CVs au montage du composant et quand l'utilisateur change
  useEffect(() => {
    loadCVs();
  }, [currentUser]); // Recharger quand l'utilisateur connecté change

  const value: CVContextType = {
    cvs,
    selectedCV,
    loading,
    error,
    selectCV,
    createCV,
    updateCV,
    deleteCV,
    deleteAllCVs,
    refreshCVs
  };

  return (
    <CVContext.Provider value={value}>
      {children}
    </CVContext.Provider>
  );
};

// Hook pour utiliser le contexte CV
export const useCV = (): CVContextType => {
  const context = useContext(CVContext);
  if (context === undefined) {
    throw new Error('useCV doit être utilisé dans un CVProvider');
  }
  return context;
};