import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useCV } from '../../contexts/CVContext';

interface Skill {
  id: string;
  name: string;
  category: 'design' | 'development' | 'marketing' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: Skill[];
  onSave: (skills: Skill[]) => void;
}

export default function AddSkillModal({ isOpen, onClose, skills, onSave }: AddSkillModalProps) {
  const { selectedCV, updateCV } = useCV();
  const [newSkill, setNewSkill] = useState<Pick<Skill, 'name' | 'category' | 'level'>>({
    name: '',
    category: 'other',
    level: 'beginner'
  });
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setNewSkill({
      name: '',
      category: 'other',
      level: 'beginner'
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addSkill = async () => {
    if (newSkill.name) {
      setIsLoading(true);
      
      const skillToAdd: Skill = {
        id: Date.now().toString(),
        ...newSkill
      };
      
      const updatedSkills = [...skills, skillToAdd];
      
      // Sauvegarder dans Firebase
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
          onSave(updatedSkills);
          resetForm();
          onClose();
        } catch (error) {
          console.error('Erreur lors de la sauvegarde:', error);
        }
      }
      
      setIsLoading(false);
    }
  };

  const isFormValid = newSkill.name.trim() !== '';

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                    Ajouter une compétence
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
                      Nom de la compétence *
                    </label>
                    <input
                      type="text"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: React, Photoshop, SEO..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={newSkill.category}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value as Skill['category'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="design">Design</option>
                      <option value="development">Développement</option>
                      <option value="marketing">Marketing</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau
                    </label>
                    <select
                      value={newSkill.level}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, level: e.target.value as Skill['level'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="beginner">Débutant</option>
                      <option value="intermediate">Intermédiaire</option>
                      <option value="advanced">Avancé</option>
                      <option value="expert">Expert</option>
                    </select>
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
                    onClick={addSkill}
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