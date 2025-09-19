import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PencilIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCV } from '../../contexts/CVContext';

interface Skill {
  id: string;
  name: string;
  category: 'design' | 'development' | 'marketing' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

const categoryColors = {
  design: { bg: 'bg-blue-100', text: 'text-blue-700' },
  development: { bg: 'bg-green-100', text: 'text-green-700' },
  marketing: { bg: 'bg-red-100', text: 'text-red-700' },
  other: { bg: 'bg-purple-100', text: 'text-purple-700' },
};

const categoryLabels = {
  design: 'Design',
  development: 'Développement',
  marketing: 'Marketing',
  other: 'Autre'
};

const levelLabels = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
  expert: 'Expert'
};

interface EditSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: Skill[];
  onSave: (skills: Skill[]) => void;
}

export default function EditSkillsModal({ isOpen, onClose, skills, onSave }: EditSkillsModalProps) {
  const { selectedCV, updateCV } = useCV();
  const [localSkills, setLocalSkills] = useState<Skill[]>(skills);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Skill | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Synchroniser avec les données Firebase quand elles arrivent
  useEffect(() => {
    setLocalSkills(skills);
  }, [skills]);

  // Fonction pour sauvegarder automatiquement dans Firebase
  const saveToFirebase = async (updatedSkills: Skill[]) => {
    if (selectedCV) {
      try {
        // Convertir les skills vers le format Firebase
        const firebaseSkills = updatedSkills.map(skill => ({
          id: skill.id,
          name: skill.name,
          category: skill.category,
          level: skill.level === 'beginner' ? 'Débutant' as const :
                 skill.level === 'intermediate' ? 'Intermédiaire' as const :
                 skill.level === 'advanced' ? 'Avancé' as const :
                 'Expert' as const
        }));
        
        await updateCV(selectedCV.id!, { skills: firebaseSkills });
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    }
  };

  const startEditing = (skill: Skill) => {
    setEditingId(skill.id);
    setEditingValues(skill);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingValues(null);
  };

  const saveEditing = () => {
    if (editingValues) {
      const updatedSkills = localSkills.map(s => 
        s.id === editingValues.id ? editingValues : s
      );
      setLocalSkills(updatedSkills);
      saveToFirebase(updatedSkills);
      onSave(updatedSkills);
    }
    setEditingId(null);
    setEditingValues(null);
  };

  const deleteSkill = (id: string) => {
    const updatedSkills = localSkills.filter(s => s.id !== id);
    setLocalSkills(updatedSkills);
    saveToFirebase(updatedSkills);
    onSave(updatedSkills);
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                    Modifier les compétences
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {localSkills.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune compétence enregistrée. Utilisez le bouton "Ajouter" pour créer votre première compétence.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {localSkills.map((skill) => (
                      <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                        {editingId === skill.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editingValues?.name || ''}
                              onChange={(e) => setEditingValues(prev => prev ? {...prev, name: e.target.value} : null)}
                              placeholder="Nom de la compétence"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <select
                              value={editingValues?.category || 'other'}
                              onChange={(e) => setEditingValues(prev => prev ? {...prev, category: e.target.value as Skill['category']} : null)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="design">Design</option>
                              <option value="development">Développement</option>
                              <option value="marketing">Marketing</option>
                              <option value="other">Autre</option>
                            </select>
                            <select
                              value={editingValues?.level || 'beginner'}
                              onChange={(e) => setEditingValues(prev => prev ? {...prev, level: e.target.value as Skill['level']} : null)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="beginner">Débutant</option>
                              <option value="intermediate">Intermédiaire</option>
                              <option value="advanced">Avancé</option>
                              <option value="expert">Expert</option>
                            </select>
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
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[skill.category].bg} ${categoryColors[skill.category].text}`}>
                                    {categoryLabels[skill.category]}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {levelLabels[skill.level]}
                                  </span>
                                </div>
                                <h3 className="font-medium text-gray-900">{skill.name}</h3>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => startEditing(skill)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Modifier"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setDeletingId(skill.id)}
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
                        Êtes-vous sûr de vouloir supprimer cette compétence ?
                      </p>
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => deleteSkill(deletingId)}
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