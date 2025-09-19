import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useProfile } from '../../contexts/ProfileContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserType } from '../../types/user';
import Header from './Header';
import RecruiterSidebar from './RecruiterSidebar';
import RecruiterOnboarding from '../modals/RecruiterOnboarding';
import RecruiterHome from '../../pages/RecruiterHome';
import Profile from '../../pages/Profile';

export default function RecruiterLayout() {
  const { profile, loading: profileLoading } = useProfile();
  const { getUserType } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Vérifier si le profil recruteur est complet
  const isRecruiterProfileComplete = () => {
    if (!profile) return false;
    return profile.firstName && profile.lastName && profile.position && profile.location;
  };

  useEffect(() => {
    if (!profileLoading && getUserType() === UserType.RECRUTEUR && !isRecruiterProfileComplete()) {
      setShowOnboarding(true);
    }
  }, [profileLoading, profile, getUserType]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Layout principal */}
      <div className="h-screen bg-gray-100">
        {!showOnboarding && <RecruiterSidebar />}
        <div className={`h-full flex flex-col ${!showOnboarding ? 'ml-72' : ''}`}>
          {!showOnboarding && <Header />}
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<RecruiterHome />} />
              <Route path="/recruiter/dashboard" element={<RecruiterHome />} />
              <Route path="/profil" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* Onboarding Recruteur */}
      <RecruiterOnboarding 
        isOpen={showOnboarding} 
        onComplete={handleOnboardingComplete} 
      />
    </>
  );
}