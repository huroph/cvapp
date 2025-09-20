import { useState, useEffect } from 'react';
import { useCV } from "../contexts/CVContext";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/layout/Header";
import FormationCard from "../components/card/FormationCard";
import SkillCard from "../components/card/SkillCard";
import ExperienceCard from "../components/card/ExperienceCard";
import ShareCVSection from "../components/cv/ShareCVSection";
import CreateCVWizard from "../components/modals/CreateCVWizard";
import CVCaptureModal from "../components/modals/CVCaptureModal";
import { UserType } from "../types/user";
import { SharedCVService } from "../services/sharedCVService";
import toast from 'react-hot-toast';


export default function Home() {
  const { selectedCV, loading, error, createCV } = useCV();
  const { getUserType, currentUser } = useAuth();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [cvStats, setCvStats] = useState<{totalViews: number, accountsCreated: number} | null>(null);
  
  const userType = getUserType();

  // Charger les statistiques du CV
  useEffect(() => {
    const loadCVStats = async () => {
      if (selectedCV && currentUser) {
        try {
          const stats = await SharedCVService.getCandidateCVStats(currentUser.uid, selectedCV.id);
          if (stats) {
            setCvStats(stats);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des statistiques:', error);
        }
      }
    };

    loadCVStats();
  }, [selectedCV, currentUser]);

  const handleOpenWizard = () => {
    setIsWizardOpen(true);
  };

  const handleOpenCapture = () => {
    setIsCaptureModalOpen(true);
  };

  const handleWizardClose = () => {
    setIsWizardOpen(false);
  };

  const handleSaveCV = async (cvData: any) => {
    try {
      await createCV(cvData);
      setIsWizardOpen(false);
      toast.success('CV créé avec succès');
    } catch (error) {
      console.error('Erreur lors de la création du CV:', error);
      toast.error('Erreur lors de la création du CV');
    }
  };

  const handleCaptureData = async (cvData: any) => {
    try {
      await createCV(cvData);
      setIsCaptureModalOpen(false);
      toast.success('CV créé avec succès à partir du scan');
    } catch (error) {
      console.error('Erreur lors de la création du CV scanné:', error);
      toast.error('Erreur lors de la création du CV scanné');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des CVs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">Vérifiez votre configuration Firebase</p>
        </div>
      </div>
    );
  }

  if (!selectedCV) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Contenu Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center w-full text-center p-6">
          <img src="/Empty.png" alt="Aucun CV sélectionné" className="h-64 mb-6 mx-auto" />
          <p className="text-gray-600 mb-4 text-xl font-semibold">Aucun CV créé pour le moment</p>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Créez votre premier CV pour valoriser votre profil et postuler à des offres. Votre dossier de candidature commence ici !</p>
          <div className="flex gap-4 justify-center">
            <button
              className="px-6 py-3 bg-indigo-600 text-blue-500 rounded-lg font-semibold shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              onClick={handleOpenWizard}
            >
              <span className="inline-flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer mon CV
              </span>
            </button>
            <button
              onClick={handleOpenCapture}
              className="px-6 py-3 bg-green-600 text-green-500 rounded-lg font-semibold shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors flex items-center gap-2"
            >
              <span>📷</span>
              <span>Scanner un CV</span>
            </button>
          </div>
        </div>
        
        {/* Modals pour création/scan de CV */}
        <CreateCVWizard
          isOpen={isWizardOpen}
          onClose={handleWizardClose}
          onSave={handleSaveCV}
        />
        
        <CVCaptureModal
          isOpen={isCaptureModalOpen}
          onClose={() => setIsCaptureModalOpen(false)}
          onDataExtracted={handleCaptureData}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <Header 
        cvTitle={selectedCV?.basicInfo?.title || 'CV sans titre'} 
        viewCount={cvStats?.totalViews}
        authenticatedViewCount={cvStats?.accountsCreated}
      />

      {userType === UserType.CANDIDAT && (
            <ShareCVSection />
          )}
      
      {/* Contenu principal */}
      <div className="flex-1 grid grid-cols-5 gap-6 p-6 ">
        {/* Colonne principale */}
        <div className="col-span-2 flex flex-col gap-6 ">
          {/* Formation */}
          <FormationCard />
          
          {/* Compétence */}
          <SkillCard />
          
          {/* Section de partage CV pour les candidats */}
          
          
          
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-6 col-span-3 ">
          {/* Expérience */}
          <ExperienceCard />
        </div>
      </div>
    </div>
  );
}
