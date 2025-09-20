

import { useState, useEffect } from 'react';
import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import Card from "./Card";
import HeaderCard from "./HeaderCard";
import DropdownMenu from "../ui/DropdownMenu";
import EditExperiencesModal from "../modals/EditExperiencesModal";
import AddExperienceModal from "../modals/AddExperienceModal";
import ExperienceList from "../lists/ExperienceList";
import { useCV } from "../../contexts/CVContext";

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  duration: string;
  skills: string[];
  description?: string;
}

// Interface pour les modaux
interface ExperienceModal {
  id: string;
  position: string;
  company: string;
  period: string;
  location: string;
  description: string;
}

const skillColors = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-red-100 text-red-700',
  'bg-yellow-100 text-yellow-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
];

const skillLabels: { [key: string]: string } = {
  'figma': 'Figma',
  'jira': 'Jira',
  'photoshop': 'Photoshop',
  'illustrator': 'Illustrator',
  'react': 'React',
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'nodejs': 'Node.js',
  'python': 'Python',
};

interface ExperienceCardProps {
  // Props supprimées car on utilise maintenant le contexte CV
}

// Fonction pour calculer la durée entre deux dates
const calculateDuration = (startDate: string, endDate: string, isCurrentJob: boolean): string => {
  if (isCurrentJob) {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    
    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''} ${months > 0 ? `${months} mois` : ''}`;
    }
    return `${months} mois`;
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;
  
  if (years > 0) {
    return `${years} an${years > 1 ? 's' : ''} ${months > 0 ? `${months} mois` : ''}`;
  }
  return `${months} mois`;
};

export default function ExperienceCard({}: ExperienceCardProps = {}) {
    const { selectedCV } = useCV();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Convertir les expériences du CV sélectionné vers le format attendu par la card
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [modalExperiences, setModalExperiences] = useState<ExperienceModal[]>([]);
    
    useEffect(() => {
        if (selectedCV?.experiences) {
            const convertedExperiences = selectedCV.experiences.map(exp => ({
                id: exp.id,
                company: exp.company,
                position: exp.position,
                location: exp.location,
                duration: calculateDuration(exp.startDate, exp.endDate, exp.isCurrentJob),
                skills: [], // Les skills peuvent être ajoutés plus tard
                description: exp.description
            }));
            setExperiences(convertedExperiences);
            
            // Convertir pour les modaux
            const modalExps = selectedCV.experiences.map(exp => ({
                id: exp.id,
                position: exp.position,
                company: exp.company,
                location: exp.location,
                period: exp.isCurrentJob ? `${exp.startDate} - Présent` : `${exp.startDate} - ${exp.endDate}`,
                description: exp.description
            }));
            setModalExperiences(modalExps);
        }
    }, [selectedCV]);

    // const handleSaveExperiences = (newExperiences: Experience[]) => {
    //     setExperiences(newExperiences);
    // };
    
    const handleSaveModalExperiences = (newModalExperiences: ExperienceModal[]) => {
        setModalExperiences(newModalExperiences);
        // Optionnel: synchroniser avec les expériences d'affichage
    };

    return (
        <>
            <Card intensity={0.5} >
                <div className="flex items-center justify-between group">
                    <HeaderCard title="Expérience" color="text-orange-500" />
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
                        title="Gérer les expériences"
                    />
                </div>
                
                <ExperienceList 
                    experiences={experiences}
                    skillColors={skillColors}
                    skillLabels={skillLabels}
                />
            </Card>

            <EditExperiencesModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                experiences={modalExperiences}
                onSave={handleSaveModalExperiences}
            />
            
            <AddExperienceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                experiences={modalExperiences}
                onSave={handleSaveModalExperiences}
            />
        </>
    );
}