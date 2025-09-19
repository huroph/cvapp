import { useState } from 'react';
import { PencilIcon, TrashIcon, UserPlusIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useProfile } from '../contexts/ProfileContext';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { profile, updateProfile, resetProfile } = useProfile();
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    position: profile?.position || '',
  });

  const handleEdit = () => {
    setEditData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      bio: profile?.bio || '',
      position: profile?.position || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre profil ? Cette action est irréversible.')) {
      try {
        await resetProfile();
      } catch (error) {
        console.error('Erreur lors de la suppression du profil:', error);
      }
    }
  };

  const handleLogout = async () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    }
  };

  const handleCreateProfile = () => {
    setEditData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      bio: '',
      position: '',
    });
    setIsEditing(true);
  };

  if (!profile && !isEditing) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-12 max-w-2xl w-full">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
              <UserPlusIcon className="h-16 w-16 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Aucun profil configuré</h2>
              <p className="text-gray-600 max-w-md">
                Créez votre profil pour personnaliser votre expérience et centraliser vos informations personnelles.
              </p>
            </div>
            
            <button
              onClick={handleCreateProfile}
              className="btn-custom flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-medium"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Créer un profil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-12 max-w-2xl w-full">
        <div className="flex flex-col items-center text-center space-y-6 relative">
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="btn-custom absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Modifier le profil"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          )}

          <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
          
          {isEditing ? (
            <>
              <div className="w-full space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left text-gray-900 placeholder-gray-500"
                    placeholder="Prénom"
                  />
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left text-gray-900 placeholder-gray-500"
                    placeholder="Nom"
                  />
                </div>
                
                <div className="relative">
                  <input
                    type="email"
                    value={editData.email}
                    readOnly
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder="Email"
                    title="L'email est lié à votre compte utilisateur et ne peut pas être modifié"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 text-left -mt-2">
                  📧 L'email est synchronisé avec votre compte utilisateur
                </p>
                
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left text-gray-900 placeholder-gray-500"
                  placeholder="Téléphone"
                />
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left text-gray-900 placeholder-gray-500"
                  placeholder="Localisation"
                />
                <input
                  type="text"
                  value={editData.position}
                  onChange={(e) => setEditData(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-left text-gray-900 placeholder-gray-500"
                  placeholder="Poste recherché (ex: Développeur Frontend, Designer UX...)"
                />
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-left text-gray-900 placeholder-gray-500"
                  placeholder="À propos de vous"
                />
              </div>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleSave}
                  className="btn-custom px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-medium"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={handleCancel}
                  className="btn-custom px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-custom px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors font-medium flex items-center"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Supprimer
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-custom px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors font-medium flex items-center"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                  Se déconnecter
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleLogout}
                className="btn-custom absolute top-0 right-12 p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                title="Se déconnecter"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
              
              <h1 className="text-3xl font-bold text-gray-900">
                {profile?.firstName} {profile?.lastName}
              </h1>
              {profile?.position && (
                <span className="text-lg text-indigo-600 font-medium">
                  {profile.position}
                </span>
              )}
              <div className="flex flex-col space-y-2 text-gray-600">
                <span>{profile?.email}</span>
                <span>{profile?.phone}</span>
                <span>🇫🇷 {profile?.location}</span>
              </div>
              <p className="text-gray-700 leading-relaxed max-w-lg">
                {profile?.bio}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}