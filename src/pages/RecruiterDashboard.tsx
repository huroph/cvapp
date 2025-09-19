import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, CalendarIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { SharedCVService, type SharedCV } from '../services/sharedCVService';
import { RecruiterService } from '../services/recruiterService';
import { useAuth } from '../contexts/AuthContext';
import { UserType } from '../types/user';
import toast from 'react-hot-toast';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const { currentUser, getUserType } = useAuth();
  const [viewedCVs, setViewedCVs] = useState<SharedCV[]>([]);
  const [savedCVs, setSavedCVs] = useState<SharedCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'saved' | 'viewed'>('saved');

  useEffect(() => {
    // Vérifier que l'utilisateur est bien un recruteur
    if (!currentUser || getUserType() !== UserType.RECRUTEUR) {
      navigate('/');
      return;
    }

    const initializeDashboard = async () => {
      setLoading(true);
      
      try {
        // Charger les CVs sauvegardés et consultés directement
        await Promise.all([
          loadSavedCVs(),
          loadViewedCVs()
        ]);
      } catch (err) {
        console.error('Erreur lors de l\'initialisation du dashboard:', err);
        setError('Erreur lors du chargement du dashboard');
      } finally {
        setLoading(false);
      }
    };

    // Attendre un petit délai pour s'assurer que currentUser est bien initialisé
    const timer = setTimeout(() => {
      initializeDashboard();
    }, 100);

    return () => clearTimeout(timer);
  }, [currentUser, getUserType, navigate]);

  const loadSavedCVs = async () => {
    if (!currentUser) return;

    try {
      const savedCVs = await RecruiterService.getRecruiterSavedCVs(currentUser.uid);
      setSavedCVs(savedCVs);
    } catch (error) {
      console.error('Erreur lors du chargement des CVs sauvegardés:', error);
      // Ne pas faire échouer le chargement pour cette erreur
    }
  };

  const loadViewedCVs = async () => {
    if (!currentUser) return;

    try {
      const cvs = await SharedCVService.getRecruiterViewedCVs(currentUser.uid);
      setViewedCVs(cvs);
    } catch (err) {
      console.error('Erreur lors du chargement des CVs consultés:', err);
      // Ne pas faire échouer le chargement pour cette erreur
    }
  };

  const handleRemoveCV = async (shareId: string) => {
    if (!currentUser) return;

    try {
      await RecruiterService.removeCVFromRecruiterList(currentUser.uid, shareId);
      setSavedCVs(prev => prev.filter(cv => cv.id !== shareId));
      toast.success('CV retiré de votre liste');
    } catch (error) {
      console.error('Erreur lors de la suppression du CV:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleViewCV = (shareId: string) => {
    navigate(`/shared/${shareId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BriefcaseIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Recruteur</h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BriefcaseIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">CVs sauvegardés</h3>
                <p className="text-3xl font-bold text-indigo-600">{savedCVs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">CVs consultés</h3>
                <p className="text-3xl font-bold text-green-600">{viewedCVs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Cette semaine</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {viewedCVs.filter(cv => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(cv.createdAt) >= weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('saved')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'saved'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💾 CVs sauvegardés ({savedCVs.length})
              </button>
              <button
                onClick={() => setActiveTab('viewed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'viewed'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👁️ CVs consultés ({viewedCVs.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'saved' ? (
          /* CVs sauvegardés */
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Mes CVs sauvegardés</h2>
              <p className="text-sm text-gray-600 mt-1">
                CVs que vous avez ajoutés à votre liste pour un suivi personnalisé
              </p>
            </div>

            {savedCVs.length === 0 ? (
              <div className="p-12 text-center">
                <BriefcaseIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun CV sauvegardé</h3>
                <p className="text-gray-600 mb-6">
                  Commencez à explorer les CVs partagés et ajoutez-les à votre liste pour les retrouver facilement.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Explorer les CVs
                </button>
              </div>
            ) : (
              <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
                {savedCVs.map((cv) => (
                  <div key={cv.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {cv.candidateName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{cv.candidatePosition}</p>
                        <p className="text-sm text-gray-500">{cv.candidateEmail}</p>
                        {cv.candidateLocation && (
                          <p className="text-sm text-gray-500">{cv.candidateLocation}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewCV(cv.id)}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                      >
                        👁️ Voir le CV
                      </button>
                      <button
                        onClick={() => handleRemoveCV(cv.id)}
                        className="px-3 py-2 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200 transition-colors"
                        title="Retirer de ma liste"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* CVs consultés */
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">CVs consultés</h2>
              <p className="text-sm text-gray-600 mt-1">
                Retrouvez tous les profils que vous avez consultés via les liens partagés
              </p>
            </div>

            {error && (
              <div className="p-6 bg-red-50 border-b border-red-200">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {viewedCVs.length === 0 ? (
              <div className="p-12 text-center">
                <EyeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun CV consulté</h3>
                <p className="text-gray-600 mb-6">
                  Vous n'avez pas encore consulté de CV via les liens partagés par les candidats.
                </p>
                <p className="text-sm text-gray-500">
                  💡 Quand vous cliquerez sur un lien de CV partagé, il apparaîtra automatiquement ici.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {viewedCVs.map((cv) => (
                  <div
                    key={cv.id}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewCV(cv.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                            {cv.candidateName}
                          </h3>
                          {cv.candidatePosition && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                              {cv.candidatePosition}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>📧 {cv.candidateEmail}</span>
                          {cv.candidateLocation && (
                            <span>📍 {cv.candidateLocation}</span>
                          )}
                        </div>

                        {cv.candidateBio && (
                          <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                            {cv.candidateBio}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Consulté le {new Date(cv.createdAt).toLocaleDateString('fr-FR')}</span>
                            <span>👁️ {cv.totalViews} consultation{cv.totalViews > 1 ? 's' : ''}</span>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewCV(cv.id);
                            }}
                            className="px-3 py-1 bg-indigo-100 text-indigo-600 text-xs rounded hover:bg-indigo-200 transition-colors"
                          >
                            Voir le CV
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}