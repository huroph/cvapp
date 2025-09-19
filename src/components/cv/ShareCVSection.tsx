import { motion } from 'framer-motion';
import { EyeIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../contexts/ProfileContext';
import { useCV } from '../../contexts/CVContext';

export default function ShareCVSection() {
  const { profile } = useProfile();
  const { selectedCV } = useCV();
  const navigate = useNavigate();

  const handlePreview = () => {
    navigate('/cv-preview', { 
      state: { from: window.location.pathname } 
    });
  };

  const getErrors = () => {
    const errors = [];
    
    if (!profile?.firstName || !profile?.lastName) {
      errors.push('Nom et prénom requis dans votre profil');
    }
    
    if (!profile?.email) {
      errors.push('Email requis dans votre profil');
    }
    
    if (!selectedCV?.basicInfo?.title) {
      errors.push('Titre du CV requis');
    }

    if (!selectedCV?.experiences?.length && !selectedCV?.formations?.length && !selectedCV?.skills?.length) {
      errors.push('Au moins une section (expérience, formation ou compétences) doit être renseignée');
    }

    return errors;
  };

  const errors = getErrors();

  return (
    <div className="p-2 absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md">
      <div className="flex flex-col items-center justify-center min-h-[120px]">
        {errors.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 w-full"
          >
            <div className="flex items-start space-x-3">
              <div className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0">⚠️</div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-2">
                  Prérequis pour prévisualiser votre CV
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.map((errorMsg, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>{errorMsg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            onClick={handlePreview}
            className="relative btn-custom"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              scale: {
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }
            }}
          >
            <div className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center space-x-3 font-semibold">
              <EyeIcon className="h-6 w-6" />
              <span>Prévisualiser mon CV</span>
            </div>
            
            {/* Effet de pulsation */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-ping opacity-20"></div>
          </motion.button>
        )}
      </div>
    </div>
  );
}