import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useCV } from '../../contexts/CVContext';

interface Experience {
  id: string;
  position: string;
  company: string;
  period: string;
  location: string;
  description: string;
}

interface AddExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  experiences: Experience[];
  onSave: (experiences: Experience[]) => void;
}

export default function AddExperienceModal({ isOpen, onClose, experiences, onSave }: AddExperienceModalProps) {
  const { selectedCV, updateCV } = useCV();
  const [newExperience, setNewExperience] = useState({
    position: '',
    company: '',
    location: '',
    period: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setNewExperience({
      position: '',
      company: '',
      location: '',
      period: '',
      description: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addExperience = async () => {
    if (newExperience.position && newExperience.company && newExperience.period) {
      setIsLoading(true);
      
      const experienceToAdd: Experience = {
        id: Date.now().toString(),
        position: newExperience.position,
        company: newExperience.company,
        location: newExperience.location,
        period: newExperience.period,
        description: newExperience.description
      };
      
      const updatedExperiences = [...experiences, experienceToAdd];
      
      // Sauvegarder dans Firebase
      if (selectedCV) {
        try {
          // Convertir les expériences vers le format Firebase
          const firebaseExperiences = updatedExperiences.map(exp => {
            // Extraire les dates de début et fin
            const periodParts = exp.period.split(' - ');
            const startDate = periodParts[0] || '';
            const endDate = periodParts[1] || '';
            
            return {
              id: exp.id,
              position: exp.position,
              company: exp.company,
              location: exp.location,
              startDate: startDate,
              endDate: endDate,
              isCurrentJob: endDate.toLowerCase() === 'présent',
              description: exp.description,
              achievements: exp.description ? [exp.description] : ['']
            };
          });
          
          await updateCV(selectedCV.id!, { experiences: firebaseExperiences });
          onSave(updatedExperiences);
          resetForm();
          onClose();
        } catch (error) {
          console.error('Erreur lors de la sauvegarde:', error);
        }
      }
      
      setIsLoading(false);
    }
  };

  const isFormValid = newExperience.position && newExperience.company && newExperience.period;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                    Ajouter une expérience
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poste *
                    </label>
                    <input
                      type="text"
                      value={newExperience.position}
                      onChange={(e) => setNewExperience(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Ex: Développeur Full-Stack, Chef de projet..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entreprise *
                    </label>
                    <input
                      type="text"
                      value={newExperience.company}
                      onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Ex: Google, Microsoft, Start-up..."
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lieu
                    </label>
                    <input
                      type="text"
                      value={newExperience.location}
                      onChange={(e) => setNewExperience(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Ex: Paris, Remote..."
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Période *
                    </label>
                    <input
                      type="text"
                      value={newExperience.period}
                      onChange={(e) => setNewExperience(prev => ({ ...prev, period: e.target.value }))}
                      placeholder="Ex: Jan 2023 - Présent"
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newExperience.description}
                      onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez vos missions et réalisations..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 bg-gray-500 text-black rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    disabled={isLoading}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={addExperience}
                    disabled={!isFormValid || isLoading}
                    className="flex items-center gap-2 px-4 py-2 btn-custom text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Ajout...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-4 w-4" />
                        Ajouter
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}