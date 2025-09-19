import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPinIcon, EnvelopeIcon, XMarkIcon, ShareIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useProfile } from '../contexts/ProfileContext';
import { useCV } from '../contexts/CVContext';
import { useAuth } from '../contexts/AuthContext';
import { SharedCVService } from '../services/sharedCVService';

export default function CVPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  const { selectedCV } = useCV();
  const { currentUser } = useAuth();
  const [mockSharedCV, setMockSharedCV] = useState<any>(null);
  const [cvStats, setCvStats] = useState<{totalViews: number, accountsCreated: number, lastViewed?: Date} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareUrl, setShowShareUrl] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showManualCopy, setShowManualCopy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Créer un objet mock SharedCV basé sur les données actuelles
    if (profile && selectedCV && currentUser) {
      const mock = {
        id: 'preview',
        candidateId: currentUser.uid,
        candidateName: `${profile.firstName} ${profile.lastName}`,
        candidateEmail: profile.email,
        candidateLocation: profile.location || '',
        candidatePosition: profile.position || '',
        candidateBio: profile.bio || '',
        cvData: selectedCV,
        shareUrl: '#',
        createdAt: new Date(),
        viewedBy: [],
        totalViews: 0,
        accountsCreated: 0
      };
      setMockSharedCV(mock);

      // Charger les vraies statistiques du CV
      const loadCVStats = async () => {
        try {
          const stats = await SharedCVService.getCandidateCVStats(currentUser.uid, selectedCV.id);
          if (stats) {
            setCvStats(stats);
            // Mettre à jour l'objet mock avec les vraies statistiques
            setMockSharedCV((prev: any) => ({
              ...prev,
              totalViews: stats.totalViews,
              accountsCreated: stats.accountsCreated,
              lastViewed: stats.lastViewed
            }));
          }
        } catch (error) {
          console.error('Erreur lors du chargement des statistiques:', error);
        }
      };

      loadCVStats();
      
      // Rafraîchir les stats toutes les 5 secondes si on est sur cette page
      const interval = setInterval(loadCVStats, 5000);
      
      return () => clearInterval(interval);
    }
  }, [profile, selectedCV, currentUser]);

  const handleClose = () => {
    // Retourner à la page précédente ou à la home
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate('/');
    }
  };

  const handleGenerateAndCopyLink = async () => {
    if (!currentUser || !profile || !selectedCV) {
      setError('Données manquantes pour générer le lien');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      
      const url = await SharedCVService.generateShareableLink(
        currentUser.uid,
        selectedCV,
        profile,
        selectedCV.id // Ajouter l'ID du CV pour générer un lien unique
      );
      
      setShareUrl(url);
      setShowShareUrl(true);
      
      // Recharger les statistiques après génération du lien pour avoir les données à jour
      try {
        const updatedStats = await SharedCVService.getCandidateCVStats(currentUser.uid, selectedCV.id);
        if (updatedStats) {
          setCvStats(updatedStats);
          setMockSharedCV((prev: any) => ({
            ...prev,
            totalViews: updatedStats.totalViews,
            accountsCreated: updatedStats.accountsCreated,
            lastViewed: updatedStats.lastViewed
          }));
        }
      } catch (statsError) {
        console.error('Erreur lors du rechargement des statistiques:', statsError);
      }
      
      // Masquer le lien après 8 secondes
      setTimeout(() => {
        setShowShareUrl(false);
        setShareUrl('');
      }, 8000);
      
      // Tentative de copie automatique
      try {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        toast.success('Lien généré et copié dans le presse-papiers !');
        
        // Remettre le texte original après 3 secondes
        setTimeout(() => {
          setIsCopied(false);
        }, 3000);
      } catch (copyError) {
        // Si la copie automatique échoue, afficher l'option manuelle
        setShowManualCopy(true);
        toast.success('Lien généré ! Utilisez le bouton ci-dessous pour copier.');
        
        // Masquer l'option manuelle après 5 secondes
        setTimeout(() => {
          setShowManualCopy(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la génération du lien. Veuillez réessayer.');
      toast.error('Erreur lors de la génération du lien');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualCopy = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setShowManualCopy(false);
      toast.success('Lien copié dans le presse-papiers !');
    } catch (err) {
      // Fallback si l'API clipboard échoue
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setIsCopied(true);
        setShowManualCopy(false);
        toast.success('Lien copié dans le presse-papiers !');
      } catch (fallbackErr) {
        toast.error('Impossible de copier le lien automatiquement');
      }
      document.body.removeChild(textArea);
    }
  };

  if (!mockSharedCV) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de preview avec bouton fermer */}
      <div className="sticky top-0 z-20 bg-indigo-600 text-white p-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">👁️ Preview CV</span>
            <span className="text-xs bg-indigo-500 px-2 py-1 rounded-full">
              Voici ce que verront les recruteurs
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Bouton de partage */}
            <motion.button
              onClick={handleGenerateAndCopyLink}
              disabled={isGenerating}
              className="flex items-center text-black gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-400 rounded-md transition-colors text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Génération...</span>
                </>
              ) : isCopied ? (
                <>
                  <ClipboardDocumentIcon className="h-4 w-4" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <ShareIcon className="h-4 w-4" />
                  <span>Partager</span>
                </>
              )}
            </motion.button>
            
            <button
              onClick={handleClose}
              className="flex items-center text-black gap-2 px-3 py-1 bg-indigo-500 hover:bg-indigo-400 rounded-md transition-colors text-sm"
            >
              <XMarkIcon className="h-4 w-4" />
              Fermer la preview
            </button>
          </div>
        </div>
      </div>

      {/* Zone d'affichage du lien généré */}
      <AnimatePresence>
        {shareUrl && showShareUrl && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-green-50 border-b border-green-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto p-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-green-800 mb-2">
                      🎉 Lien de partage généré avec succès !
                    </h3>
                    <div className="bg-gray-50 rounded-md p-3 border">
                      <p className="text-xs text-gray-600 mb-1">Votre lien de partage :</p>
                      <p className="text-sm text-gray-800 font-mono break-all">{shareUrl}</p>
                    </div>
                    
                    {/* Bouton de copie manuelle si nécessaire */}
                    <AnimatePresence>
                      {showManualCopy && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-3 flex justify-start"
                        >
                          <button
                            onClick={handleManualCopy}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs flex items-center gap-1 transition-colors"
                          >
                            <ClipboardDocumentIcon className="h-3 w-3" />
                            Copier le lien
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="mt-3 text-xs text-green-700 bg-green-50 rounded-md p-2">
                  💡 <strong>Partagez ce lien</strong> avec les recruteurs pour qu'ils consultent votre CV. 
                  Le lien restera actif et vous pourrez suivre les consultations.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone d'erreur */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-red-50 border-b border-red-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto p-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-red-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">⚠</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800 mb-1">Erreur</h3>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-4">
        {/* Header compact */}
        <div className="flex  gap-4 ">
        <div className="bg-white rounded-lg shadow-md mb-4 p-4 border-l-4 border-indigo-500">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 truncate">{mockSharedCV.candidateName}</h1>
                  <p className="text-lg text-indigo-600 font-medium truncate">{selectedCV?.basicInfo?.title || 'CV sans titre'}</p>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <EnvelopeIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">{mockSharedCV.candidateEmail}</span>
                  </div>
                  {mockSharedCV.candidateLocation && (
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">{mockSharedCV.candidateLocation}</span>
                    </div>
                  )}
                  
                </div>
              </div>
            </div>
            
            {/* Message info preview */}
            
          </div>
        </div> 
        <div className="bg-white flex-1 rounded-lg shadow-sm p-4 mb-4 border-l-4 border-gray-400">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">📊 Statistiques</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Total des vues:</span>
                  <div className="text-xs px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1">
                    <span>👁️</span>
                    <span className="font-medium">{mockSharedCV.totalViews}</span>
                    <span className="text-gray-500">
                      {mockSharedCV.totalViews === 0 ? 'Aucune vue' : 
                       mockSharedCV.totalViews === 1 ? 'vue' : 'vues'}
                    </span>
                    {mockSharedCV.accountsCreated > 0 && (
                      <>
                        <span className="text-gray-400">|</span>
                        <span className="text-green-600 font-medium">{mockSharedCV.accountsCreated}</span>
                        <span className="text-green-600 text-xs">comptes créés</span>
                      </>
                    )}
                  </div>
                </div>
               
                {(cvStats?.lastViewed || mockSharedCV.lastViewed) && mockSharedCV.totalViews > 0 && (
                  <div className="flex justify-between">
                    <span>Dernière consultation:</span>
                    <span className="font-medium text-xs">
                      {(() => {
                        const lastViewedDate = cvStats?.lastViewed || mockSharedCV.lastViewed;
                        if (!lastViewedDate) return 'Aucune';
                        
                        let date;
                        // Gérer les différents formats de date (Firebase Timestamp, Date, string)
                        if (lastViewedDate && typeof lastViewedDate === 'object') {
                          // Si c'est un Timestamp Firebase, utiliser toDate()
                          if ('toDate' in lastViewedDate && typeof lastViewedDate.toDate === 'function') {
                            date = lastViewedDate.toDate();
                          } 
                          // Si c'est déjà un objet Date
                          else if (lastViewedDate instanceof Date) {
                            date = lastViewedDate;
                          }
                          // Si c'est un objet avec seconds/nanoseconds (format Firebase)
                          else if ('seconds' in lastViewedDate) {
                            date = new Date(lastViewedDate.seconds * 1000);
                          }
                          else {
                            date = new Date(lastViewedDate);
                          }
                        } else {
                          // Si c'est une string ou autre
                          date = new Date(lastViewedDate);
                        }
                        
                        if (!date || isNaN(date.getTime())) {
                          console.log('Date invalide:', lastViewedDate);
                          return 'Date invalide';
                        }
                        
                        return date.toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      })()}
                    </span>
                  </div>
                )}
                {mockSharedCV.totalViews === 0 && (
                  <div className="flex justify-between">
                    <span>Statut:</span>
                    <span className="font-medium text-xs text-blue-600">
                      📝 Lien créé - En attente de consultation
                    </span>
                  </div>
                )}
                
              </div>
            </div>
        </div>

        {/* Layout en colonnes pour optimiser l'espace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Colonne principale - Expériences (priorité recruteur) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Bio en une ligne si présente */}
            {mockSharedCV.candidateBio && (
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">💬 Présentation</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{mockSharedCV.candidateBio}</p>
              </div>
            )}

            {/* Expériences - Section prioritaire */}
            {mockSharedCV.cvData.experiences?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  💼 Expérience professionnelle
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {mockSharedCV.cvData.experiences.length} poste{mockSharedCV.cvData.experiences.length > 1 ? 's' : ''}
                  </span>
                </h2>
                <div className="space-y-4">
                  {mockSharedCV.cvData.experiences.map((experience: any, index: number) => (
                    <div key={index} className="relative bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{experience.position}</h3>
                          <p className="text-green-600 font-medium truncate">{experience.company}</p>
                        </div>
                        <div className="text-right text-xs text-gray-500 ml-4">
                          <div>{experience.startDate} - {experience.isCurrentJob ? 'Actuel' : experience.endDate}</div>
                          {experience.location && <div className="text-gray-400">{experience.location}</div>}
                        </div>
                      </div>
                      {experience.description && (
                        <p className="text-gray-700 text-sm mt-2 line-clamp-2">{experience.description}</p>
                      )}
                      {experience.achievements?.length > 0 && (
                        <div className="mt-2">
                          <details className="text-sm">
                            <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800">
                              Voir les réalisations ({experience.achievements.length})
                            </summary>
                            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                              {experience.achievements.map((achievement: string, idx: number) => (
                                <li key={idx} className="text-xs">{achievement}</li>
                              ))}
                            </ul>
                          </details>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale - Formations et Compétences */}
          <div className="space-y-4">
            
            {/* Compétences - Vue condensée */}
            {mockSharedCV.cvData.skills?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🛠️ Compétences
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {mockSharedCV.cvData.skills.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {Object.entries(mockSharedCV.cvData.skills.reduce((acc: any, skill: any) => {
                    const category = skill.category || 'Autres';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(skill);
                    return acc;
                  }, {})).map(([category, skills]: [string, any]) => (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">{category}</h4>
                      <div className="flex flex-wrap gap-1">
                        {skills.map((skill: any, index: number) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                          >
                            {skill.name}
                            <span className="text-xs text-blue-600 font-medium">{skill.level}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formations - Vue condensée */}
            {mockSharedCV.cvData.formations?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-indigo-500">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🎓 Formation
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                    {mockSharedCV.cvData.formations.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {mockSharedCV.cvData.formations.map((formation: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{formation.degree}</h3>
                      <p className="text-indigo-600 font-medium text-sm">{formation.school}</p>
                      <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                        <span>{formation.startYear} - {formation.endYear}</span>
                        {formation.location && <span>{formation.location}</span>}
                      </div>
                      {formation.description && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-800">
                            Détails
                          </summary>
                          <p className="text-xs text-gray-600 mt-1">{formation.description}</p>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informations du CV */}
            
          </div>
        </div>
      </div>
    </div>
  );
}