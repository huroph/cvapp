import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon, PencilIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import CustomDropdown from '../ui/CustomDropdown';
import { useCV } from '../../contexts/CVContext';

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  duration: string;
  skills: string[];
  description?: string;
}

interface ExperienceWizardProps {
  isOpen: boolean;
  onClose: () => void;
  experiences: Experience[];
  onSave: (experiences: Experience[]) => void;
}

const skillOptions = [
  { value: 'figma', label: 'Figma' },
  { value: 'photoshop', label: 'Photoshop' },
  { value: 'illustrator', label: 'Illustrator' },
  { value: 'react', label: 'React' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'jira', label: 'Jira' },
  { value: 'trello', label: 'Trello' },
  { value: 'notion', label: 'Notion' },
  { value: 'sketch', label: 'Sketch' },
  { value: 'adobe-xd', label: 'Adobe XD' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
];

const skillColors = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-red-100 text-red-700',
  'bg-yellow-100 text-yellow-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
];

export default function ExperienceWizard({ isOpen, onClose, experiences, onSave }: ExperienceWizardProps) {
  const { selectedCV, updateCV } = useCV();
  const [localExperiences, setLocalExperiences] = useState<Experience[]>(experiences);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Experience | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newExperience, setNewExperience] = useState<Omit<Experience, 'id'>>({ 
    company: '', 
    position: '', 
    location: '', 
    duration: '', 
    skills: [],
    description: ''
  });
  const [selectedSkill, setSelectedSkill] = useState<string>('');

  // Synchroniser avec les données Firebase quand elles arrivent
  useEffect(() => {
    setLocalExperiences(experiences);
  }, [experiences]);

  // Fonction pour sauvegarder automatiquement dans Firebase
  const saveToFirebase = async (updatedExperiences: Experience[]) => {
    if (selectedCV) {
      try {
        // Convertir les expériences vers le format Firebase
        const firebaseExperiences = updatedExperiences.map(experience => {
          // Convertir la durée en startDate/endDate
          const durationParts = experience.duration.split(' - ');
          const startDate = durationParts[0] || '';
          const endDate = durationParts[1] || '';
          
          return {
            id: experience.id,
            position: experience.position,
            company: experience.company,
            location: experience.location,
            startDate: startDate,
            endDate: endDate,
            isCurrentJob: endDate.toLowerCase().includes('présent') || endDate === '',
            description: experience.description || '',
            achievements: [] as string[] // Le wizard ne gère pas les achievements pour l'instant
          };
        });
        
        await updateCV(selectedCV.id!, { experiences: firebaseExperiences });
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des expériences:', error);
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
      const experience = localExperiences.find(e => e.id === id);
      if (experience) {
        setEditingId(id);
        setEditingValues({ ...experience });
      }
    }
  };

    const handleSaveEdit = async (id: string) => {
    if (editingValues && editingValues.company.trim() && editingValues.position.trim()) {
      const updatedExperiences = localExperiences.map(experience => 
        experience.id === id ? editingValues : experience
      );
      setLocalExperiences(updatedExperiences);
      setEditingId(null);
      setEditingValues(null);
      
      // Sauvegarder automatiquement dans Firebase
      await saveToFirebase(updatedExperiences);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValues(null);
  };

  const handleUpdate = (field: keyof Experience, value: string | string[]) => {
    if (editingValues) {
      setEditingValues(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleConfirmDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleDelete = async (id: string) => {
    const updatedExperiences = localExperiences.filter(experience => experience.id !== id);
    setLocalExperiences(updatedExperiences);
    setDeletingId(null);
    
    // Sauvegarder automatiquement dans Firebase
    await saveToFirebase(updatedExperiences);
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
  };

  const handleAddSkillToExperience = (experienceId: string, skill: string) => {
    if (skill && editingValues && editingValues.id === experienceId) {
      setEditingValues(prev => prev ? { 
        ...prev, 
        skills: [...prev.skills, skill] 
      } : null);
    }
  };

  const handleRemoveSkillFromExperience = (experienceId: string, skillToRemove: string) => {
    if (editingValues && editingValues.id === experienceId) {
      setEditingValues(prev => prev ? { 
        ...prev, 
        skills: prev.skills.filter(skill => skill !== skillToRemove) 
      } : null);
    }
  };

  const handleAddSkillToNew = () => {
    if (selectedSkill && !newExperience.skills.includes(selectedSkill)) {
      setNewExperience(prev => ({ 
        ...prev, 
        skills: [...prev.skills, selectedSkill] 
      }));
      setSelectedSkill('');
    }
  };

  const handleRemoveSkillFromNew = (skillToRemove: string) => {
    setNewExperience(prev => ({ 
      ...prev, 
      skills: prev.skills.filter(skill => skill !== skillToRemove) 
    }));
  };

    const handleAddNew = async () => {
    if (newExperience.company && newExperience.position && newExperience.location && newExperience.duration) {
      const newId = Date.now().toString();
      const experienceToAdd: Experience = { ...newExperience, id: newId };
      const updatedExperiences = [...localExperiences, experienceToAdd];
      setLocalExperiences(updatedExperiences);
      setNewExperience({ 
        company: '', 
        position: '', 
        location: '', 
        duration: '', 
        skills: [],
        description: ''
      });
      
      // Sauvegarder automatiquement dans Firebase
      await saveToFirebase(updatedExperiences);
    }
  };

  const handleSave = () => {
    onSave(localExperiences);
    onClose();
  };

  const handleClose = () => {
    setLocalExperiences(experiences); // Reset to original state
    setEditingId(null);
    setEditingValues(null);
    setDeletingId(null);
    setNewExperience({ 
      company: '', 
      position: '', 
      location: '', 
      duration: '', 
      skills: [],
      description: ''
    });
    setSelectedSkill('');
    onClose();
  };

  const getSkillColor = (index: number) => {
    return skillColors[index % skillColors.length];
  };

  const getSkillLabel = (value: string) => {
    return skillOptions.find(option => option.value === value)?.label || value;
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Gestion des Expériences
                  </Dialog.Title>
                  <button
                    type="button"
                    className="btn-custom rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {localExperiences.map((experience) => (
                    <div key={experience.id} className={`border rounded-lg p-4 ${
                      deletingId === experience.id ? 'border-red-300 bg-red-50' : 
                      editingId === experience.id ? 'border-orange-300 bg-orange-50' : 
                      'border-gray-200 bg-gray-50'
                    }`}>
                      {deletingId === experience.id ? (
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
                              onClick={() => handleDelete(experience.id)}
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
                            {editingId === experience.id && editingValues ? (
                              <>
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    value={editingValues.company}
                                    onChange={(e) => handleUpdate('company', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                                    placeholder="Nom de l'entreprise"
                                  />
                                  <input
                                    type="text"
                                    value={editingValues.position}
                                    onChange={(e) => handleUpdate('position', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                                    placeholder="Poste occupé"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    value={editingValues.location}
                                    onChange={(e) => handleUpdate('location', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                                    placeholder="Lieu (ex: Paris, France)"
                                  />
                                  <input
                                    type="text"
                                    value={editingValues.duration}
                                    onChange={(e) => handleUpdate('duration', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                                    placeholder="Durée (ex: 1 an 10 mois)"
                                  />
                                </div>
                                <textarea
                                  value={editingValues.description || ''}
                                  onChange={(e) => handleUpdate('description', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                                  placeholder="Description de l'expérience (optionnel)"
                                  rows={3}
                                />
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Compétences utilisées</label>
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {editingValues.skills.map((skill, index) => (
                                      <span 
                                        key={skill}
                                        className={`${getSkillColor(index)} px-2 py-1 rounded-full text-xs flex items-center gap-1`}
                                      >
                                        {getSkillLabel(skill)}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveSkillFromExperience(experience.id, skill)}
                                          className="hover:bg-black/10 rounded-full p-0.5"
                                        >
                                          <XMarkIcon className="h-3 w-3" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                  <div className="flex gap-2">
                                    <CustomDropdown
                                      value=""
                                      onChange={(skill) => handleAddSkillToExperience(experience.id, skill)}
                                      options={skillOptions.filter(option => !editingValues.skills.includes(option.value))}
                                      placeholder="Ajouter une compétence"
                                      className="flex-1"
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-lg font-semibold text-gray-900">{experience.company}</div>
                                <div className="text-sm text-gray-600">{experience.position} • {experience.location}</div>
                                <div className="text-sm text-gray-600">{experience.duration}</div>
                                {experience.description && (
                                  <div className="text-sm text-gray-700 mt-2">{experience.description}</div>
                                )}
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {experience.skills.map((skill, index) => (
                                    <span 
                                      key={skill}
                                      className={`${getSkillColor(index)} px-2 py-1 rounded-full text-xs`}
                                    >
                                      {getSkillLabel(skill)}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="ml-4 flex space-x-2">
                            {editingId === experience.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(experience.id)}
                                  disabled={!editingValues?.company.trim() || !editingValues?.position.trim()}
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
                                  onClick={() => handleEdit(experience.id)}
                                  className="btn-custom p-2 text-gray-600 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-md"
                                  title="Modifier cette expérience"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmDelete(experience.id)}
                                  className="btn-custom p-2 text-gray-600 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md"
                                  title="Supprimer cette expérience"
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

                {/* Add New Experience Section */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Ajouter une nouvelle expérience</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newExperience.company}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                        placeholder="Nom de l'entreprise"
                      />
                      <input
                        type="text"
                        value={newExperience.position}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, position: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                        placeholder="Poste occupé"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newExperience.location}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                        placeholder="Lieu (ex: Paris, France)"
                      />
                      <input
                        type="text"
                        value={newExperience.duration}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                        placeholder="Durée (ex: 1 an 10 mois)"
                      />
                    </div>
                    <textarea
                      value={newExperience.description}
                      onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-500"
                      placeholder="Description de l'expérience (optionnel)"
                      rows={3}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Compétences utilisées</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {newExperience.skills.map((skill, index) => (
                          <span 
                            key={skill}
                            className={`${getSkillColor(index)} px-2 py-1 rounded-full text-xs flex items-center gap-1`}
                          >
                            {getSkillLabel(skill)}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkillFromNew(skill)}
                              className="hover:bg-black/10 rounded-full p-0.5"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <CustomDropdown
                          value={selectedSkill}
                          onChange={setSelectedSkill}
                          options={skillOptions.filter(option => !newExperience.skills.includes(option.value))}
                          placeholder="Sélectionner une compétence"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={handleAddSkillToNew}
                          disabled={!selectedSkill}
                          className="btn-custom px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddNew}
                      disabled={!newExperience.company.trim() || !newExperience.position.trim()}
                      className="btn-custom flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Ajouter l'expérience
                    </button>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn-custom px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                    onClick={handleClose}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn-custom px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
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