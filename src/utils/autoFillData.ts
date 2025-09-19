// Données de remplissage automatique pour la création de CV

export interface AutoFillCVData {
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

// Données de CV pré-remplies pour le développeur
export const developerAutoFillData: AutoFillCVData = {
  basicInfo: {
    title: 'CV Développeur Full Stack',
    firstName: '',
    lastName: '',
    position: 'Développeur Full Stack Senior',
    email: '',
    phone: '+33 6 12 34 56 78',
    location: 'Lyon, France'
  },
  formations: [
    {
      id: '1',
      degree: 'Master Informatique',
      school: 'École Supérieure d\'Informatique',
      location: 'Lyon, France',
      startYear: '2019',
      endYear: '2021',
      description: 'Spécialisation en développement web et applications mobiles'
    },
    {
      id: '2',
      degree: 'Licence Informatique',
      school: 'Université Claude Bernard Lyon 1',
      location: 'Lyon, France',
      startYear: '2016',
      endYear: '2019',
      description: 'Formation générale en informatique et mathématiques'
    }
  ],
  skills: [
    { id: '1', name: 'React', category: 'Frontend', level: 'Expert' },
    { id: '2', name: 'TypeScript', category: 'Langages', level: 'Expert' },
    { id: '3', name: 'Node.js', category: 'Backend', level: 'Avancé' },
    { id: '4', name: 'Python', category: 'Langages', level: 'Avancé' },
    { id: '5', name: 'PostgreSQL', category: 'Base de données', level: 'Avancé' },
    { id: '6', name: 'Docker', category: 'DevOps', level: 'Intermédiaire' }
  ],
  experiences: [
    {
      id: '1',
      position: 'Développeur Full Stack Senior',
      company: 'TechCorp',
      location: 'Lyon, France',
      startDate: '2022-01',
      endDate: '',
      isCurrentJob: true,
      description: 'Développement d\'applications web modernes avec React et Node.js',
      achievements: [
        'Migration complète vers TypeScript (+30% de productivité)',
        'Mise en place d\'une architecture microservices',
        'Encadrement d\'une équipe de 3 développeurs juniors'
      ]
    },
    {
      id: '2',
      position: 'Développeur Full Stack',
      company: 'StartupTech',
      location: 'Lyon, France',
      startDate: '2020-06',
      endDate: '2021-12',
      isCurrentJob: false,
      description: 'Développement d\'une plateforme e-commerce from scratch',
      achievements: [
        'Développement d\'une API REST avec Node.js et Express',
        'Interface utilisateur responsive avec React',
        'Intégration de systèmes de paiement (Stripe, PayPal)'
      ]
    }
  ]
};

// Données de CV pré-remplies pour le designer
export const designerAutoFillData: AutoFillCVData = {
  basicInfo: {
    title: 'CV Designer UI/UX',
    firstName: '',
    lastName: '',
    position: 'Designer UI/UX Senior',
    email: '',
    phone: '+33 6 87 65 43 21',
    location: 'Paris, France'
  },
  formations: [
    {
      id: '1',
      degree: 'Master Design Graphique et Digital',
      school: 'École Supérieure de Design',
      location: 'Paris, France',
      startYear: '2018',
      endYear: '2020',
      description: 'Spécialisation en UX/UI Design et design thinking'
    },
    {
      id: '2',
      degree: 'Licence Arts Appliqués',
      school: 'Université Paris 8',
      location: 'Paris, France',
      startYear: '2015',
      endYear: '2018',
      description: 'Formation en arts visuels et design graphique'
    }
  ],
  skills: [
    { id: '1', name: 'Figma', category: 'Outils Design', level: 'Expert' },
    { id: '2', name: 'Adobe Creative Suite', category: 'Outils Design', level: 'Expert' },
    { id: '3', name: 'Sketch', category: 'Outils Design', level: 'Avancé' },
    { id: '4', name: 'Prototyping', category: 'Compétences métier', level: 'Expert' },
    { id: '5', name: 'User Research', category: 'Compétences métier', level: 'Avancé' },
    { id: '6', name: 'Design System', category: 'Compétences métier', level: 'Expert' }
  ],
  experiences: [
    {
      id: '1',
      position: 'Senior UI/UX Designer',
      company: 'DesignStudio',
      location: 'Paris, France',
      startDate: '2021-03',
      endDate: '',
      isCurrentJob: true,
      description: 'Conception d\'interfaces utilisateur pour applications web et mobile',
      achievements: [
        'Redesign complet de l\'application (+25% d\'engagement)',
        'Création d\'un design system utilisé par 5 équipes',
        'Encadrement de 2 designers juniors'
      ]
    },
    {
      id: '2',
      position: 'UI/UX Designer',
      company: 'CreativeAgency',
      location: 'Paris, France',
      startDate: '2019-01',
      endDate: '2021-02',
      isCurrentJob: false,
      description: 'Design d\'interfaces pour startups et PME',
      achievements: [
        'Conception de plus de 15 sites web et applications',
        'Amélioration du taux de conversion de 40% en moyenne',
        'Mise en place de processus de design thinking'
      ]
    }
  ]
};

// Fonction pour obtenir des données aléatoires
export const getRandomAutoFillData = (): AutoFillCVData => {
  const profiles = [developerAutoFillData, designerAutoFillData];
  return profiles[Math.floor(Math.random() * profiles.length)];
};