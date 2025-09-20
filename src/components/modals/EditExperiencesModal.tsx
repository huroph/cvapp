import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PencilIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCV } from '../../contexts/CVContext';
import DeleteModal from '../common/DeleteModal';

interface Experience {
  id: string;
  position: string;
  company: string;
  period: string;
  location: string;
  description: string;
}

interface EditExperiencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  experiences: Experience[];
  onSave: (experiences: Experience[]) => void;
}

export default function EditExperiencesModal({ isOpen, onClose, experiences, onSave }: EditExperiencesModalProps) {
  const { selectedCV, updateCV } = useCV();
  const [localExperiences, setLocalExperiences] = useState<Experience[]>(experiences);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Experience | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Synchroniser avec les données Firebase quand elles arrivent
  useEffect(() => {
    setLocalExperiences(experiences);
  }, [experiences]);

  // Fonction pour sauvegarder automatiquement dans Firebase
  const saveToFirebase = async (updatedExperiences: Experience[]) => {
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
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    }
  };

  const startEditing = (experience: Experience) => {
    setEditingId(experience.id);
    setEditingValues(experience);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingValues(null);
  };

  const saveEditing = () => {
    if (editingValues) {
      const updatedExperiences = localExperiences.map(e => 
        e.id === editingValues.id ? editingValues : e
      );
      setLocalExperiences(updatedExperiences);
      saveToFirebase(updatedExperiences);
      onSave(updatedExperiences);
    }
    setEditingId(null);
    setEditingValues(null);
  };

  const deleteExperience = (id: string) => {
    const updatedExperiences = localExperiences.filter(e => e.id !== id);
    setLocalExperiences(updatedExperiences);
    saveToFirebase(updatedExperiences);
    onSave(updatedExperiences);
    setDeletingId(null);
  };

  const handleClose = () => {
    setEditingId(null);
    setEditingValues(null);
    setDeletingId(null);
    onClose();
  };

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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                    Modifier les expériences
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {localExperiences.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune expérience enregistrée. Utilisez le bouton "Ajouter" pour créer votre première expérience.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {localExperiences.map((experience) => (
                      <div key={experience.id} className="border border-gray-200 rounded-lg p-4">
                        {editingId === experience.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editingValues?.position || ''}
                              onChange={(e) => setEditingValues(prev => prev ? {...prev, position: e.target.value} : null)}
                              placeholder="Poste"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <input
                              type="text"
                              value={editingValues?.company || ''}
                              onChange={(e) => setEditingValues(prev => prev ? {...prev, company: e.target.value} : null)}
                              placeholder="Entreprise"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <input
                              type="text"
                              value={editingValues?.location || ''}
                              onChange={(e) => setEditingValues(prev => prev ? {...prev, location: e.target.value} : null)}
                              placeholder="Lieu"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <input
                              type="text"
                              value={editingValues?.period || ''}
                              onChange={(e) => setEditingValues(prev => prev ? {...prev, period: e.target.value} : null)}
                              placeholder="2020 - 2023"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <textarea
                              value={editingValues?.description || ''}
                              onChange={(e) => setEditingValues(prev => prev ? {...prev, description: e.target.value} : null)}
                              placeholder="Description de l'expérience"
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={saveEditing}
                                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                <CheckIcon className="h-4 w-4" />
                                Sauvegarder
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{experience.position}</h3>
                                <p className="text-sm text-gray-600">{experience.company} - {experience.location}</p>
                                <p className="text-sm text-gray-500">{experience.period}</p>
                                {experience.description && (
                                  <p className="text-sm text-gray-600 mt-2">{experience.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => startEditing(experience)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Modifier"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setDeletingId(experience.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Supprimer"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Fermer
                  </button>
                </div>

                {/* Modal de confirmation de suppression */}
                <DeleteModal
                  isOpen={!!deletingId}
                  onClose={() => setDeletingId(null)}
                  onConfirm={() => deleteExperience(deletingId!)}
                  message="Êtes-vous sûr de vouloir supprimer cette expérience ?"
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}