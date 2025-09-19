import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PencilIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCV } from '../../contexts/CVContext';

interface Formation {
  id: string;
  title: string;
  school: string;
  period: string;
}

interface EditFormationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  formations: Formation[];
  onSave: (formations: Formation[]) => void;
}

export default function EditFormationsModal({ isOpen, onClose, formations, onSave }: EditFormationsModalProps) {
  const { selectedCV, updateCV } = useCV();
  const [localFormations, setLocalFormations] = useState<Formation[]>(formations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Formation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Synchroniser avec les données Firebase quand elles arrivent
  useEffect(() => {
    setLocalFormations(formations);
  }, [formations]);

  // Fonction pour sauvegarder automatiquement dans Firebase
  const saveToFirebase = async (updatedFormations: Formation[]) => {
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
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    }
  };

  const startEditing = (formation: Formation) => {
    setEditingId(formation.id);
    setEditingValues(formation);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingValues(null);
  };

  const saveEditing = () => {
    if (editingValues) {
      const updatedFormations = localFormations.map(f => 
        f.id === editingValues.id ? editingValues : f
      );
      setLocalFormations(updatedFormations);
      saveToFirebase(updatedFormations);
      onSave(updatedFormations);
    }
    setEditingId(null);
    setEditingValues(null);
  };

  const deleteFormation = (id: string) => {
    const updatedFormations = localFormations.filter(f => f.id !== id);
    setLocalFormations(updatedFormations);
    saveToFirebase(updatedFormations);
    onSave(updatedFormations);
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                    Modifier les formations
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {localFormations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune formation enregistrée. Utilisez le bouton "Ajouter" pour créer votre première formation.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {localFormations.map((formation) => (
                      <div key={formation.id} className="border border-gray-200 rounded-lg p-4">
                        {editingId === formation.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editingValues?.title || ''}
                              onChange={(e) => setEditingValues(prev => prev ? {...prev, title: e.target.value} : null)}
                              placeholder="Diplôme/Formation"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <input
                              type="text"
                              value={editingValues?.school || ''}
                              onChange={(e) => setEditingValues(prev => prev ? {...prev, school: e.target.value} : null)}
                              placeholder="École/Université - Ville"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <input
                              type="text"
                              value={editingValues?.period || ''}
                              onChange={(e) => setEditingValues(prev => prev ? {...prev, period: e.target.value} : null)}
                              placeholder="2020 - 2023"
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
                                <h3 className="font-medium text-gray-900">{formation.title}</h3>
                                <p className="text-sm text-gray-600">{formation.school}</p>
                                <p className="text-sm text-gray-500">{formation.period}</p>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => startEditing(formation)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Modifier"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setDeletingId(formation.id)}
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
                {deletingId && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                      <h3 className="text-lg font-medium mb-4">Confirmer la suppression</h3>
                      <p className="text-gray-600 mb-6">
                        Êtes-vous sûr de vouloir supprimer cette formation ?
                      </p>
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => deleteFormation(deletingId)}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}