import { useState } from 'react';
import Alert from '../../ui/Alert';

interface BasicInfo {
  title: string;
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  phone: string;
  location: string;
}

interface BasicInfoStepProps {
  data: BasicInfo;
  onChange: (data: BasicInfo) => void;
  readOnlyFields?: (keyof BasicInfo)[];
}

export default function BasicInfoStep({ data, onChange, readOnlyFields = [] }: BasicInfoStepProps) {
  const [copyTitleToPosition, setCopyTitleToPosition] = useState(false);

  const handleChange = (field: keyof BasicInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnlyFields.includes(field)) return;
    
    const newData = {
      ...data,
      [field]: e.target.value
    };

    // Si on modifie le titre et que la copie automatique est activée, copier vers le poste
    if (field === 'title' && copyTitleToPosition) {
      newData.position = e.target.value;
    }

    onChange(newData);
  };

  const handleCopyToggle = (checked: boolean) => {
    setCopyTitleToPosition(checked);
    // Si on active la copie, copier immédiatement le titre actuel vers le poste
    if (checked && data.title) {
      onChange({
        ...data,
        position: data.title
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Zone d'information */}
      <Alert variant="information" title="Informations synchronisées">
        <p>Votre nom, prénom, email, téléphone et localisation sont automatiquement récupérés depuis votre profil.</p>
      </Alert>

      <div className="space-y-6">
        {/* Titre du CV */}
        <div>
          <label htmlFor="cv-title" className="block text-sm font-medium text-gray-700 mb-2">
            Titre du CV *
          </label>
          <input
            id="cv-title"
            type="text"
            value={data.title}
            onChange={handleChange('title')}
            placeholder="Ex: CV Développeur Full-Stack, CV Marketing Digital..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Poste recherché */}
        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
            Poste recherché *
          </label>
          <input
            id="position"
            type="text"
            value={data.position}
            onChange={handleChange('position')}
            placeholder="Ex: Développeur Full-Stack, Chef de projet..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
          />
          
          {/* Checkbox pour copier le titre vers le poste */}
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={copyTitleToPosition}
                onChange={(e) => handleCopyToggle(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">
                Utiliser le titre du CV comme poste recherché
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}