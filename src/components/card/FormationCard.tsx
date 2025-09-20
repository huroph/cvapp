import { useState, useEffect } from 'react';
import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import Card from "./Card";
import HeaderCard from "./HeaderCard";
import DropdownMenu from "../ui/DropdownMenu";
import EditFormationsModal from "../modals/EditFormationsModal";
import AddFormationModal from "../modals/AddFormationModal";
import { useCV } from "../../contexts/CVContext";

interface Formation {
  id: string;
  title: string;
  school: string;
  period: string;
}

interface FormationCardProps {
  // Props supprimées car on utilise maintenant le contexte CV
}

export default function FormationCard({}: FormationCardProps = {}) {
    const { selectedCV, updateCV } = useCV();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Convertir les formations du CV sélectionné vers le format attendu par la card
    const [formations, setFormations] = useState<Formation[]>([]);
    
    useEffect(() => {
        if (selectedCV?.formations) {
            const convertedFormations = selectedCV.formations.map(formation => ({
                id: formation.id,
                title: formation.degree,
                school: `${formation.school}${formation.location ? ` - ${formation.location}` : ''}`,
                period: `${formation.startYear} - ${formation.endYear}`
            }));
            setFormations(convertedFormations);
        }
    }, [selectedCV]);

    const handleSaveFormations = async (newFormations: Formation[]) => {
        setFormations(newFormations);
        
        if (selectedCV) {
            // Convertir les formations vers le format Firebase
            const firebaseFormations = newFormations.map(formation => {
                // Extraire l'école et la localisation
                const schoolParts = formation.school.split(' - ');
                const school = schoolParts[0];
                const location = schoolParts[1] || '';
                
                // Extraire les années de début et fin
                const periodParts = formation.period.split(' - ');
                const startYear = periodParts[0] || '';
                const endYear = periodParts[1] || '';
                
                return {
                    id: formation.id,
                    degree: formation.title,
                    school: school,
                    location: location,
                    startYear: startYear,
                    endYear: endYear,
                    description: ''
                };
            });
            
            try {
                await updateCV(selectedCV.id!, { formations: firebaseFormations });
            } catch (error) {
                console.error('Erreur lors de la sauvegarde des formations:', error);
            }
        }
    };

    if (!selectedCV) return null;

    return (
        <>
            <Card intensity={0.5} >
                <div className="flex items-center justify-between group">
                    <HeaderCard title="Formation" color="text-purple-500" />
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
                        title="Gérer les formations"
                        hoverBorder="purple-300"
                    />
                </div>
                <div className="flex flex-col space-y-4">
                    {formations.map((formation, index) => {
                        const originalFormation = selectedCV?.formations[index];
                        return (
                            <div key={formation.id} className="flex flex-col items-start">
                                <div className="text-lg font-semibold text-gray-900">{formation.title}</div>
                                <div className="text-sm text-gray-500">{formation.school}</div>
                                <div className="text-sm text-gray-500">{formation.period}</div>
                                {originalFormation?.description && (
                                    <div className="text-sm text-gray-600 mt-1">{originalFormation.description}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>

            <EditFormationsModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                formations={formations}
                onSave={handleSaveFormations}
            />
            
            <AddFormationModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                formations={formations}
                onSave={handleSaveFormations}
            />
        </>
    );
}
