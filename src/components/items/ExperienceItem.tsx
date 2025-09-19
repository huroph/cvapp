interface ExperienceItemProps {
  experience: {
    id: string;
    company: string;
    position: string;
    location: string;
    duration: string;
    skills: string[];
    description?: string;
  };
  skillColors: string[];
  skillLabels: { [key: string]: string };
}

export default function ExperienceItem({ experience, skillColors, skillLabels }: ExperienceItemProps) {
  const getSkillColor = (index: number) => {
    return skillColors[index % skillColors.length];
  };

  const getSkillLabel = (value: string) => {
    return skillLabels[value] || value;
  };

  return (
    <div className="flex flex-col gap-3 py-5">
      <div className="flex flex-col gap-2 w-full items-start">
        <div className="flex items-start gap-3 flex-wrap w-full">
          <h3 className="font-bold text-gray-800 text-xl tracking-tight text-left">{experience.company}</h3>
          <div className="flex flex-wrap gap-2">
            {experience.skills.map((skill, index) => (
              <span 
                key={skill}
                className={`${getSkillColor(index)} px-2.5 py-1 rounded-full text-xs font-medium`}
              >
                {getSkillLabel(skill)}
              </span>
            ))}
          </div>
        </div>
        <h4 className="text-base text-gray-900 font-semibold leading-tight text-left w-full">{experience.position}</h4>
        <div className="flex items-start gap-2 text-sm text-gray-600 w-full">
          <span>{experience.location}</span>
          <span className="text-gray-400">•</span>
          <span className="font-medium">{experience.duration}</span>
        </div>
        {experience.description && (
          <p className="text-sm text-gray-700 leading-relaxed mt-1 italic text-left w-full">{experience.description}</p>
        )}
      </div>
    </div>
  );
}
