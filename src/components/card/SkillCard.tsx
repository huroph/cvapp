
import { useState, useEffect } from 'react';
import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import Card from "./Card";
import HeaderCard from "./HeaderCard";
import DropdownMenu from "../ui/DropdownMenu";
import EditSkillsModal from "../modals/EditSkillsModal";
import AddSkillModal from "../modals/AddSkillModal";
import { useCV } from "../../contexts/CVContext";

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

interface SkillCardProps {
  // Props supprimées car on utilise maintenant le contexte CV
}

// Fonction pour mapper les catégories Firebase vers les catégories de la card
const mapCategory = (category: string): 'design' | 'development' | 'marketing' | 'other' => {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('design') || lowerCategory.includes('outils de design')) return 'design';
  if (lowerCategory.includes('framework') || lowerCategory.includes('langage') || lowerCategory.includes('base de données') || lowerCategory.includes('développement')) return 'development';
  if (lowerCategory.includes('marketing') || lowerCategory.includes('métier') || lowerCategory.includes('gestion')) return 'marketing';
  return 'other';
};

// Fonction pour mapper les niveaux Firebase vers les niveaux de la card
const mapLevel = (level: string): 'beginner' | 'intermediate' | 'advanced' | 'expert' => {
  switch (level) {
    case 'Débutant': return 'beginner';
    case 'Intermédiaire': return 'intermediate';
    case 'Avancé': return 'advanced';
    case 'Expert': return 'expert';
    default: return 'intermediate';
  }
};

export default function SkillCard({}: SkillCardProps = {}) {
    const { selectedCV } = useCV();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Convertir les skills du CV sélectionné vers le format attendu par la card
    const [skills, setSkills] = useState<Skill[]>([]);
    
    useEffect(() => {
        if (selectedCV?.skills) {
            const convertedSkills = selectedCV.skills.map(skill => ({
                id: skill.id,
                name: skill.name,
                category: mapCategory(skill.category),
                level: mapLevel(skill.level)
            }));
            setSkills(convertedSkills);
        }
    }, [selectedCV]);

    const handleSaveSkills = (newSkills: Skill[]) => {
        setSkills(newSkills);
    };

    if (!selectedCV) return null;

    return (
        <>
            <Card intensity={0.5} >
                <div className="flex items-center justify-between group">
                    <HeaderCard title="Compétences" color="text-green-500" />
                    <DropdownMenu
                        options={[
                            {
                                label: "Modifier",
                                icon: <PencilIcon className="h-4 w-4 text-blue-600" />,
                                onClick: () => setIsEditModalOpen(true),
                                className: "text-gray-700"
                            },
                            {
                                label: "Ajouter",
                                icon: <PlusIcon className="h-4 w-4 text-green-600" />,
                                onClick: () => setIsAddModalOpen(true),
                                className: "text-gray-700"
                            }
                        ]}
                        title="Gérer les compétences"
                    />
                </div>
                <div className="flex flex-col items-start">
                    <div className="flex flex-wrap gap-2 mt-2">
                        {skills.map((skill) => {
                            const colorClasses = categoryColors[skill.category];
                            return (
                                <span
                                    key={skill.id}
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses.bg} ${colorClasses.text}`}
                                >
                                    {skill.name}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </Card>

            <EditSkillsModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                skills={skills}
                onSave={handleSaveSkills}
            />
            
            <AddSkillModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                skills={skills}
                onSave={handleSaveSkills}
            />
        </>
    );
}
