import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getRandomAutoFillData } from '../../utils/autoFillData';
import { useProfile } from '../../contexts/ProfileContext';
import BasicInfoStep from './steps/BasicInfoStep';
import FormationStep from './steps/FormationStep';
import SkillStep from './steps/SkillStep';
import ExperienceStep from './steps/ExperienceStep';

interface CVData {
  basicInfo: {
    title: string;
    firstName: string;
    lastName: string;
    position: string;
    email: string;
    phone: string;
    location: string;
  };
  formations: Array<{
    id: string;
    degree: string;
    school: string;
    location: string;
    startYear: string;
    endYear: string;
    description: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    category: string;
    level: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';
  }>;
  experiences: Array<{
    id: string;
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrentJob: boolean;
    description: string;
    achievements: string[];
  }>;
}

interface CreateCVWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (cvData: CVData) => void;
}

const steps = [
  { id: 1, name: 'Informations de base', description: 'Titre et informations personnelles' },
  { id: 2, name: 'Formations', description: 'Parcours académique' },
  { id: 3, name: 'Compétences', description: 'Compétences techniques et métier' },
  { id: 4, name: 'Expériences', description: 'Expérience professionnelle' },
];

export default function CreateCVWizard({ isOpen, onClose, onSave }: CreateCVWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentFormationIndex, setCurrentFormationIndex] = useState(0);
  const [currentExperienceIndex, setCurrentExperienceIndex] = useState(0);
  const { profile } = useProfile();
  
  const getInitialCVData = (): CVData => {
    return {
      basicInfo: {
        title: '',
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        position: '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        location: profile?.location || '',
      },
      formations: [{
        id: '1',
        degree: '',
        school: '',
        location: '',
        startYear: '',
        endYear: '',
        description: ''
      }],
      skills: [],
      experiences: [{
        id: '1',
        position: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrentJob: false,
        description: '',
        achievements: ['']
      }],
    };
  };

  const [cvData, setCvData] = useState<CVData>(getInitialCVData());

  // Mettre à jour les données du CV quand le profil change ou quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && profile) {
      setCvData(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          location: profile.location || '',
        }
      }));
    }
  }, [isOpen, profile]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    if (onSave) {
      onSave(cvData);
    }
    handleClose();
  };

  const fillAutoData = () => {
    const autoData = getRandomAutoFillData();
    
    // Préserver les données du profil utilisateur
    const preservedProfileData = {
      firstName: profile?.firstName || cvData.basicInfo.firstName,
      lastName: profile?.lastName || cvData.basicInfo.lastName,
      email: profile?.email || cvData.basicInfo.email,
      phone: profile?.phone || cvData.basicInfo.phone,
      location: profile?.location || cvData.basicInfo.location,
    };
    
    setCvData({
      ...autoData,
      basicInfo: {
        ...autoData.basicInfo,
        ...preservedProfileData // Écraser avec les données du profil
      }
    });
    
    setCurrentStep(steps.length); // Aller directement à la dernière étape
  };

  const handleClose = () => {
    setCurrentStep(1);
    setCurrentFormationIndex(0);
    setCurrentExperienceIndex(0);
    setCvData({
      basicInfo: {
        title: '',
        firstName: '',
        lastName: '',
        position: '',
        email: '',
        phone: '',
        location: '',
      },
      formations: [{
        id: '1',
        degree: '',
        school: '',
        location: '',
        startYear: '',
        endYear: '',
        description: ''
      }],
      skills: [],
      experiences: [{
        id: '1',
        position: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrentJob: false,
        description: '',
        achievements: ['']
      }],
    });
    onClose();
  };

  const updateCVData = <K extends keyof CVData>(step: K, data: CVData[K]) => {
    setCvData(prev => ({
      ...prev,
      [step]: data
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return cvData.basicInfo.title && cvData.basicInfo.firstName && cvData.basicInfo.lastName && cvData.basicInfo.position;
      case 2:
        return true; // Formations optionnelles
      case 3:
        return true; // Compétences optionnelles
      case 4:
        return true; // Expériences optionnelles
      default:
        return false;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={cvData.basicInfo}
            onChange={(data: CVData['basicInfo']) => updateCVData('basicInfo', data)}
            readOnlyFields={['firstName', 'lastName', 'email', 'phone', 'location']}
          />
        );
      case 2:
        return (
          <div className="h-full flex flex-col">
            {/* Navigation des formations */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Formation {currentFormationIndex + 1} sur {cvData.formations.length}
              </h3>
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setCurrentFormationIndex(Math.max(0, currentFormationIndex - 1))}
                  disabled={currentFormationIndex === 0}
                  className="btn-custom p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">
                  {currentFormationIndex + 1} / {cvData.formations.length}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentFormationIndex(Math.min(cvData.formations.length - 1, currentFormationIndex + 1))}
                  disabled={currentFormationIndex === cvData.formations.length - 1}
                  className="btn-custom p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newFormation = {
                      id: Date.now().toString(),
                      degree: '',
                      school: '',
                      location: '',
                      startYear: '',
                      endYear: '',
                      description: ''
                    };
                    const newFormations = [...cvData.formations, newFormation];
                    updateCVData('formations', newFormations);
                    setCurrentFormationIndex(newFormations.length - 1);
                  }}
                  className="btn-custom px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100"
                >
                  + Ajouter
                </button>
              </div>
            </div>
            
            {/* Contenu de la formation */}
            <div className="flex-1 overflow-y-auto">
              <FormationStep
                data={[cvData.formations[currentFormationIndex]]}
                onChange={(data: CVData['formations']) => {
                  const newFormations = [...cvData.formations];
                  newFormations[currentFormationIndex] = data[0];
                  updateCVData('formations', newFormations);
                }}
                canDelete={cvData.formations.length > 1}
                onDelete={() => {
                  if (cvData.formations.length > 1) {
                    const newFormations = cvData.formations.filter((_, index) => index !== currentFormationIndex);
                    updateCVData('formations', newFormations);
                    // Ajuster l'index si nécessaire
                    if (currentFormationIndex >= newFormations.length) {
                      setCurrentFormationIndex(newFormations.length - 1);
                    }
                  }
                }}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <SkillStep
            data={cvData.skills}
            onChange={(data: CVData['skills']) => updateCVData('skills', data)}
          />
        );
      case 4:
        return (
          <div className="h-full flex flex-col">
            {/* Navigation des expériences */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Expérience {currentExperienceIndex + 1} sur {cvData.experiences.length}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setCurrentExperienceIndex(Math.max(0, currentExperienceIndex - 1))}
                  disabled={currentExperienceIndex === 0}
                  className="btn-custom p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">
                  {currentExperienceIndex + 1} / {cvData.experiences.length}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentExperienceIndex(Math.min(cvData.experiences.length - 1, currentExperienceIndex + 1))}
                  disabled={currentExperienceIndex === cvData.experiences.length - 1}
                  className="btn-custom p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newExperience = {
                      id: Date.now().toString(),
                      position: '',
                      company: '',
                      location: '',
                      startDate: '',
                      endDate: '',
                      isCurrentJob: false,
                      description: '',
                      achievements: ['']
                    };
                    const newExperiences = [...cvData.experiences, newExperience];
                    updateCVData('experiences', newExperiences);
                    setCurrentExperienceIndex(newExperiences.length - 1);
                  }}
                  className="btn-custom px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100"
                >
                  + Ajouter
                </button>
              </div>
            </div>
            
            {/* Contenu de l'expérience */}
            <div className="flex-1 overflow-y-auto">
              <ExperienceStep
                data={[cvData.experiences[currentExperienceIndex]]}
                onChange={(data: CVData['experiences']) => {
                  const newExperiences = [...cvData.experiences];
                  newExperiences[currentExperienceIndex] = data[0];
                  updateCVData('experiences', newExperiences);
                }}
                canDelete={cvData.experiences.length > 1}
                onDelete={() => {
                  if (cvData.experiences.length > 1) {
                    const newExperiences = cvData.experiences.filter((_, index) => index !== currentExperienceIndex);
                    updateCVData('experiences', newExperiences);
                    // Ajuster l'index si nécessaire
                    if (currentExperienceIndex >= newExperiences.length) {
                      setCurrentExperienceIndex(newExperiences.length - 1);
                    }
                  }
                }}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="flex min-h-full items-center justify-center w-full">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl h-[90vh] transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Créer un nouveau CV
                    </Dialog.Title>
                    <p className="text-sm text-gray-600 mt-1">
                      Étape {currentStep} sur {steps.length}: {steps[currentStep - 1].name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={fillAutoData}
                      className="btn-custom px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    >
                      🎯 Remplir automatiquement
                    </button>
                    <button
                      type="button"
                      className="btn-custom rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onClick={handleClose}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(currentStep / steps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-1 overflow-hidden">
                  {/* Left Sidebar - Stepper */}
                  <div className="w-64 flex-shrink-0 p-6 border-r border-gray-200 bg-gray-50">
                    <div className="space-y-4">
                      {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                            currentStep > index + 1 
                              ? 'bg-indigo-600 text-white' 
                              : currentStep === index + 1 
                                ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-600' 
                                : 'bg-gray-100 text-gray-400'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm font-medium block ${
                              currentStep >= index + 1 ? 'text-indigo-600' : 'text-gray-400'
                            }`}>
                              {step.name}
                            </span>
                            <span className={`text-xs block ${
                              currentStep >= index + 1 ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              {step.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Content - Step Content */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    {renderCurrentStep()}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-between p-6 border-t border-gray-200 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="btn-custom flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeftIcon className="h-4 w-4 mr-2" />
                    Précédent
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="btn-custom px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    >
                      Annuler
                    </button>
                    
                    {currentStep === steps.length ? (
                      <button
                        type="button"
                        onClick={handleFinish}
                        disabled={!isStepValid()}
                        className="btn-custom px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Créer le CV
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className="btn-custom flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Suivant
                        <ChevronRightIcon className="h-4 w-4 ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}