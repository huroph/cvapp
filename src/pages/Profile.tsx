import { useState } from 'react';
import { PencilIcon, TrashIcon, UserPlusIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useProfile } from '../contexts/ProfileContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/card/Card';
import Badge from '../components/ui/Badge';

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
    <div className="w-full h-full flex items-center justify-center ">
      <Card intensity={0.5}  >
        <div className="flex flex-col space-y-6 p-6 relative ">
          {!isEditing && (
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleEdit}
                className="btn-custom p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Modifier le profil"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="btn-custom p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                title="Se déconnecter"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button> 
            </div>
          )}

          {isEditing ? (
            <>
              <div className="flex flex-col items-center mb-6 ">
                <div className="w-32 h-32 flex items-center justify-center mb-4">
                  <svg width="128" height="128" viewBox="0 0 368 368" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="50%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                    <path d="M184 217C250.849 217 312.835 237.823 363.824 273.337C366.461 275.175 368 278.201 368 281.416V358C368 363.523 363.523 368 358 368H10C4.47716 368 0 363.523 0 358V281.416C0 278.201 1.53884 275.175 4.17635 273.337C55.1654 237.823 117.151 217 184 217ZM368 180.231C368 187.839 359.821 192.693 353 189.322C302.05 164.147 244.677 150 184 150C123.323 150 65.9502 164.147 15 189.322C8.17894 192.693 0 187.839 0 180.231V10C0 4.47715 4.47715 0 10 0H358C363.523 0 368 4.47715 368 10V180.231Z" fill="url(#profileGradient)"/>
                  </svg>
                </div>
              </div>

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
              
              {/* Footer avec les boutons */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex gap-3 justify-center flex-wrap">
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
                   
                  </button>
                 
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-end gap-10 text-center">
                <div className="flex flex-col items-start p-4 rounded-lg">
                  <div className="w-32 h-32 flex items-center justify-center">
                    <svg width="128" height="128" viewBox="0 0 368 368" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366F1" />
                          <stop offset="50%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                      </defs>
                      <path d="M184 217C250.849 217 312.835 237.823 363.824 273.337C366.461 275.175 368 278.201 368 281.416V358C368 363.523 363.523 368 358 368H10C4.47716 368 0 363.523 0 358V281.416C0 278.201 1.53884 275.175 4.17635 273.337C55.1654 237.823 117.151 217 184 217ZM368 180.231C368 187.839 359.821 192.693 353 189.322C302.05 164.147 244.677 150 184 150C123.323 150 65.9502 164.147 15 189.322C8.17894 192.693 0 187.839 0 180.231V10C0 4.47715 4.47715 0 10 0H358C363.523 0 368 4.47715 368 10V180.231Z" fill="url(#profileGradient)"/>
                    </svg>
                  </div>

                  <div className="text-3xl font-bold text-gray-900 w-full rounded-lg my-4 text-left">
                    {profile?.firstName} {profile?.lastName}
                  </div>
                  {profile?.position && (
                    <Badge variant="gradient" size="md" className="self-start">
                      {profile.position}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col items-end  space-y-2 text-sm text-gray-400 p-4 rounded-lg">
                   <span>{profile?.email}</span>
                  <span>{profile?.phone}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}