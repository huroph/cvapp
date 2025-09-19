// Constantes et utilitaires partagés dans l'application

// Couleurs pour les badges de compétences
export const SKILL_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-red-100 text-red-700',
  'bg-yellow-100 text-yellow-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
  'bg-cyan-100 text-cyan-700',
] as const;

// Labels pour les compétences (mapping des IDs vers les noms d'affichage)
export const SKILL_LABELS: { [key: string]: string } = {
  // Design
  'figma': 'Figma',
  'sketch': 'Sketch',
  'photoshop': 'Adobe Photoshop',
  'illustrator': 'Adobe Illustrator',
  'indesign': 'Adobe InDesign',
  'xd': 'Adobe XD',
  'prototyping': 'Prototypage',
  'user-research': 'User Research',
  'ui-design': 'UI Design',
  'ux-design': 'UX Design',
  
  // Développement Frontend
  'html': 'HTML5',
  'css': 'CSS3',
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'react': 'React',
  'vue': 'Vue.js',
  'angular': 'Angular',
  'svelte': 'Svelte',
  'nextjs': 'Next.js',
  'nuxtjs': 'Nuxt.js',
  'tailwind': 'Tailwind CSS',
  'bootstrap': 'Bootstrap',
  'sass': 'Sass/SCSS',
  
  // Développement Backend
  'nodejs': 'Node.js',
  'python': 'Python',
  'java': 'Java',
  'csharp': 'C#',
  'php': 'PHP',
  'ruby': 'Ruby',
  'go': 'Go',
  'rust': 'Rust',
  'express': 'Express.js',
  'django': 'Django',
  'flask': 'Flask',
  'spring': 'Spring Boot',
  'dotnet': '.NET',
  
  // Bases de données
  'mysql': 'MySQL',
  'postgresql': 'PostgreSQL',
  'mongodb': 'MongoDB',
  'redis': 'Redis',
  'sqlite': 'SQLite',
  'firebase': 'Firebase',
  'supabase': 'Supabase',
  
  // Outils et DevOps
  'git': 'Git',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'aws': 'AWS',
  'azure': 'Azure',
  'gcp': 'Google Cloud',
  'vercel': 'Vercel',
  'netlify': 'Netlify',
  'jira': 'Jira',
  'confluence': 'Confluence',
  'slack': 'Slack',
  'notion': 'Notion',
  
  // Testing
  'jest': 'Jest',
  'cypress': 'Cypress',
  'playwright': 'Playwright',
  'selenium': 'Selenium',
} as const;

// Niveaux de compétences
export const SKILL_LEVELS = [
  'Débutant',
  'Intermédiaire', 
  'Avancé',
  'Expert'
] as const;

// Catégories de compétences
export const SKILL_CATEGORIES = [
  'Outils Design',
  'Compétences métier',
  'Langages de programmation',
  'Frameworks/Librairies',
  'Bases de données',
  'Outils DevOps',
  'Testing',
  'Soft Skills'
] as const;

// Classes CSS communes pour les boutons
export const BUTTON_CLASSES = {
  base: 'btn-custom inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  primary: 'bg-indigo-600 text-white border-2 border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700 focus:ring-indigo-500',
  secondary: 'bg-gray-500 text-white border-2 border-gray-500 hover:bg-gray-600 hover:border-gray-600 focus:ring-gray-500',
  danger: 'bg-red-600 text-white border-2 border-red-600 hover:bg-red-700 hover:border-red-700 focus:ring-red-500',
  success: 'bg-green-600 text-white border-2 border-green-600 hover:bg-green-700 hover:border-green-700 focus:ring-green-500',
  outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
} as const;

// Classes CSS communes pour les inputs
export const INPUT_CLASSES = {
  base: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400',
  error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
  success: 'border-green-300 focus:ring-green-500 focus:border-green-500'
} as const;

// Utilitaires pour les dates
export const formatDate = (date: string): string => {
  if (!date) return '';
  const [year, month] = date.split('-');
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

export const calculateDuration = (startDate: string, endDate: string, isCurrentJob: boolean = false): string => {
  if (isCurrentJob) {
    const start = new Date(startDate);
    const now = new Date();
    const diffInMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    
    if (diffInMonths < 12) {
      return `${diffInMonths} mois`;
    } else {
      const years = Math.floor(diffInMonths / 12);
      const months = diffInMonths % 12;
      return months > 0 ? `${years} an${years > 1 ? 's' : ''} ${months} mois` : `${years} an${years > 1 ? 's' : ''}`;
    }
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  
  if (diffInMonths < 12) {
    return `${diffInMonths} mois`;
  } else {
    const years = Math.floor(diffInMonths / 12);
    const months = diffInMonths % 12;
    return months > 0 ? `${years} an${years > 1 ? 's' : ''} ${months} mois` : `${years} an${years > 1 ? 's' : ''}`;
  }
};

// Utilitaires pour les compétences
export const getSkillColor = (index: number): string => {
  return SKILL_COLORS[index % SKILL_COLORS.length];
};

export const getSkillLabel = (skillId: string): string => {
  return SKILL_LABELS[skillId.toLowerCase()] || skillId;
};

// Utilitaires pour la validation
export const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isPhoneValid = (phone: string): boolean => {
  const phoneRegex = /^(\+33|0)[1-9](?:[0-9]{8})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Générateur d'IDs uniques
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Utilitaires pour les noms
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const getFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};