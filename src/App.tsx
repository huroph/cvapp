

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from 'react-hot-toast';
import { Home, Profile } from "./pages";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import UserTypeRedirect from "./components/auth/UserTypeRedirect";
import Sidebar from "./components/layout/Sidebar";
import RecruiterLayout from "./components/layout/RecruiterLayout";
import { CVProvider } from "./contexts/CVContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProfileProvider, useProfile } from "./contexts/ProfileContext";
import OnboardingWizard from "./components/modals/OnboardingWizard";
import SharedCVPage from "./pages/SharedCVPage";
import CVPreviewPage from "./pages/CVPreviewPage";
import Card3DDemo from "./components/card/Card3DDemo";
import { UserType } from "./types/user";

import "./App.css";

function AppContent() {
  const { isProfileComplete, loading: profileLoading, profile } = useProfile();
  const { userType, currentUser, loading: authLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  console.log('🔍 AppContent - État:', {
    authLoading,
    profileLoading,
    userType,
    currentUser: currentUser?.uid,
    profile: profile ? 'exists' : 'null',
    isComplete: isProfileComplete()
  });

  // Timeout de sécurité pour éviter les loadings infinis
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading || profileLoading) {
        console.log('⚠️ Timeout loading - Forcer l\'affichage');
        setLoadingTimeout(true);
      }
    }, 10000); // 10 secondes max

    return () => clearTimeout(timer);
  }, [authLoading, profileLoading]);

  useEffect(() => {
    console.log('🔍 Effect onboarding - Vérification:', {
      authLoading,
      profileLoading,
      userType,
      isCandidat: userType === UserType.CANDIDAT,
      isComplete: isProfileComplete(),
      onboardingDone: profile?.onboardingDone,
      shouldShow: !authLoading && !profileLoading && userType === UserType.CANDIDAT && !profile?.onboardingDone
    });

    if (!authLoading && !profileLoading && userType === UserType.CANDIDAT && profile && profile.onboardingDone === false) {
      console.log('✅ Déclenchement onboarding (profil existe, onboardingDone = false)');
      setShowOnboarding(true);
    } else {
      console.log('❌ Pas d\'onboarding nécessaire');
    }
  }, [authLoading, profileLoading, isProfileComplete, userType]);

  const handleOnboardingComplete = () => {
    console.log('✅ Onboarding terminé');
    setShowOnboarding(false);
  };

  if ((authLoading || profileLoading) && !loadingTimeout) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Layout recruteur
  if (userType === UserType.RECRUTEUR) {
    return <RecruiterLayout />;
  }

  // Layout candidat
  return (
    <>
      {/* Application principale */}
      <div className="h-screen bg-gray-100">
        {!showOnboarding && <Sidebar />}
        <div className={`h-full flex flex-col transition-all duration-300 ${!showOnboarding ? 'lg:ml-16' : ''}`}>
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="/cv-preview" element={<CVPreviewPage />} />
              <Route path="/card-demo" element={<Card3DDemo />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* Onboarding Wizard */}
      <OnboardingWizard 
        isOpen={showOnboarding} 
        onComplete={handleOnboardingComplete} 
      />
    </>
  );
}

function App() {
 
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Route publique pour les CVs partagés - DOIT être avant la route wildcard */}
          <Route path="/cv/:shareId" element={<SharedCVPage />} />
          
          {/* Routes protégées - wildcard en dernier */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <UserTypeRedirect>
                  <ProfileProvider>
                    <CVProvider>
                      <AppContent />
                    </CVProvider>
                  </ProfileProvider>
                </UserTypeRedirect>
              </ProtectedRoute>
            } 
          />
        </Routes>
        
        {/* Toaster pour les notifications */}
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Styles par défaut
            className: '',
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            
            // Styles spécifiques par type
            success: {
              duration: 3000,
              style: {
                background: '#ffffffff',
                color: '#000000ff',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#ffffffff',
                color: '#000000ff',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App
