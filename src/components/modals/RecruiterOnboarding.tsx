import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useProfile } from '../../contexts/ProfileContext';

interface RecruiterOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function RecruiterOnboarding({ isOpen, onComplete }: RecruiterOnboardingProps) {
  const { updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    position: '',
    company: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.position.trim() || !formData.company.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsLoading(true);
      
      // Mise à jour du profil avec les informations recruteur
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || '',
        phone: formData.phone || '',
        location: `${formData.company}, ${formData.location}`.trim().replace(/^,|,$/, ''),
        bio: formData.bio || `Recruteur chez ${formData.company}`,
        position: formData.position
      });

      toast.success('Profil créé avec succès !');
      onComplete();
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
      toast.error('Erreur lors de la création du profil');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Bienvenue sur CV App !
                </h3>
                <p className="text-indigo-100 text-sm">
                  Complétez votre profil recruteur
                </p>
              </div>
              <button
                onClick={onComplete}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="space-y-4">
              {/* Nom et Prénom */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Votre prénom"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>

              {/* Poste */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poste *
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => updateField('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Responsable RH, Recruteur IT..."
                  required
                />
              </div>

              {/* Entreprise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entreprise *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nom de votre entreprise"
                  required
                />
              </div>

              {/* Localisation (optionnel) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Paris, Lyon, Remote..."
                />
              </div>

              {/* Email (optionnel) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email professionnel
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="votre.email@entreprise.com"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                onClick={onComplete}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Passer
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Création...' : 'Créer mon profil'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}