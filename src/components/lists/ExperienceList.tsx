import ExperienceItem from '../items/ExperienceItem';

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  duration: string;
  skills: string[];
  description?: string;
}

interface ExperienceListProps {
  experiences: Experience[];
  skillColors: string[];
  skillLabels: { [key: string]: string };
}

export default function ExperienceList({ experiences, skillColors, skillLabels }: ExperienceListProps) {
  if (experiences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <p className="text-sm">Aucune expérience ajoutée</p>
        <p className="text-xs mt-1">Cliquez sur le bouton + pour ajouter votre première expérience</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {experiences.map((experience, index) => (
        <div key={experience.id}>
          <ExperienceItem
            experience={experience}
            skillColors={skillColors}
            skillLabels={skillLabels}
          />
          {index < experiences.length - 1 && (
            <div className="border-b border-gray-200"></div>
          )}
        </div>
      ))}
    </div>
  );
}
