import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';
}

interface SkillStepProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

const skillCategories = [
  'Langages de programmation',
  'Frameworks & Librairies',
  'Bases de données',
  'Outils & Technologies',
  'Langues',
  'Compétences métier',
  'Soft skills'
];

const skillLevels: Array<'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert'> = [
  'Débutant',
  'Intermédiaire', 
  'Avancé',
  'Expert'
];

export default function SkillStep({ data, onChange }: SkillStepProps) {
  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      category: skillCategories[0],
      level: 'Intermédiaire'
    };
    onChange([...data, newSkill]);
    toast.success('Compétence ajoutée');
  };

  const removeSkill = (id: string) => {
    const skill = data.find(s => s.id === id);
    onChange(data.filter(skill => skill.id !== id));
    toast.success(`Compétence ${skill?.name || 'compétence'} supprimée`);
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    const skill = data.find(s => s.id === id);
    const previousValue = skill?.[field] || '';
    
    onChange(data.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
    
    // Toast informatif seulement pour les changements significatifs
    if (value.trim() && skill && previousValue !== value && 
        (value.length > 2 || field === 'level' || field === 'category')) {
      const fieldNames: Record<keyof Skill, string> = {
        id: 'ID',
        name: 'nom de la compétence',
        category: 'catégorie',
        level: 'niveau'
      };
      toast.success(`${fieldNames[field]} mis à jour`, { duration: 2000 });
    }
  };

  const groupedSkills = skillCategories.reduce((acc, category) => {
    acc[category] = data.filter(skill => skill.category === category);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Compétences</h3>
        <p className="text-sm text-gray-600 mb-6">
          Listez vos compétences techniques et professionnelles organisées par catégorie.
        </p>
      </div>

      <div className="space-y-8">
        {skillCategories.map(category => (
          <div key={category} className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">{category}</h4>
            
            <div className="space-y-4">
              {groupedSkills[category].map((skill) => (
                <div key={skill.id} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                      placeholder="Nom de la compétence"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                    />
                  </div>
                  
                  <div className="w-40">
                    <select
                      value={skill.level}
                      onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    >
                      {skillLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={() => removeSkill(skill.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Supprimer cette compétence"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newSkill: Skill = {
                    id: Date.now().toString(),
                    name: '',
                    category: category,
                    level: 'Intermédiaire'
                  };
                  onChange([...data, newSkill]);
                }}
                className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Ajouter une compétence en {category}
              </button>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8">
          <button
            onClick={addSkill}
            className="flex items-center justify-center px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-500 transition-colors mx-auto"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Ajouter votre première compétence
          </button>
        </div>
      )}
    </div>
  );
}