import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import UserTypeDropdown from '../ui/UserTypeDropdown';
import { UserType } from '../../types/user';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, error, clearError } = useAuth();
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    userType: UserType;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: UserType.CANDIDAT
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [userTypeFromURL, setUserTypeFromURL] = useState<boolean>(false);

  // Initialiser le type d'utilisateur depuis l'URL si présent
  useEffect(() => {
    const userTypeParam = searchParams.get('userType');
    if (userTypeParam === UserType.RECRUTEUR) {
      setFormData(prev => ({ ...prev, userType: UserType.RECRUTEUR }));
      setUserTypeFromURL(true);
    }
  }, [searchParams]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer les erreurs quand l'utilisateur tape
    if (error) clearError();
    if (validationError) setValidationError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      const errorMsg = 'Le prénom est obligatoire';
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    if (!formData.lastName.trim()) {
      const errorMsg = 'Le nom est obligatoire';
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    if (!formData.email.trim()) {
      const errorMsg = 'L\'email est obligatoire';
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    if (formData.password.length < 6) {
      const errorMsg = 'Le mot de passe doit contenir au moins 6 caractères';
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Les mots de passe ne correspondent pas';
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Récupérer le shareId depuis l'URL si présent
      const shareId = searchParams.get('shareId');
      console.log('🔍 [Register] shareId from URL:', shareId);
      console.log('🔍 [Register] UserType:', formData.userType);

      // Préparer les données d'inscription avec shareId si applicable
      const registrationData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: formData.userType,
        ...(formData.userType === UserType.RECRUTEUR && shareId ? { shareId } : {})
      };

      console.log('📝 [Register] Registration data:', registrationData);

      await register(registrationData);
      
      // Redirection selon le type d'utilisateur
      const returnTo = searchParams.get('returnTo');
      if (formData.userType === UserType.RECRUTEUR) {
        navigate(returnTo || '/recruiter/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      // L'erreur est gérée par le contexte AuthContext et affichée via toast
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoData = () => {
    setFormData({
      firstName: 'Alexandre',
      lastName: 'Dupont',
      email: 'alexandre.dupont@exemple.com',
      password: 'demo123',
      confirmPassword: 'demo123',
      userType: UserType.CANDIDAT
    });
  };

  const displayError = validationError || error;

  return (
    <div 
      className="bg-gray-50" 
      style={{ 
        height: '100vh', 
        overflowY: 'scroll', 
        WebkitOverflowScrolling: 'touch' 
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Créer un compte
            </h2>
            <p className="text-gray-600">
              Rejoignez CV APP pour créer vos CVs
            </p>
          </div>

          {/* Card d'inscription */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Affichage des erreurs */}
            {displayError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{displayError}</p>
              </div>
            )}

            {/* Type d'utilisateur */}
            {!userTypeFromURL && (
              <UserTypeDropdown
                value={formData.userType}
                onChange={(userType) => updateField('userType', userType)}
              />
            )}
            
            {userTypeFromURL && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Type de compte
                </label>
                <div className="flex items-center space-x-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <span className="text-lg">🏢</span>
                  <div>
                    <div className="font-medium text-indigo-900">Recruteur</div>
                    <div className="text-sm text-indigo-600">Je recrute et consulte des CVs</div>
                  </div>
                </div>
              </div>
            )}

            {/* Prénom et Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Votre prénom"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Votre nom"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="votre.email@exemple.com"
                required
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Au moins 6 caractères"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Confirmez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Boutons */}
            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-custom w-full px-6 py-3 text-sm font-medium text-white bg-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-700 hover:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Création du compte...' : 'Créer mon compte'}
              </button>

              
            </div>
          </form>

            {/* Lien vers la connexion */}
            <div className="mt-6 text-center border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{' '}
                <Link
                  to="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}