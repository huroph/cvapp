
import Card from "./Card";
import { useProfile } from "../../contexts/ProfileContext";

interface ProfilCardProps {
  // Props supprimées car on utilise maintenant le contexte Profile
}

export default function ProfilCard({}: ProfilCardProps = {}) {
    const { profile } = useProfile();
    
    if (!profile) return null;
    
    // Utiliser le poste recherché du profil global
    const position = profile.position || '';
    
    return (
          <Card className="flex">
                  <div className="w-20 h-20 bg-gray-200 rounded-full" />
                  <div className="flex flex-col items-start">
                    <div className="text-2xl font-bold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </div>
                    <div className="flex gap-2 text-gray-500 mb-1">
                      <span>🇫🇷 {profile.location}</span>
                    </div>
                    <div className="flex flex-col text-sm text-gray-600 text-left">
                      <span>{profile.email}</span>
                      <span>{profile.phone}</span>
                    </div>
                    {position && (
                      <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {position}
                      </span>
                    )}
                  </div>
                </Card>
    );
    }