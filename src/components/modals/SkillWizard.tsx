import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon, PencilIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import CustomDropdown from '../ui/CustomDropdown';
import { useCV } from '../../contexts/CVContext';

interface Skill {
  id: string;
  name: string;
  category: 'design' | 'development' | 'marketing' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface SkillWizardProps {
  isOpen: boolean;
  onClose: () => void;
  skills: Skill[];
  onSave: (skills: Skill[]) => void;
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
  other: 'Autre',
};

const levelLabels = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
  expert: 'Expert',
};

const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({ value, label }));
const levelOptions = Object.entries(levelLabels).map(([value, label]) => ({ value, label }));

export default function SkillWizard({ isOpen, onClose, skills, onSave }: SkillWizardProps) {
  const { selectedCV, updateCV } = useCV();
  const [localSkills, setLocalSkills] = useState<Skill[]>(skills);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Skill | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState<Omit<Skill, 'id'>>({ 
    name: '', 
    category: 'design', 
    level: 'intermediate' 
  });

  // Synchroniser avec les données Firebase quand elles arrivent
  useEffect(() => {
    setLocalSkills(skills);
  }, [skills]);

  // Fonction pour sauvegarder automatiquement dans Firebase
  const saveToFirebase = async (updatedSkills: Skill[]) => {
    if (selectedCV) {
      try {
        // Convertir les skills vers le format Firebase avec mapping des niveaux
        const firebaseSkills = updatedSkills.map(skill => ({
          id: skill.id,
          name: skill.name,
          category: skill.category,
          level: levelLabels[skill.level] as 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert'
        }));
        
        await updateCV(selectedCV.id!, { skills: firebaseSkills });
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des compétences:', error);
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
      const skill = localSkills.find(s => s.id === id);
      if (skill) {
        setEditingId(id);
        setEditingValues({ ...skill });
      }
    }
  };

    const handleSaveEdit = async (id: string) => {
    if (editingValues && editingValues.name.trim() && editingValues.category && editingValues.level) {
      const updatedSkills = localSkills.map(skill => 
        skill.id === id ? editingValues : skill
      );
      setLocalSkills(updatedSkills);
      setEditingId(null);
      setEditingValues(null);
      
      // Sauvegarder automatiquement dans Firebase
      await saveToFirebase(updatedSkills);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValues(null);
  };

  const handleUpdate = (field: keyof Skill, value: string) => {
    if (editingValues) {
      setEditingValues(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleConfirmDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleDelete = async (id: string) => {
    const updatedSkills = localSkills.filter(skill => skill.id !== id);
    setLocalSkills(updatedSkills);
    setDeletingId(null);
    
    // Sauvegarder automatiquement dans Firebase
    await saveToFirebase(updatedSkills);
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
  };

    const handleAddNew = async () => {
    if (newSkill.name && newSkill.category && newSkill.level) {
      const newId = Date.now().toString();
      const skillToAdd: Skill = { ...newSkill, id: newId };
      const updatedSkills = [...localSkills, skillToAdd];
      setLocalSkills(updatedSkills);
      setNewSkill({ name: '', category: 'development', level: 'beginner' });
      
      // Sauvegarder automatiquement dans Firebase
      await saveToFirebase(updatedSkills);
    }
  };

  const handleSave = () => {
    onSave(localSkills);
    onClose();
  };

  const handleClose = () => {
    setLocalSkills(skills); // Reset to original state
    setEditingId(null);
    setEditingValues(null);
    setDeletingId(null);
    setNewSkill({ name: '', category: 'design', level: 'intermediate' });
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Gestion des Compétences
                  </Dialog.Title>
                  <button
                    type="button"
                    className="btn-custom rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {localSkills.map((skill) => (
                    <div key={skill.id} className={`border rounded-lg p-4 ${
                      deletingId === skill.id ? 'border-red-300 bg-red-50' : 
                      editingId === skill.id ? 'border-blue-300 bg-blue-50' : 
                      'border-gray-200 bg-gray-50'
                    }`}>
                      {deletingId === skill.id ? (
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
                              onClick={() => handleDelete(skill.id)}
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
                            {editingId === skill.id && editingValues ? (
                              <>
                                <input
                                  type="text"
                                  value={editingValues.name}
                                  onChange={(e) => handleUpdate('name', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                                  placeholder="Nom de la compétence"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                  <CustomDropdown
                                    value={editingValues.category}
                                    onChange={(value) => handleUpdate('category', value)}
                                    options={categoryOptions}
                                    placeholder="Catégorie"
                                  />
                                  <CustomDropdown
                                    value={editingValues.level}
                                    onChange={(value) => handleUpdate('level', value)}
                                    options={levelOptions}
                                    placeholder="Niveau"
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center space-x-3">
                                  <span className={`${categoryColors[skill.category].bg} ${categoryColors[skill.category].text} px-3 py-1 rounded-full text-sm font-medium`}>
                                    {skill.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {categoryLabels[skill.category]} • {levelLabels[skill.level]}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="ml-4 flex space-x-2">
                            {editingId === skill.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(skill.id)}
                                  disabled={!editingValues?.name.trim()}
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
                                  onClick={() => handleEdit(skill.id)}
                                  className="btn-custom p-2 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                                  title="Modifier cette compétence"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmDelete(skill.id)}
                                  className="btn-custom p-2 text-gray-600 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md"
                                  title="Supprimer cette compétence"
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

                {/* Add New Skill Section */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Ajouter une nouvelle compétence</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="Nom de la compétence (ex: Figma, React, SEO...)"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <CustomDropdown
                        value={newSkill.category}
                        onChange={(value) => setNewSkill(prev => ({ ...prev, category: value as Skill['category'] }))}
                        options={categoryOptions}
                        placeholder="Catégorie"
                      />
                      <CustomDropdown
                        value={newSkill.level}
                        onChange={(value) => setNewSkill(prev => ({ ...prev, level: value as Skill['level'] }))}
                        options={levelOptions}
                        placeholder="Niveau"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddNew}
                      disabled={!newSkill.name.trim()}
                      className="btn-custom flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Ajouter la compétence
                    </button>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn-custom px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    onClick={handleClose}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn-custom px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
