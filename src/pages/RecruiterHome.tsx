import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, CalendarIcon, MapPinIcon, BriefcaseIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { SharedCVService, type SharedCV } from '../services/sharedCVService';
import { useAuth } from '../contexts/AuthContext';

export default function RecruiterHome() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [viewedCVs, setViewedCVs] = useState<SharedCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadViewedCVs = async () => {
      if (!currentUser) return;
      
      try {
        const cvs = await SharedCVService.getRecruiterViewedCVs(currentUser.uid);
        setViewedCVs(cvs);
      } catch (err) {
        console.error('Erreur lors du chargement des CVs:', err);
        setError('Erreur lors du chargement des CVs consultés');
      } finally {
        setLoading(false);
      }
    };

    loadViewedCVs();
  }, [currentUser]);

  const handleViewCV = (shareId: string) => {
    navigate(`/cv/${shareId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de vos CVs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden bg-gray-50">
      <div className="h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <BriefcaseIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">CVs reçus</h1>
            </div>
            <p className="text-gray-600">
              Retrouvez tous les profils que vous avez consultés via les liens partagés
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Total CVs</h3>
                  <p className="text-3xl font-bold text-indigo-600">{viewedCVs.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Cette semaine</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {viewedCVs.filter(cv => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(cv.createdAt) >= weekAgo;
                    }).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MapPinIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Localisations</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {new Set(viewedCVs.map(cv => cv.candidateLocation).filter(Boolean)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des CVs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">CVs consultés</h2>
            </div>

            {error && (
              <div className="p-6 bg-red-50 border-b border-red-200">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {viewedCVs.length === 0 ? (
              <div className="p-12 text-center">
                <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun CV consulté</h3>
                <div className="max-w-md mx-auto">
                  <p className="text-gray-600 mb-6">
                    Vous n'avez pas encore consulté de CV via les liens partagés par les candidats.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>💡 Comment ça marche ?</strong>
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1 text-left">
                      <li>• Les candidats génèrent des liens pour leurs CVs</li>
                      <li>• Quand vous cliquez sur un lien, le CV s'affiche</li>
                      <li>• Le CV est automatiquement ajouté à votre liste</li>
                      <li>• Vous pouvez retrouver tous vos CVs ici</li>
                    </ul>
                  </div>
                </div>
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
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm rounded-full">
                              {cv.candidatePosition}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center space-x-1">
                            <span>📧</span>
                            <span>{cv.candidateEmail}</span>
                          </span>
                          {cv.candidateLocation && (
                            <span className="flex items-center space-x-1">
                              <span>📍</span>
                              <span>{cv.candidateLocation}</span>
                            </span>
                          )}
                        </div>

                        {cv.candidateBio && (
                          <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                            {cv.candidateBio}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Consulté le {new Date(cv.createdAt).toLocaleDateString('fr-FR')}</span>
                            <span className="flex items-center space-x-1">
                              <EyeIcon className="h-3 w-3" />
                              <span>{cv.totalViews} consultation{cv.totalViews > 1 ? 's' : ''}</span>
                            </span>
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
        </div>
      </div>
    </div>
  );
}