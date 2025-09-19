import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useProfile } from '../../contexts/ProfileContext';
import { useAuth } from '../../contexts/AuthContext';

interface OnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
}

const steps = [
  { id: 1, name: 'Informations personnelles', description: 'Prénom, nom et email' },
  { id: 2, name: 'Contact & Poste', description: 'Téléphone, localisation et poste recherché' },
  { id: 3, name: 'À propos', description: 'Décrivez-vous en quelques mots' },
];

export default function OnboardingWizard({ isOpen, onComplete }: OnboardingProps) {
  const { updateProfile } = useProfile();
  const { userData, currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: currentUser?.email || '',
    phone: userData?.phone || '',
    location: '',
    bio: '',
    position: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  const handleFinish = async () => {
    try {
      await updateProfile({ ...formData, onboardingDone: true });
      onComplete();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
    }
  };

  const fillDemoData = () => {
    const demoData = {
      firstName: 'Alexandre',
      lastName: 'Dupont',
      email: 'alexandre.dupont@exemple.com',
      phone: '+33 6 12 34 56 78',
      location: 'Paris, France',
      bio: 'Développeur passionné avec 5 ans d\'expérience dans le développement web. Expert en React et TypeScript, j\'aime créer des applications modernes et performantes. Toujours en quête d\'innovation et de nouveaux défis techniques.',
      position: 'Développeur Frontend Senior',
    };
    setFormData(demoData);
    setCurrentStep(steps.length);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName.trim() && formData.lastName.trim() && formData.email.trim();
      case 2:
        return formData.phone.trim() && formData.location.trim() && formData.position.trim();
      case 3:
        return formData.bio.trim();
      default:
        return false;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {/* Icône cadenas Heroicons */}
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={formData.firstName}
                  readOnly
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 placeholder-gray-500 cursor-not-allowed"
                  placeholder="Votre prénom"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">🔒 Prénom synchronisé avec votre compte utilisateur</p>
            </div>
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={formData.lastName}
                  readOnly
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 placeholder-gray-500 cursor-not-allowed"
                  placeholder="Votre nom"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">🔒 Nom synchronisé avec votre compte utilisateur</p>
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 placeholder-gray-500 cursor-not-allowed"
                  placeholder="votre.email@exemple.com"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">📧 Email synchronisé avec votre compte utilisateur</p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localisation *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="Paris, France"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poste recherché *
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => updateField('position', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="Développeur Frontend, Designer UX, Chef de projet..."
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                À propos de vous *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
                placeholder="Décrivez-vous en quelques phrases : votre passion, votre expertise, vos objectifs..."
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
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex justify-between items-start mb-2">
                    <Dialog.Title as="h2" className="text-2xl font-bold text-gray-900">
                      Bienvenue dans CV APP
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={fillDemoData}
                      className="btn-custom px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    >
                      🎯 Remplir les données
                    </button>
                  </div>
                  <p className="text-gray-600">
                    Commençons par configurer votre profil pour personnaliser votre expérience
                  </p>
                </div>

                {/* Stepper */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    {steps.map((step, stepIdx) => (
                      <div key={step.id} className="flex items-center">
                        <div className="flex items-center">
                          <div className={`
                            flex h-10 w-10 items-center justify-center rounded-full border-2 
                            ${step.id < currentStep 
                              ? 'bg-indigo-600 border-indigo-600 text-white' 
                              : step.id === currentStep 
                                ? 'border-indigo-600 text-indigo-600 bg-white' 
                                : 'border-gray-300 text-gray-500 bg-white'
                            }
                          `}>
                            {step.id < currentStep ? (
                              <CheckIcon className="h-5 w-5" />
                            ) : (
                              <span className="text-sm font-medium">{step.id}</span>
                            )}
                          </div>
                          <div className="ml-3 hidden sm:block">
                            <p className={`text-sm font-medium ${
                              step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {step.name}
                            </p>
                            <p className="text-xs text-gray-500">{step.description}</p>
                          </div>
                        </div>
                        {stepIdx < steps.length - 1 && (
                          <ChevronRightIcon className="h-5 w-5 text-gray-400 mx-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Content */}
                <div className="mb-8">
                  {renderCurrentStep()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="btn-custom px-6 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Précédent
                  </button>
                  
                  <div className="flex space-x-3">
                    {currentStep === steps.length ? (
                      <button
                        type="button"
                        onClick={handleFinish}
                        disabled={!isStepValid()}
                        className="btn-custom px-6 py-3 text-sm font-medium text-white bg-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-700 hover:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Terminer
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className="btn-custom px-6 py-3 text-sm font-medium text-white bg-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-700 hover:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Suivant
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