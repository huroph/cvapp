import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../contexts/ProfileContext";
import { useAuth } from "../../contexts/AuthContext";
import { getInitials } from "../../constants";

interface HeaderProps {
  cvTitle?: string;
  viewCount?: number;
  authenticatedViewCount?: number; // Maintenant = comptes créés
}

export default function Header({ cvTitle, viewCount, authenticatedViewCount }: HeaderProps) {
  const { profile } = useProfile();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      await logout();
    }
  };

  const handleProfileClick = () => {
    navigate('/profil');
  };

  if (!profile) {
    return null;
  }

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
      {/* Titre du CV avec statistiques de vues */}
      <div className="flex items-center gap-3">
        {cvTitle && (
          <div className="flex items-center gap-3">
            <div className="text-md font-semibold text-gray-900 truncate">
              {cvTitle}
            </div>
            {viewCount !== undefined && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                  <span>👁️</span>
                  <span className="font-medium text-gray-700">{viewCount}</span>
                  <span className="text-gray-500">
                    {viewCount === 0 ? 'vue' : viewCount === 1 ? 'vue' : 'vues'}
                  </span>
                </div>
                {authenticatedViewCount !== undefined && authenticatedViewCount > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full text-xs">
                    <span className="font-medium text-green-700">{authenticatedViewCount}</span>
                    <span className="text-green-600">comptes créés</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {/* Nom et localisation */}
        <div className="flex  cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={handleProfileClick}>
        <div 
          className="flex flex-col items-end cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          onClick={handleProfileClick}
        >
          <span className="font-semibold text-sm text-gray-900">
            {profile.firstName} {profile.lastName}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            📍 {profile.location}
          </span>
        </div>

        {/* Photo de profil (initiales) */}
        <div 
          className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors"
          onClick={handleProfileClick}
        >
          <span className="text-white font-semibold text-sm">
            {getInitials(profile.firstName, profile.lastName)}
          </span>
        </div>
        </div>

        {/* Bouton déconnexion */}
        <button
          onClick={handleLogout}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Se déconnecter"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
