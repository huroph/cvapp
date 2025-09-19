import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useCV } from '../../contexts/CVContext';

interface Formation {
  id: string;
  title: string;
  school: string;
  period: string;
}

interface AddFormationModalProps {
  isOpen: boolean;
  onClose: () => void;
  formations: Formation[];
  onSave: (formations: Formation[]) => void;
}

export default function AddFormationModal({ isOpen, onClose, formations, onSave }: AddFormationModalProps) {
  const { selectedCV, updateCV } = useCV();
  const [newFormation, setNewFormation] = useState({ title: '', school: '', period: '' });
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setNewFormation({ title: '', school: '', period: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addFormation = async () => {
    if (newFormation.title && newFormation.school && newFormation.period) {
      setIsLoading(true);
      
      const formationToAdd: Formation = {
        id: Date.now().toString(),
        title: newFormation.title,
        school: newFormation.school,
        period: newFormation.period
      };
      
      const updatedFormations = [...formations, formationToAdd];
      
      // Sauvegarder dans Firebase
      if (selectedCV) {
        try {
          // Convertir les formations vers le format Firebase
          const firebaseFormations = updatedFormations.map(formation => {
            // Extraire l'école et la localisation
            const schoolParts = formation.school.split(' - ');
            const school = schoolParts[0];
            const location = schoolParts[1] || '';
            
            // Extraire les années de début et fin
            const periodParts = formation.period.split(' - ');
            const startYear = periodParts[0] || '';
            const endYear = periodParts[1] || '';
            
            return {
              id: formation.id,
              degree: formation.title,
              school: school,
              location: location,
              startYear: startYear,
              endYear: endYear,
              description: ''
            };
          });
          
          await updateCV(selectedCV.id!, { formations: firebaseFormations });
          onSave(updatedFormations);
          resetForm();
          onClose();
        } catch (error) {
          console.error('Erreur lors de la sauvegarde:', error);
        }
      }
      
      setIsLoading(false);
    }
  };

  const isFormValid = newFormation.title && newFormation.school && newFormation.period;

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                    Ajouter une formation
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
                      Diplôme/Formation *
                    </label>
                    <input
                      type="text"
                      value={newFormation.title}
                      onChange={(e) => setNewFormation(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Master en Informatique, Licence Pro..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      École/Université *
                    </label>
                    <input
                      type="text"
                      value={newFormation.school}
                      onChange={(e) => setNewFormation(prev => ({ ...prev, school: e.target.value }))}
                      placeholder="Ex: Université Paris-Saclay - Orsay"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Période *
                    </label>
                    <input
                      type="text"
                      value={newFormation.period}
                      onChange={(e) => setNewFormation(prev => ({ ...prev, period: e.target.value }))}
                      placeholder="Ex: 2020 - 2023"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    disabled={isLoading}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={addFormation}
                    disabled={!isFormValid || isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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