import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from '@headlessui/react';
import {
  UsersIcon,
  DocumentTextIcon,
  CameraIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import CreateCVWizard from '../modals/CreateCVWizard';
import CVCaptureModal from '../modals/CVCaptureModal';
import DropdownMenu from '../ui/DropdownMenu';
import { useCV } from '../../contexts/CVContext';
import { useProfile } from '../../contexts/ProfileContext';
import { useAuth } from '../../contexts/AuthContext';
import { resetDatabaseForUser } from '../../utils/seedData';

const navigation = [
  { name: 'Mes CVs', href: '#', icon: DocumentTextIcon, isDropdown: true },
  { name: 'Profil', href: '/profil', icon: UsersIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const SidebarContent = ({ onItemClick, isHovered: isHoveredProp = true }: { onItemClick?: () => void; isHovered?: boolean }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cvs, selectedCV, selectCV, createCV, refreshCVs, deleteAllCVs, updateCV, deleteCV } = useCV();
  const { resetProfile } = useProfile();
  const { currentUser } = useAuth();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCVSectionOpen, setIsCVSectionOpen] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [editingCVId, setEditingCVId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [hoveredCVId, setHoveredCVId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Logique pour les CVs
  useEffect(() => {
    if (location.pathname === '/profil') {
      setIsCVSectionOpen(false);
    }
  }, [location.pathname]);

  // Convertir les CVs pour le dropdown
  const cvSummaries = cvs.map(cv => ({
    id: cv.id!,
    title: cv.basicInfo.title
  }));

  const selectedCVSummary = selectedCV ? {
    id: selectedCV.id!,
    title: selectedCV.basicInfo.title
  } : undefined;

  const handleSelectCV = (cv: { id: string; title: string }) => {
    selectCV(cv.id);
    
    // Si on n'est pas sur la homepage, rediriger vers la homepage
    if (location.pathname !== '/') {
      navigate('/');
    }
    
    // Fermer le menu mobile si ouvert
    if (onItemClick) {
      onItemClick();
    }
  };

  const handleAddCV = () => {
    setIsWizardOpen(true);
  };

  const handleScanCV = () => {
    setIsCaptureModalOpen(true);
  };

  const startEditing = (cvId: string, currentTitle: string) => {
    setEditingCVId(cvId);
    setEditTitle(currentTitle);
  };

  const cancelEditing = () => {
    setEditingCVId(null);
    setEditTitle('');
  };

  const confirmSave = async () => {
    if (!editingCVId || !editTitle.trim()) {
      toast.error('Le titre du CV ne peut pas être vide');
      return;
    }

    // Vérifier si le titre n'a pas changé
    const currentCV = cvs.find(cv => cv.id === editingCVId);
    if (!currentCV) {
      toast.error('CV non trouvé');
      return;
    }

    if (currentCV.basicInfo.title === editTitle.trim()) {
      // Aucun changement, on ferme juste l'édition
      setEditingCVId(null);
      setEditTitle('');
      return;
    }

    // Vérifier si un autre CV a déjà ce titre
    const duplicateCV = cvs.find(cv => cv.id !== editingCVId && cv.basicInfo.title === editTitle.trim());
    if (duplicateCV) {
      toast.error('Un CV avec ce titre existe déjà');
      return;
    }

    try {
      // Mettre à jour uniquement le titre dans basicInfo
      await updateCV(editingCVId, { 
        basicInfo: {
          ...currentCV.basicInfo,
          title: editTitle.trim()
        }
      });
      
      setEditingCVId(null);
      setEditTitle('');
      toast.success('Titre du CV modifié avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du CV:', error);
      toast.error('Erreur lors de la modification du titre');
    }
  };

  const deleteCV_inline = async (cvId: string, cvTitle: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le CV "${cvTitle}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await deleteCV(cvId);
      toast.success(`CV "${cvTitle}" supprimé avec succès`);
    } catch (error) {
      console.error('Erreur lors de la suppression du CV:', error);
      toast.error('Erreur lors de la suppression du CV');
    }
  };

  const handleCaptureData = async (cvData: any) => {
    try {
      // Créer le CV avec les données extraites
      await createCV(cvData);
      setIsCaptureModalOpen(false);
      toast.success('CV créé avec succès à partir du scan');
    } catch (error) {
      console.error('Erreur lors de la création du CV scanné:', error);
      toast.error('Erreur lors de la création du CV scanné');
    }
  };

  const handleWizardClose = () => {
    setIsWizardOpen(false);
  };

  const handleSaveCV = async (cvData: any) => {
    try {
      await createCV(cvData);
      setIsWizardOpen(false);
      toast.success('CV créé avec succès');
    } catch (error) {
      console.error('Erreur lors de la création du CV:', error);
      toast.error('Erreur lors de la création du CV');
    }
  };

 
  return (
    <div 
      className={`flex h-full flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 transition-all duration-300 ${
        isHovered ? 'w-72' : 'w-18'
      } lg:${isHovered ? 'w-72' : 'w-18'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-16 shrink-0 items-center">
        <img alt="Logo" src="/vite.svg" className="h-8 w-auto" />
        {/* Sur mobile toujours afficher le texte, sur desktop selon hover */}
        <span className="ml-2 text-xl font-semibold text-gray-900 whitespace-nowrap lg:hidden">CV APP</span>
        {isHoveredProp && (
          <span className="ml-2 text-xl font-semibold text-gray-900 whitespace-nowrap hidden lg:block">CV APP</span>
        )}
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                if (item.isDropdown) {
                  // Si aucun CV, afficher un simple bouton qui navigue vers la home
                  if (cvSummaries.length === 0) {
                    const isActive = location.pathname === '/';
                    return (
                      <li key={item.name}>
                        <Link
                          to="/"
                          className={classNames(
                            isActive
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                            'group flex gap-x-3 rounded-md p-2 text-sm font-semibold transition-colors',
                          )}
                          onClick={onItemClick}
                          title={!isHoveredProp ? item.name : undefined}
                        >
                          <item.icon
                            aria-hidden="true"
                            className={classNames(
                              isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                              'size-6 shrink-0',
                            )}
                          />
                          {/* Mobile: toujours afficher, Desktop: selon hover */}
                          <div className={classNames(
                            isActive ? 'text-indigo-600' : 'text-gray-700 group-hover:text-indigo-600',
                            'truncate whitespace-nowrap lg:hidden'
                          )}>
                            {item.name}
                          </div>
                          {isHoveredProp && (
                            <div className={classNames(
                              isActive ? 'text-indigo-600' : 'text-gray-700 group-hover:text-indigo-600',
                              'truncate whitespace-nowrap hidden lg:block'
                            )}>
                              {item.name}
                            </div>
                          )}
                        </Link>
                      </li>
                    );
                  }
                  
                  // Sinon, menu déroulant classique
                  return (
                    <li key={item.name}>
                      <div
                        onClick={() => setIsCVSectionOpen(!isCVSectionOpen)}
                        className={classNames(
                          isCVSectionOpen
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                          'w-full group flex gap-x-3 p-2 rounded-md  text-sm font-semibold transition-colors cursor-pointer',
                        )}
                        title={!isHoveredProp ? item.name : undefined}
                      >
                        <item.icon
                          aria-hidden="true"
                          className={classNames(
                            isCVSectionOpen ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                            'size-6 shrink-0',
                          )}
                        />
                        {/* Mobile: toujours afficher, Desktop: selon hover */}
                        <div className="lg:hidden">
                          <div className={classNames(
                            isCVSectionOpen ? 'text-indigo-600' : 'text-gray-700 group-hover:text-indigo-600',
                            'flex-1 text-left truncate whitespace-nowrap'
                          )}>
                            {item.name}
                          </div>
                          {isCVSectionOpen ? (
                            <ChevronDownIcon className={classNames(
                              isCVSectionOpen ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                              'size-4 shrink-0'
                            )} />
                          ) : (
                            <ChevronRightIcon className={classNames(
                              isCVSectionOpen ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                              'size-4 shrink-0'
                            )} />
                          )}
                        </div>
                        {isHoveredProp && (
                          <div className="hidden lg:flex flex-1">
                            <div className={classNames(
                              isCVSectionOpen ? 'text-indigo-600' : 'text-gray-700 group-hover:text-indigo-600',
                              'flex-1 text-left truncate whitespace-nowrap'
                            )}>
                              {item.name}
                            </div>
                            {isCVSectionOpen ? (
                              <ChevronDownIcon className={classNames(
                                isCVSectionOpen ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                                'size-4 shrink-0'
                              )} />
                            ) : (
                              <ChevronRightIcon className={classNames(
                                isCVSectionOpen ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                                'size-4 shrink-0'
                              )} />
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Sous-menu des CVs */}
                      {isCVSectionOpen && isHoveredProp && (
                        <div className="mt-2 space-y-1 border-l-2 border-gray-200 pl-3">
                          {cvSummaries.map((cv) => (
                            <div key={cv.id} className="relative dropdown-container">
                              <motion.div
                                className={`w-full px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                                  selectedCVSummary?.id === cv.id
                                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                                onMouseEnter={() => setHoveredCVId(cv.id)}
                                onMouseLeave={() => setHoveredCVId(null)}
                              >
                                {/* Titre du CV - clickable ou éditable */}
                                <motion.div 
                                  className="flex items-center min-w-0 overflow-hidden "
                                  initial={{ width: "100%" }}
                                  animate={{ 
                                    width: hoveredCVId === cv.id && editingCVId !== cv.id ? "calc(100% - 40px)" : "100%" 
                                  }}
                                  transition={{ 
                                    duration: 0.3, 
                                    ease: "easeInOut" 
                                  }}
                                >
                                  {editingCVId === cv.id ? (
                                    /* Mode édition inline */
                                    <>
                                      <div className="w-full">
                                      <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="flex-1 bg-white py-2 px-3 rounded-md border-none outline-none text-sm font-medium min-w-0 mr-1"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            confirmSave();
                                          } else if (e.key === 'Escape') {
                                            cancelEditing();
                                          }
                                        }}
                                      />
                                      {/* Icônes de validation et annulation */}
                                      <div className="flex items-center py-1">
                                      <button
                                        onClick={() => confirmSave()}
                                        className=" hover:bg-green-100 py-2 px-3 bg-white rounded btn-custom transition-colors flex-shrink-0"
                                        title="Valider"
                                      >
                                        <CheckIcon className="h-3 w-3 text-green-600" />
                                      </button>
                                      <button
                                        onClick={cancelEditing}
                                        className=" hover:bg-red-100  py-2 px-3  bg-white rounded btn-custom transition-colors flex-shrink-0 ml-1"
                                        title="Annuler"
                                      >
                                        <XMarkIcon className="h-3 w-3 text-red-600" />
                                      </button>
                                      </div>
                                       </div>
                                    </>
                                  ) : (
                                    /* Mode normal */
                                    <button
                                      onClick={() => handleSelectCV(cv)}
                                      className="flex-1 text-left flex items-center min-w-0 w-full"
                                    >
                                      <span className="truncate">{cv.title}</span>
                                    </button>
                                  )}
                                </motion.div>

                                {/* Bouton actions "..." avec animation */}
                                
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ 
                                      opacity: hoveredCVId === cv.id ? !editingCVId ? 1 : 0 : 0,
                                      scale: hoveredCVId === cv.id ? !editingCVId ? 1 : 0 : 0,
                                      width: hoveredCVId  === cv.id ? !editingCVId ? 'auto' : 0 : 0
                                    }}
                                    transition={{ 
                                      duration: 0.2, 
                                      ease: "easeInOut" 
                                    }}
                                    className="flex-shrink-0 "
                                    style={{
                                      pointerEvents: hoveredCVId === cv.id ? 'auto' : 'none'
                                    }}
                                  >
                                    <DropdownMenu
                                      options={[
                                        {
                                          label: "Modifier le titre",
                                          icon: <PencilIcon className="h-4 w-4 text-blue-600" />,
                                          onClick: () => startEditing(cv.id, cv.title),
                                          className: "text-gray-700"
                                        },
                                        {
                                          label: "Supprimer",
                                          icon: <TrashIcon className="h-4 w-4 text-red-600" />,
                                          onClick: () => deleteCV_inline(cv.id, cv.title),
                                          className: "text-red-700 hover:bg-red-50"
                                        }
                                      ]}
                                      triggerClassName="ml-2 p-1 rounded bg-white  "
                                      title="Actions sur ce CV"
                                      hoverBorder="blue-300"
                                    />
                                  </motion.div>
                              
                              </motion.div>
                            </div>
                          ))}
                          
                          {/* Séparateur */}
                          {cvSummaries.length > 0 && (
                            <div className="border-t border-gray-200 my-2" />
                          )}
                          
                          {/* Boutons Ajouter/Scanner un CV - uniquement si des CVs existent */}
                          {cvSummaries.length > 0 && (
                            <>
                              <button
                                onClick={handleAddCV}
                                className="w-full text-left px-3 py-2 rounded-md text-sm text-indigo-600 hover:bg-indigo-50 flex items-center font-medium transition-colors"
                              >
                                <PlusIcon className="h-4 w-4 mr-2" />

                                <span className='truncate whitespace-nowrap'>Ajouter un CV</span>
                              </button>
                              
                              <button
                                onClick={handleScanCV}
                                className="w-full text-left px-3 py-2 rounded-md text-sm text-green-600 hover:bg-green-50 flex items-center font-medium transition-colors"
                              >
                                <CameraIcon className="h-4 w-4 mr-2" />
                                <span className='truncate whitespace-nowrap'>Scanner un CV</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </li>
                  );
                } else {
                  // Menu normal comme "Profil"
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={classNames(
                          isActive
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                          'group flex gap-x-3 rounded-md p-2 text-sm font-semibold transition-colors',
                        )}
                        onClick={onItemClick}
                        title={!isHoveredProp ? item.name : undefined}
                      >
                        <item.icon
                          aria-hidden="true"
                          className={classNames(
                            isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                            'size-6 shrink-0',
                          )}
                        />
                        {/* Mobile: toujours afficher, Desktop: selon hover */}
                        <div className={classNames(
                          isActive ? 'text-indigo-600' : 'text-gray-700 group-hover:text-indigo-600',
                          'truncate whitespace-nowrap lg:hidden'
                        )}>
                          {item.name}
                        </div>
                        {isHoveredProp && (
                          <div className={classNames(
                            isActive ? 'text-indigo-600' : 'text-gray-700 group-hover:text-indigo-600',
                            'truncate whitespace-nowrap hidden lg:block'
                          )}>
                            {item.name}
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                }
              })}
            </ul>
          </li>
        </ul>
        
        {/* Boutons d'administration en bas */}
        <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
          {isHoveredProp ? (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 text-sm">🏢</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-900 truncate whitespace-nowrap">Espace Candidat</p>
                    <p className="text-xs text-indigo-600 truncate whitespace-nowrap">Gestion des CVs</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center" title="Espace Candidat">
                <span className="text-indigo-600 text-sm">🏢</span>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      {/* Wizard de création de CV */}
      <CreateCVWizard
        isOpen={isWizardOpen}
        onClose={handleWizardClose}
        onSave={handleSaveCV}
      />
      
      {/* Modal de capture CV */}
      <CVCaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onDataExtracted={handleCaptureData}
      />
    </div>
  );
};

export default function SidebarNew() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Bouton menu mobile */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-indigo-600 text-white p-2 rounded-md shadow-lg"
      >
        <span className="sr-only">Ouvrir le menu</span>
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Dialog mobile */}
      <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />
        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                <button
                  type="button"
                  className="-m-2.5 p-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Fermer le menu</span>
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </TransitionChild>
            <SidebarContent onItemClick={() => setSidebarOpen(false)} isHovered={true} />
          </DialogPanel>
        </div>
      </Dialog>

      {/* Sidebar desktop fixe */}
      <div 
        className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ${
          isHovered ? 'lg:w-72' : 'lg:w-16'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="border-r border-gray-200 h-full">
          <SidebarContent isHovered={isHovered} />
        </div>
      </div>
    </>
  );
}
