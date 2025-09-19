import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon, PencilIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCV } from '../../contexts/CVContext';

interface Formation {
  id: string;
  title: string;
  school: string;
  period: string;
}

interface FormationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  formations: Formation[];
  onSave: (formations: Formation[]) => void;
}

export default function FormationWizard({ isOpen, onClose, formations, onSave }: FormationWizardProps) {
  const { selectedCV, updateCV } = useCV();
  const [localFormations, setLocalFormations] = useState<Formation[]>(formations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Formation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newFormation, setNewFormation] = useState({ title: '', school: '', period: '' });

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
        console.error('Erreur lors de la sauvegarde des formations:', error);
      }
    }
  };

  const handleEdit = (id: string) => {
    if (editingId === id) {
      // Annuler l'édition
      setEditingId(null);
      setEditingValues(null);
    } else {
      // Commencer l'édition
      const formation = localFormations.find(f => f.id === id);
      if (formation) {
        setEditingId(id);
        setEditingValues({ ...formation });
      }
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (editingValues) {
      const updatedFormations = localFormations.map(formation => 
        formation.id === id ? editingValues : formation
      );
      setLocalFormations(updatedFormations);
      setEditingId(null);
      setEditingValues(null);
      
      // Sauvegarder automatiquement dans Firebase
      await saveToFirebase(updatedFormations);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValues(null);
  };

  const handleUpdate = (field: keyof Formation, value: string) => {
    if (editingValues) {
      setEditingValues(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleConfirmDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleDelete = async (id: string) => {
    const updatedFormations = localFormations.filter(formation => formation.id !== id);
    setLocalFormations(updatedFormations);
    setDeletingId(null);
    
    // Sauvegarder automatiquement dans Firebase
    await saveToFirebase(updatedFormations);
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
  };

  const handleAddNew = async () => {
    if (newFormation.title && newFormation.school && newFormation.period) {
      const newId = Date.now().toString();
      const updatedFormations = [...localFormations, { ...newFormation, id: newId }];
      setLocalFormations(updatedFormations);
      setNewFormation({ title: '', school: '', period: '' });
      
      // Sauvegarder automatiquement dans Firebase
      await saveToFirebase(updatedFormations);
    }
  };

  const handleSave = () => {
    onSave(localFormations);
    onClose();
  };

  const handleClose = () => {
    setLocalFormations(formations); // Reset to original state
    setEditingId(null);
    setEditingValues(null);
    setDeletingId(null);
    setNewFormation({ title: '', school: '', period: '' });
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
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm" />
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
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Gestion des Formations
                  </Dialog.Title>
                  <button
                    type="button"
                    className="btn-custom rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {localFormations.map((formation) => (
                    <div key={formation.id} className={`border rounded-lg p-4 ${
                      deletingId === formation.id ? 'border-red-300 bg-red-50' : 
                      editingId === formation.id ? 'border-purple-300 bg-purple-50' : 
                      'border-gray-200 bg-gray-50'
                    }`}>
                      {deletingId === formation.id ? (
                        // Confirmation de suppression
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-red-600">
                              <TrashIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-red-900">
                                Confirmer la suppression ?
                              </div>
                              <div className="text-xs text-red-600">
                                Cette action est irréversible
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleDelete(formation.id)}
                              className="btn-custom px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              Supprimer
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelDelete}
                              className="btn-custom px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            {editingId === formation.id && editingValues ? (
                              <>
                                <input
                                  type="text"
                                  value={editingValues.title}
                                  onChange={(e) => handleUpdate('title', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                                  placeholder="Titre de la formation"
                                />
                                <input
                                  type="text"
                                  value={editingValues.school}
                                  onChange={(e) => handleUpdate('school', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                                  placeholder="École"
                                />
                                <input
                                  type="text"
                                  value={editingValues.period}
                                  onChange={(e) => handleUpdate('period', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                                  placeholder="Période (ex: 2020 - 2022)"
                                />
                              </>
                            ) : (
                              <>
                                <div className="text-lg font-semibold text-gray-900">{formation.title}</div>
                                <div className="text-sm text-gray-600">{formation.school}</div>
                                <div className="text-sm text-gray-600">{formation.period}</div>
                              </>
                            )}
                          </div>
                          <div className="ml-4 flex space-x-2">
                            {editingId === formation.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(formation.id)}
                                  disabled={!editingValues?.title.trim() || !editingValues?.school.trim() || !editingValues?.period.trim()}
                                  className="btn-custom p-2 text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Valider les modifications"
                                >
                                  <CheckIcon className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="btn-custom p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md"
                                  title="Annuler les modifications"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleEdit(formation.id)}
                                  className="btn-custom p-2 text-gray-600 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-md"
                                  title="Modifier cette formation"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmDelete(formation.id)}
                                  className="btn-custom p-2 text-gray-600 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md"
                                  title="Supprimer cette formation"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add New Formation Section */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Ajouter une nouvelle formation</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newFormation.title}
                      onChange={(e) => setNewFormation(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                      placeholder="Titre de la formation"
                    />
                    <input
                      type="text"
                      value={newFormation.school}
                      onChange={(e) => setNewFormation(prev => ({ ...prev, school: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                      placeholder="École"
                    />
                    <input
                      type="text"
                      value={newFormation.period}
                      onChange={(e) => setNewFormation(prev => ({ ...prev, period: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                      placeholder="Période (ex: 2020 - 2022)"
                    />
                    <button
                      type="button"
                      onClick={handleAddNew}
                      disabled={!newFormation.title || !newFormation.school || !newFormation.period}
                      className="btn-custom flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Ajouter la formation
                    </button>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn-custom px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    onClick={handleClose}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn-custom px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    onClick={handleSave}
                  >
                    Valider
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
