import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Formation {
  id: string;
  degree: string;
  school: string;
  location: string;
  startYear: string;
  endYear: string;
  description: string;
}

interface FormationStepProps {
  data: Formation[];
  onChange: (data: Formation[]) => void;
  canDelete?: boolean;
  onDelete?: () => void;
}

export default function FormationStep({ data, onChange, canDelete = false, onDelete }: FormationStepProps) {
  const updateFormation = (id: string, field: keyof Formation, value: string) => {
    const formation = data.find(f => f.id === id);
    const previousValue = formation?.[field] || '';
    
    onChange(data.map(formation => 
      formation.id === id ? { ...formation, [field]: value } : formation
    ));
    
    // Toast informatif seulement si c'est un changement significatif (pas à chaque caractère)
    if (value.trim() && formation && previousValue !== value && 
        (value.length > 2 || field === 'startYear' || field === 'endYear')) {
      const fieldNames: Record<keyof Formation, string> = {
        id: 'ID',
        degree: 'diplôme',
        school: 'établissement',
        location: 'lieu',
        startYear: 'année de début',
        endYear: 'année de fin',
        description: 'description'
      };
      toast.success(`${fieldNames[field]} mis à jour`, { duration: 2000 });
    }
  };

  return (
  
      
      <div className="">
        {data.map((formation) => (
          <div key={formation.id} className=" relative">
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
              {/* Diplôme */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diplôme / Certification *
                </label>
                <input
                  type="text"
                  value={formation.degree}
                  onChange={(e) => updateFormation(formation.id, 'degree', e.target.value)}
                  placeholder="Ex: Master en Informatique, BTS SIO..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* École */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  École / Université *
                </label>
                <input
                  type="text"
                  value={formation.school}
                  onChange={(e) => updateFormation(formation.id, 'school', e.target.value)}
                  placeholder="Nom de l'établissement"
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
                  value={formation.location}
                  onChange={(e) => updateFormation(formation.id, 'location', e.target.value)}
                  placeholder="Ville, Pays"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Dates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Année de début
                </label>
                <input
                  type="text"
                  value={formation.startYear}
                  onChange={(e) => updateFormation(formation.id, 'startYear', e.target.value)}
                  placeholder="2020"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Année de fin
                </label>
                <input
                  type="text"
                  value={formation.endYear}
                  onChange={(e) => updateFormation(formation.id, 'endYear', e.target.value)}
                  placeholder="2022 ou En cours"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={formation.description}
                  onChange={(e) => updateFormation(formation.id, 'description', e.target.value)}
                  placeholder="Spécialisation, mention, projets remarquables..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        ))}

       
        
      </div>

  );
}