import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPinIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { SharedCVService, type SharedCV } from '../services/sharedCVService';
import { RecruiterService } from '../services/recruiterService';
import { useAuth } from '../contexts/AuthContext';
import { UserType } from '../types/user';

export default function SharedCVPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { currentUser, getUserType } = useAuth();
  const [sharedCV, setSharedCV] = useState<SharedCV | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedCV = async () => {
      if (!shareId) {
        setError('ID de CV manquant');
        setLoading(false);
        return;
      }

      try {
        const cv = await SharedCVService.getSharedCV(shareId);
        if (!cv) {
          setError('CV non trouvé ou lien expiré');
        } else {
          setSharedCV(cv);

          // Enregistrer la consultation 
          try {
            if (currentUser) {
              // Utilisateur connecté (candidat ou recruteur)
              await SharedCVService.recordCVView(
                shareId,
                currentUser.uid,
                currentUser.email || ''
              );
            } else {
              // Visiteur anonyme - utiliser une ID unique basée sur la session
              const anonymousId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              await SharedCVService.recordCVView(
                shareId,
                anonymousId,
                'anonymous@visitor.com'
              );
            }
          } catch (viewError) {
            console.error('Erreur lors de l\'enregistrement de la vue:', viewError);
            // Ne pas bloquer l'affichage si l'enregistrement échoue
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement du CV:', err);
        setError('Erreur lors du chargement du CV');
      } finally {
        setLoading(false);
      }
    };

    loadSharedCV();
  }, [shareId, currentUser, getUserType]);

  const handleCreateRecruiterAccount = () => {
    const currentPath = `/shared/${shareId}`;
    navigate(`/register?userType=RECRUTEUR&returnTo=${encodeURIComponent(currentPath)}&shareId=${shareId}`);
  }; const handleViewSavedCVs = () => {
    navigate('/recruiter/dashboard');
  };

  const handleAddToMyList = async () => {
    if (!currentUser || !shareId) return;

    // Vérifier que l'utilisateur est bien un recruteur
    const userType = getUserType();
    if (userType !== UserType.RECRUTEUR) {
      toast.error('Seuls les recruteurs peuvent ajouter des CVs à leur liste');
      handleCreateRecruiterAccount();
      return;
    }

    try {
      // Utiliser le service recruteur pour sauvegarder le CV
      await RecruiterService.saveCVToRecruiterList(currentUser.uid, shareId);
      toast.success('CV ajouté à votre liste de recruteur !');

      // Rediriger automatiquement vers le dashboard recruteur
      setTimeout(() => {
        navigate('/recruiter/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast.error('Erreur lors de l\'ajout du CV');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du CV...</p>
        </div>
      </div>
    );
  }

  if (error || !sharedCV) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">CV non disponible</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isRecruiter = currentUser && getUserType() === UserType.RECRUTEUR;
  const isCandidate = currentUser && getUserType() === UserType.CANDIDAT;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header compact avec actions sticky */}
        <div className="flex gap-4 mb-4">
          <div className="sticky top-0 z-10 bg-white rounded-lg shadow-md mb-4 p-4 border-l-4 border-indigo-500">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-xl font-bold text-gray-900 truncate">{sharedCV.candidateName}</div>
                    <p className="text-lg text-indigo-600 font-medium truncate">{sharedCV.cvData?.basicInfo?.title || 'CV sans titre'}</p>
                  </div>
                  <div className="items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <EnvelopeIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">{sharedCV.candidateEmail}</span>
                    </div>
                    {sharedCV.candidateLocation && (
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">{sharedCV.candidateLocation}</span>
                      </div>
                    )}
                  </div>




                </div>
              </div>

              {/* Actions recruteur compactes */}
              <div className="flex items-center gap-2">
                {/* Badge pour indiquer le type d'utilisateur connecté */}
                {currentUser && (
                  <div className="text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    {isRecruiter ? (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        🏢 Recruteur
                      </span>
                    ) : isCandidate ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        👤 Candidat
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        👤 Connecté
                      </span>
                    )}
                  </div>
                )}

                {!currentUser ? (
                  <button
                    onClick={handleCreateRecruiterAccount}
                    className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md transition-colors text-sm font-medium"
                  >
                    🏢 Compte recruteur
                  </button>
                ) : isCandidate ? (
                  <button
                    onClick={handleCreateRecruiterAccount}
                    className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md transition-colors text-sm font-medium"
                  >
                    🏢 Devenir recruteur
                  </button>
                ) : isRecruiter ? (
                  <>
                    <button
                      onClick={handleAddToMyList}
                      className="px-3 py-2 bg-blue-500 btn-custom bg-blue-600 text-white rounded-md transition-colors text-sm font-medium"
                    >
                      + Ajouter
                    </button>
                    <button
                      onClick={handleViewSavedCVs}
                      className="px-3 py-2 bg-green-500 btn-custom bg-green-600 text-white rounded-md transition-colors text-sm font-medium"
                    >
                      📋 Mes CVs
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCreateRecruiterAccount}
                    className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md transition-colors text-sm font-medium"
                  >
                    🏢 Compte recruteur
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* Statistiques dans le header */}

          <div className="bg-white rounded-lg p-3 border-l-4 border-gray-400 flex-1">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">📊 Statistiques</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Total des vues:</span>
                <div className="text-xs px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1">
                  <span>👁️</span>
                  <span className="font-medium">{sharedCV.totalViews}</span>
                  <span className="text-gray-500">
                    {sharedCV.totalViews === 0 ? 'Aucune vue' :
                      sharedCV.totalViews === 1 ? 'vue' : 'vues'}
                  </span>
                  {sharedCV.accountsCreated > 0 && (
                    <>
                      <span className="text-gray-400">|</span>
                      <span className="text-green-600 font-medium">{sharedCV.accountsCreated}</span>
                      <span className="text-green-600 text-xs">comptes créés</span>
                    </>
                  )}
                </div>
              </div>

              {sharedCV.totalViews > 0 && (
                <div className="flex justify-between">
                  <span>Taux de conversion :</span>
                  <span className="font-medium text-green-600">
                    {Math.round(((sharedCV.accountsCreated || 0) / sharedCV.totalViews) * 100)}%
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
            {sharedCV.candidateBio && (
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">💬 Présentation</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{sharedCV.candidateBio}</p>
              </div>
            )}

            {/* Expériences - Section prioritaire */}
            {sharedCV.cvData.experiences?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  💼 Expérience professionnelle
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {sharedCV.cvData.experiences.length} poste{sharedCV.cvData.experiences.length > 1 ? 's' : ''}
                  </span>
                </h2>
                <div className="space-y-4">
                  {sharedCV.cvData.experiences.map((experience: any, index: number) => (
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
            {sharedCV.cvData.skills?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🛠️ Compétences
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {sharedCV.cvData.skills.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {Object.entries(sharedCV.cvData.skills.reduce((acc: any, skill: any) => {
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
            {sharedCV.cvData.formations?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-indigo-500">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🎓 Formation
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                    {sharedCV.cvData.formations.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {sharedCV.cvData.formations.map((formation: any, index: number) => (
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



          </div>
        </div>
      </div>
    </div>
  );
}