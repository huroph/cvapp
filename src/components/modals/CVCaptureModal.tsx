import React, { useState, useRef } from 'react';
import { CameraIcon, XMarkIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Button } from '../forms';
import type { CVData } from '../../types';
import Tesseract from 'tesseract.js';

interface CVCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataExtracted: (cvData: Partial<CVData>) => void;
}

interface ExtractedData {
  rawText?: string;
  basicInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    location?: string;
    position?: string;
  };
  experiences?: Array<{
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  formations?: Array<{
    degree: string;
    school: string;
    location: string;
    startYear: string;
    endYear: string;
    description: string;
  }>;
  skills?: Array<{
    name: string;
    category: string;
    level: string;
  }>;
}

const CVCaptureModal: React.FC<CVCaptureModalProps> = ({ isOpen, onClose, onDataExtracted }) => {
  const [step, setStep] = useState<'capture' | 'processing' | 'review'>('capture');
  const [reviewStep, setReviewStep] = useState<'personal' | 'experience' | 'skills' | 'summary'>('personal');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [_ocrProgress, setOcrProgress] = useState<number>(0);
  const [_currentStatus, setCurrentStatus] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Démarrer la caméra
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Caméra arrière sur mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      const errorMsg = 'Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès ou utiliser l\'upload de fichier.';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Erreur caméra:', err);
    }
  };

  // Arrêter la caméra
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Prendre une photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
        processImage(imageData);
      }
    }
  };

  // Upload de fichier
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        processImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  // Traiter l'image avec OCR/AI
  const processImage = async (imageData: string) => {
    setStep('processing');
    setError(null);
    setOcrProgress(0);
    setCurrentStatus('Préparation de l\'image...');

    try {
      // Étape 1: OCR avec Tesseract.js
      setCurrentStatus('Extraction du texte avec OCR...');
      const ocrResult = await performOCR(imageData);
      
      // Étape 2: Analyse intelligente du texte
      setCurrentStatus('Analyse et structuration des données...');
      const extractedInfo = await analyzeTextWithAI(ocrResult);
      
      setExtractedData(extractedInfo);
      setCurrentStatus('Analyse terminée !');
      toast.success('CV analysé avec succès ! Vous pouvez maintenant réviser les données extraites.');
      setStep('review');
    } catch (err) {
      const errorMsg = 'Erreur lors du traitement de l\'image. Veuillez réessayer avec une image plus claire.';
      setError(errorMsg);
      toast.error(errorMsg);
      setStep('capture');
      console.error('Erreur OCR:', err);
    }
  };

  // OCR avec Tesseract.js
  const performOCR = async (imageData: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      (async () => {
        const worker = await Tesseract.createWorker('fra+eng', 1, {
          logger: m => {
            if (m.status === 'recognizing text') {
              const progress = Math.round(m.progress * 100);
              setOcrProgress(progress);
              setCurrentStatus(`Reconnaissance OCR: ${progress}%`);
            }
          }
        });

        try {
          // Configuration pour améliorer la reconnaissance de CV
          await worker.setParameters({
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@.-+()/ àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ',
          });

          const { data: { text } } = await worker.recognize(imageData);
          await worker.terminate();
          
          if (!text || text.trim().length < 50) {
            throw new Error('Texte insuffisant détecté. Assurez-vous que l\'image est claire et contient du texte.');
          }
          
          resolve(text);
        } catch (error) {
          await worker.terminate();
          reject(error);
        }
      })();
    });
  };

  // Analyse intelligente du texte extrait
  const analyzeTextWithAI = async (text: string): Promise<ExtractedData> => {
    setCurrentStatus('Analyse sémantique du contenu...');
    
    // Patterns regex améliorés pour extraire les informations
    const patterns = {
      // Emails - plus robuste
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      
      // Téléphones français et internationaux
      phone: /(?:\+33|0)[1-9](?:[0-9]{8})|(?:\+33\s?[1-9](?:\s?[0-9]{2}){4})|(?:0[1-9](?:\s?[0-9]{2}){4})/g,
      
      // Noms et prénoms (début de ligne ou après certains mots)
      names: /(?:^|\n|Nom\s*:?\s*|Prénom\s*:?\s*|Name\s*:?\s*)([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþß]+(?:\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþß]+)*)/g,
      
      // Adresses et villes
      address: /(?:Adresse\s*:?\s*|Address\s*:?\s*|Résidence\s*:?\s*)([^\\n]+)/gi,
      city: /\b(?:Paris|Lyon|Marseille|Toulouse|Nice|Nantes|Strasbourg|Montpellier|Bordeaux|Lille|Rennes|Reims|Le Havre|Saint-Étienne|Toulon|Grenoble|Dijon|Nîmes|Angers|Villeurbanne|France)\b/gi,
      
      // Dates (différents formats)
      dates: /\b(?:(?:0[1-9]|[12][0-9]|3[01])[-/.](?:0[1-9]|1[0-2])[-/.](?:19|20)[0-9]{2})|(?:(?:0[1-9]|1[0-2])[-/.](?:19|20)[0-9]{2})|(?:(?:19|20)[0-9]{2})\b/g,
      
      // Compétences techniques courantes
      skills: /\b(?:JavaScript|TypeScript|React|Vue|Angular|Node\.?js|Python|Java|C\+\+|C#|PHP|Ruby|Go|Rust|HTML|CSS|SQL|MongoDB|PostgreSQL|MySQL|Git|Docker|Kubernetes|AWS|Azure|GCP|Figma|Photoshop|Illustrator|Sketch|Unity|Blender|AutoCAD|Excel|Word|PowerPoint|Jira|Slack|Teams|Notion|Trello)\b/gi,
      
      // Niveaux de langues et compétences
      levels: /\b(?:Débutant|Intermédiaire|Avancé|Expert|Bilingue|Natif|Courant|Scolaire|Professionnel|Maternelle)\b/gi,
      
      // Entreprises et écoles (mots clés)
      companies: /\b(?:SARL|SAS|SA|EURL|Société|Company|Corporation|Corp|Inc|Ltd|Université|École|Institute|School|College|Formation)\b/gi,
      
      // Postes et métiers
      positions: /\b(?:Développeur|Developer|Ingénieur|Engineer|Designer|Manager|Directeur|Chef|Lead|Senior|Junior|Stagiaire|Consultant|Analyste|Architecte|Product Owner|Scrum Master|Technicien|Administrateur|Responsable|Assistant|Coordinateur|Spécialiste)\b/gi
    };

    // Extraction avec les patterns
    const emails = text.match(patterns.email) || [];
    const phones = text.match(patterns.phone) || [];
    const nameMatches = text.match(patterns.names) || [];
    const cities = text.match(patterns.city) || [];
    const skillMatches = text.match(patterns.skills) || [];
    const positionMatches = text.match(patterns.positions) || [];
    
    // Analyse des sections du CV
    const sections = analyzeTextSections(text);
    
    // Construction de l'objet de données structuré
    const result: ExtractedData = {
      rawText: text,
      basicInfo: {
        firstName: extractFirstName(nameMatches, text),
        lastName: extractLastName(nameMatches, text),
        email: emails[0] || '',
        phone: phones.length > 0 ? cleanPhoneNumber(phones[0] || '') : '',
        location: cities[0] || '',
        position: positionMatches[0] || extractPositionFromContext(text)
      },
      experiences: extractExperiences(text, sections.experience),
      formations: extractEducation(text, sections.education),
      skills: extractSkills(skillMatches, text)
    };

    return result;
  };

  // Fonctions d'extraction spécialisées
  const analyzeTextSections = (text: string) => {
    const sections = {
      experience: '',
      education: '',
      skills: '',
      personal: ''
    };

    // Découpage par sections courantes
    const experienceKeywords = /(?:expérience|experience|professionnel|career|work|emploi|poste)/gi;
    const educationKeywords = /(?:formation|education|école|université|diplôme|degree|studies)/gi;
    const skillsKeywords = /(?:compétences|skills|technologies|outils|langages|languages)/gi;

    const lines = text.split('\\n');
    let currentSection = 'personal';
    
    lines.forEach(line => {
      if (experienceKeywords.test(line)) currentSection = 'experience';
      else if (educationKeywords.test(line)) currentSection = 'education';
      else if (skillsKeywords.test(line)) currentSection = 'skills';
      
      sections[currentSection as keyof typeof sections] += line + ' ';
    });

    return sections;
  };

  const extractFirstName = (nameMatches: string[], text: string): string => {
    // Logique pour identifier le prénom (souvent en premier)
    if (nameMatches.length >= 1) {
      const fullName = nameMatches[0].trim();
      return fullName.split(' ')[0] || '';
    }
    
    // Recherche alternative dans le contexte
    const firstNamePattern = /(?:Prénom\s*:?\s*|First\s*Name\s*:?\s*)([A-Za-zÀ-ÿ]+)/i;
    const match = text.match(firstNamePattern);
    return match ? match[1] : '';
  };

  const extractLastName = (nameMatches: string[], text: string): string => {
    if (nameMatches.length >= 1) {
      const fullName = nameMatches[0].trim();
      const parts = fullName.split(' ');
      return parts.length > 1 ? parts[parts.length - 1] : '';
    }
    
    const lastNamePattern = /(?:Nom\s*:?\s*|Last\s*Name\s*:?\s*)([A-Za-zÀ-ÿ]+)/i;
    const match = text.match(lastNamePattern);
    return match ? match[1] : '';
  };

  const cleanPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    return phone.replace(/\\s+/g, ' ').trim();
  };

  const extractPositionFromContext = (text: string): string => {
    const positionPatterns = [
      /(?:Poste\s*:?\s*|Position\s*:?\s*|Titre\s*:?\s*)([^\\n]+)/i,
      /(?:Développeur|Developer|Ingénieur|Engineer|Designer|Manager)[\s\w]*/gi
    ];
    
    for (const pattern of positionPatterns) {
      const match = text.match(pattern);
      if (match) return match[1] || match[0];
    }
    return '';
  };

  const extractExperiences = (text: string, experienceSection: string): Array<any> => {
    const experiences: Array<any> = [];
    
    // Pattern pour détecter les expériences avec dates et entreprises
    const expPattern = /(?:(?:19|20)[0-9]{2}).*?(?:(?:19|20)[0-9]{2}|présent|actuel|current).*?(?:chez|at|@)\s*([^\\n]+)/gi;
    let match;
    
    while ((match = expPattern.exec(experienceSection || text)) !== null) {
      experiences.push({
        position: 'Poste à définir',
        company: match[1]?.trim() || 'Entreprise inconnue',
        location: '',
        startDate: '2020-01',
        endDate: '2023-12',
        description: 'Description à compléter'
      });
    }
    
    // Si aucune expérience détectée, en créer une par défaut
    if (experiences.length === 0) {
      experiences.push({
        position: 'Poste à définir',
        company: 'Entreprise à définir',
        location: '',
        startDate: '2020-01',
        endDate: '2023-12',
        description: 'Veuillez compléter les informations d\'expérience'
      });
    }
    
    return experiences;
  };

  const extractEducation = (text: string, educationSection: string): Array<any> => {
    const formations: Array<any> = [];
    
    // Pattern pour détecter les formations
    const eduPattern = /(?:(?:19|20)[0-9]{2}).*?(?:diplôme|degree|master|licence|bac|école|université)/gi;
    
    if (eduPattern.test(educationSection || text)) {
      formations.push({
        degree: 'Diplôme à définir',
        school: 'École à définir',
        location: '',
        startYear: '2018',
        endYear: '2020',
        description: 'Formation à compléter'
      });
    }
    
    return formations;
  };

  const extractSkills = (skillMatches: string[], text: string): Array<any> => {
    const skills: Array<any> = [];
    const uniqueSkills = [...new Set(skillMatches.map(s => s.toLowerCase()))];
    
    uniqueSkills.forEach(skill => {
      const category = categorizeSkill(skill);
      const level = extractSkillLevel(skill, text);
      
      skills.push({
        name: skill.charAt(0).toUpperCase() + skill.slice(1),
        category,
        level
      });
    });
    
    return skills;
  };

  const categorizeSkill = (skill: string): string => {
    const frontendSkills = ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css'];
    const backendSkills = ['node.js', 'python', 'java', 'php', 'ruby', 'go'];
    const designSkills = ['figma', 'photoshop', 'illustrator', 'sketch'];
    const toolsSkills = ['git', 'docker', 'jira', 'slack'];
    
    if (frontendSkills.includes(skill.toLowerCase())) return 'Frontend';
    if (backendSkills.includes(skill.toLowerCase())) return 'Backend';
    if (designSkills.includes(skill.toLowerCase())) return 'Design';
    if (toolsSkills.includes(skill.toLowerCase())) return 'Outils';
    
    return 'Général';
  };

  const extractSkillLevel = (skill: string, text: string): string => {
    const skillContext = text.toLowerCase();
    const skillLower = skill.toLowerCase();
    
    if (skillContext.includes(skillLower + ' expert') || skillContext.includes('expert ' + skillLower)) return 'Expert';
    if (skillContext.includes(skillLower + ' avancé') || skillContext.includes('avancé ' + skillLower)) return 'Avancé';
    if (skillContext.includes(skillLower + ' intermédiaire')) return 'Intermédiaire';
    if (skillContext.includes(skillLower + ' débutant')) return 'Débutant';
    
    return 'Intermédiaire'; // Par défaut
  };

  // Confirmer les données extraites
  const confirmData = () => {
    if (extractedData) {
      // Transformer les données au format CVData
      const cvData: Partial<CVData> = {
        basicInfo: {
          title: `CV ${extractedData.basicInfo?.firstName} ${extractedData.basicInfo?.lastName}`,
          firstName: extractedData.basicInfo?.firstName || '',
          lastName: extractedData.basicInfo?.lastName || '',
          position: extractedData.basicInfo?.position || '',
          email: extractedData.basicInfo?.email || '',
          phone: extractedData.basicInfo?.phone || '',
          location: extractedData.basicInfo?.location || ''
        },
        experiences: extractedData.experiences?.map((exp, index) => ({
          id: `exp_${index}`,
          ...exp,
          isCurrentJob: false,
          achievements: []
        })) || [],
        formations: extractedData.formations?.map((form, index) => ({
          id: `form_${index}`,
          ...form
        })) || [],
        skills: extractedData.skills?.map((skill, index) => ({
          id: `skill_${index}`,
          ...skill,
          level: skill.level as 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert'
        })) || []
      };
      
      onDataExtracted(cvData);
      handleClose();
    }
  };

  // Fermer le modal
  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setExtractedData(null);
    setStep('capture');
    setError(null);
    onClose();
  };

  // Redémarrer le processus
  const restart = () => {
    setCapturedImage(null);
    setExtractedData(null);
    setStep('capture');
    setError(null);
  };

  React.useEffect(() => {
    if (isOpen && step === 'capture') {
      startCamera();
    }
    return () => stopCamera();
  }, [isOpen, step]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>

        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 pt-4 pb-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              📷 Scanner un CV
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Contenu avec hauteur fixe */}
          <div className="flex-1 overflow-hidden px-6 py-4">{step === 'capture' && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Prenez une photo de votre CV ou uploadez un fichier
                  </p>
                </div>

                {/* Caméra */}
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-md mx-auto rounded-lg border"
                    style={{ display: stream ? 'block' : 'none' }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {error && (
                    <div className="text-center py-8">
                      <p className="text-red-600 mb-4">{error}</p>
                    </div>
                  )}
                </div>

                {/* Boutons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {stream && (
                    <Button
                      variant="primary"
                      onClick={capturePhoto}
                      className="flex items-center gap-2"
                    >
                      <CameraIcon className="h-5 w-5" />
                      Prendre la photo
                    </Button>
                  )}
                  
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    📁 Choisir un fichier
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {step === 'processing' && (
              <div className="text-center py-12">
                <ArrowPathIcon className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Analyse du CV en cours...
                </h3>
                <p className="text-gray-600">
                  Extraction des informations avec l'IA
                </p>
              </div>
            )}

            {step === 'review' && extractedData && (
              <div className="h-full flex flex-col">
                {/* Header fixe - Titre + Stepper */}
                <div className="flex-shrink-0 border-b border-gray-200 pb-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      ✅ Données extraites
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Vérifiez et validez les informations par étapes
                    </p>
                  </div>
                  
                  {/* Wizard Stepper */}
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      {[
                        { key: 'personal', label: 'Personnel', icon: '👤' },
                        { key: 'experience', label: 'Expérience', icon: '💼' },
                        { key: 'skills', label: 'Compétences', icon: '🔧' },
                        { key: 'summary', label: 'Résumé', icon: '📋' }
                      ].map((stepItem, index) => (
                        <React.Fragment key={stepItem.key}>
                          <div 
                            className={`flex flex-col items-center cursor-pointer transition-colors ${
                              reviewStep === stepItem.key 
                                ? 'text-indigo-600' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                            onClick={() => setReviewStep(stepItem.key as any)}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors ${
                              reviewStep === stepItem.key
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-400 border-gray-300'
                            }`}>
                              {stepItem.icon}
                            </div>
                            <span className="text-xs mt-1 font-medium">{stepItem.label}</span>
                          </div>
                          {index < 3 && (
                            <div className={`h-0.5 w-8 transition-colors ${
                              ['personal', 'experience', 'skills'].indexOf(reviewStep) > index
                                ? 'bg-indigo-600'
                                : 'bg-gray-300'
                            }`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contenu principal avec hauteur fixe */}
                <div className="flex-1 overflow-y-auto py-4">
                  {/* Étape 1: Informations personnelles */}
                  {reviewStep === 'personal' && (
                    <div className="h-full flex items-center justify-center">
                      <div className="flex flex-col lg:flex-row items-center gap-6 max-w-4xl w-full">
                        {capturedImage && (
                          <div className="flex-shrink-0">
                            <img
                              src={capturedImage}
                              alt="CV capturé"
                              className="w-64 h-auto rounded-lg border shadow-sm"
                            />
                          </div>
                        )}

                        {extractedData.basicInfo && (
                          <div className="bg-gray-50 p-4 rounded-lg text-left flex-1 max-w-md">
                            <h4 className="font-medium text-gray-900 mb-3 text-center">
                              👤 Informations personnelles
                            </h4>
                            <div className="space-y-2 text-sm text-gray-700">
                              <div className="flex justify-between">
                                <strong className="text-gray-900">Nom complet:</strong>
                                <span>{extractedData.basicInfo.firstName} {extractedData.basicInfo.lastName}</span>
                              </div>
                              <div className="flex justify-between">
                                <strong className="text-gray-900">Email:</strong>
                                <span className="text-indigo-600 text-xs">{extractedData.basicInfo.email}</span>
                              </div>
                              <div className="flex justify-between">
                                <strong className="text-gray-900">Téléphone:</strong>
                                <span>{extractedData.basicInfo.phone}</span>
                              </div>
                              <div className="flex justify-between">
                                <strong className="text-gray-900">Localisation:</strong>
                                <span>{extractedData.basicInfo.location}</span>
                              </div>
                              <div className="flex justify-between">
                                <strong className="text-gray-900">Poste:</strong>
                                <span className="font-medium text-gray-900">{extractedData.basicInfo.position}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Étape 2: Expériences et Formations */}
                  {reviewStep === 'experience' && (
                    <div className="space-y-6">
                      

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Expériences */}
                        {extractedData.experiences && extractedData.experiences.length > 0 && (
                          <div className=" p-4 rounded-lg text-left">
                            
                            <div className="space-y-3 text-sm">
                              {extractedData.experiences.map((exp, index) => (
                                <div key={index} className="bg-white p-3 rounded border-l-4 border-blue-400">
                                  <p className="font-semibold text-gray-900">{exp.position}</p>
                                  <p className="text-blue-700">{exp.company}</p>
                                  <p className="text-gray-600 text-xs">{exp.startDate} - {exp.endDate}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Formations */}
                        {extractedData.formations && extractedData.formations.length > 0 && (
                          <div className=" p-4 rounded-lg text-left">
                            <h4 className="font-medium text-green-900 mb-3 text-left flex items-center gap-2">
                              🎓 Formations ({extractedData.formations.length})
                            </h4>
                            <div className="space-y-3 text-sm">
                              {extractedData.formations.map((form, index) => (
                                <div key={index} className="bg-white p-3 rounded border-l-4 border-green-400">
                                  <p className="font-semibold text-gray-900">{form.degree}</p>
                                  <p className="text-green-700">{form.school}</p>
                                  <p className="text-gray-600 text-xs">{form.startYear} - {form.endYear}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Étape 3: Compétences */}
                  {reviewStep === 'skills' && (
                    <div className="space-y-4">
                      

                      {extractedData.skills && extractedData.skills.length > 0 && (
                        <div className=" p-6 rounded-lg text-left max-w-2xl mx-auto">
                          <div className="grid grid-cols-2 gap-4">
                            {extractedData.skills.map((skill, index) => (
                              <div key={index} className="bg-white p-3 rounded-lg shadow-sm border">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-900">{skill.name}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    skill.level === 'Expert' ? 'bg-green-100 text-green-800' :
                                    skill.level === 'Avancé' ? 'bg-blue-100 text-blue-800' :
                                    skill.level === 'Intermédiaire' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {skill.level}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{skill.category}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Étape 4: Résumé et Actions */}
                  {reviewStep === 'summary' && (
                    <div className="space-y-6">
                     

                      {/* Résumé compact */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-2xl mb-1">👤</div>
                            <div className="text-sm font-medium text-gray-900">Profil</div>
                            <div className="text-xs text-gray-600">Complet</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-2xl mb-1">💼</div>
                            <div className="text-sm font-medium text-gray-900">Expériences</div>
                            <div className="text-xs text-gray-600">{extractedData.experiences?.length || 0} trouvées</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-2xl mb-1">🎓</div>
                            <div className="text-sm font-medium text-gray-900">Formations</div>
                            <div className="text-xs text-gray-600">{extractedData.formations?.length || 0} trouvées</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-2xl mb-1">🔧</div>
                            <div className="text-sm font-medium text-gray-900">Compétences</div>
                            <div className="text-xs text-gray-600">{extractedData.skills?.length || 0} trouvées</div>
                          </div>
                        </div>
                      </div>

                      {/* Texte OCR (accordéon compact) */}
                      {extractedData.rawText && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                          <details className="cursor-pointer group">
                            <summary className="font-medium text-gray-900 text-sm hover:text-indigo-600 select-none flex items-center gap-2 transition-colors">
                              <span>📄 Texte OCR brut</span>
                              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                                {extractedData.rawText.length} caractères
                              </span>
                              <span className="ml-auto text-xs text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="mt-2 p-3 bg-white border border-slate-200 rounded text-xs text-gray-700 max-h-32 overflow-y-auto font-mono">
                              {extractedData.rawText}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer fixe - Navigation */}
                <div className="flex-shrink-0 border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (reviewStep === 'personal') {
                          restart();
                        } else {
                          const steps = ['personal', 'experience', 'skills', 'summary'];
                          const currentIndex = steps.indexOf(reviewStep);
                          setReviewStep(steps[currentIndex - 1] as any);
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      {reviewStep === 'personal' ? '🔄 Reprendre photo' : '← Précédent'}
                    </Button>

                    <div className="flex gap-2">
                      {reviewStep !== 'summary' ? (
                        <Button
                          variant="primary"
                          onClick={() => {
                            const steps = ['personal', 'experience', 'skills', 'summary'];
                            const currentIndex = steps.indexOf(reviewStep);
                            setReviewStep(steps[currentIndex + 1] as any);
                          }}
                          className="flex items-center gap-2"
                        >
                          Suivant →
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={confirmData}
                          className="flex items-center gap-2"
                        >
                          <CheckIcon className="h-5 w-5" />
                          Utiliser ces données
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVCaptureModal;