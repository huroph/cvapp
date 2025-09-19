import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Experience {
  id: string;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrentJob: boolean;
  description: string;
  achievements: string[];
}

interface ExperienceStepProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
  canDelete?: boolean;
  onDelete?: () => void;
}

export default function ExperienceStep({ data, onChange, canDelete = false, onDelete }: ExperienceStepProps) {
  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      position: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrentJob: false,
      description: '',
      achievements: ['']
    };
    onChange([...data, newExperience]);
    toast.success('Expérience ajoutée');
  };

  const removeExperience = (id: string) => {
    const experience = data.find(exp => exp.id === id);
    onChange(data.filter(experience => experience.id !== id));
    toast.success(`Expérience ${experience?.position || 'expérience'} supprimée`);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean | string[]) => {
    const experience = data.find(exp => exp.id === id);
    const previousValue = experience?.[field];
    
    onChange(data.map(experience => 
      experience.id === id ? { ...experience, [field]: value } : experience
    ));
    
    // Toast informatif pour les modifications significatives
    if (experience && field !== 'achievements' && field !== 'id' && previousValue !== value) {
      const fieldNames: Record<string, string> = {
        position: 'poste',
        company: 'entreprise', 
        location: 'lieu',
        startDate: 'date de début',
        endDate: 'date de fin',
        isCurrentJob: 'poste actuel',
        description: 'description'
      };
      
      if (typeof value === 'string' && value.trim() && value.length > 2) {
        toast.success(`${fieldNames[field] || field} mis à jour`, { duration: 2000 });
      } else if (typeof value === 'boolean') {
        toast.success(`${fieldNames[field] || field} mis à jour`, { duration: 2000 });
      }
    }
  };

  const addAchievement = (experienceId: string) => {
    const experience = data.find(exp => exp.id === experienceId);
    if (experience) {
      updateExperience(experienceId, 'achievements', [...experience.achievements, '']);
      toast.success('Nouvelle réalisation ajoutée');
    }
  };

  const removeAchievement = (experienceId: string, achievementIndex: number) => {
    const experience = data.find(exp => exp.id === experienceId);
    if (experience) {
      const newAchievements = experience.achievements.filter((_, index) => index !== achievementIndex);
      updateExperience(experienceId, 'achievements', newAchievements);
      toast.success('Réalisation supprimée');
    }
  };

  const updateAchievement = (experienceId: string, achievementIndex: number, value: string) => {
    const experience = data.find(exp => exp.id === experienceId);
    if (experience) {
      const newAchievements = experience.achievements.map((achievement, index) => 
        index === achievementIndex ? value : achievement
      );
      updateExperience(experienceId, 'achievements', newAchievements);
    }
  };

  return (
   
      

      <div className="">
        {data.map((experience, index) => (
          <div key={experience.id} className="">
            <div className="flex justify-end w-full mb-4">
              {canDelete && onDelete && (
                <button
                  onClick={onDelete}
                  className="text-gray-500 hover:text-red-700 p-1"
                  title="Supprimer cette formation"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Poste */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intitulé du poste *
                </label>
                <input
                  type="text"
                  value={experience.position}
                  onChange={(e) => updateExperience(experience.id, 'position', e.target.value)}
                  placeholder="Ex: Développeur Full-Stack, Chef de projet..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Entreprise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entreprise *
                </label>
                <input
                  type="text"
                  value={experience.company}
                  onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                  placeholder="Nom de l'entreprise"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Lieu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  value={experience.location}
                  onChange={(e) => updateExperience(experience.id, 'location', e.target.value)}
                  placeholder="Ville, Pays"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Dates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="month"
                  value={experience.startDate}
                  onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <div className="space-y-2">
                  <input
                    type="month"
                    value={experience.endDate}
                    onChange={(e) => updateExperience(experience.id, 'endDate', e.target.value)}
                    disabled={experience.isCurrentJob}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-gray-900"
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={experience.isCurrentJob}
                      onChange={(e) => {
                        updateExperience(experience.id, 'isCurrentJob', e.target.checked);
                        if (e.target.checked) {
                          updateExperience(experience.id, 'endDate', '');
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Poste actuel</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du poste
                </label>
                <textarea
                  value={experience.description}
                  onChange={(e) => updateExperience(experience.id, 'description', e.target.value)}
                  placeholder="Décrivez vos responsabilités principales..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Réalisations */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Réalisations clés
                </label>
                <div className="space-y-2">
                  {experience.achievements.map((achievement, achievementIndex) => (
                    <div key={achievementIndex} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => updateAchievement(experience.id, achievementIndex, e.target.value)}
                        placeholder="Ex: Amélioration des performances de 30%..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                      />
                      {experience.achievements.length > 1 && (
                        <button
                          onClick={() => removeAchievement(experience.id, achievementIndex)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Supprimer cette réalisation"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addAchievement(experience.id)}
                    className="flex items-center text-indigo-600 hover:text-indigo-500 text-sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Ajouter une réalisation
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Bouton d'ajout */}
        <button
          onClick={addExperience}
          className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Ajouter une expérience
        </button>
      </div>
  
  );
}