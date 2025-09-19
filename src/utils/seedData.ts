import { CVService } from '../services/cvService';
import type { CVFirebase } from '../services/cvService';

// Données de seed pour 3 CVs exemples
const seedCVs: Omit<CVFirebase, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    basicInfo: {
      title: 'CV Designer UI/UX',
      firstName: 'Marie',
      lastName: 'Dubois',
      position: 'Designer UI/UX Senior',
      email: 'marie.dubois@email.com',
      phone: '06 12 34 56 78',
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
      { id: '1', name: 'Figma', category: 'Outils & Technologies', level: 'Expert' },
      { id: '2', name: 'Adobe Creative Suite', category: 'Outils & Technologies', level: 'Avancé' },
      { id: '3', name: 'Sketch', category: 'Outils & Technologies', level: 'Avancé' },
      { id: '4', name: 'Prototyping', category: 'Compétences métier', level: 'Expert' },
      { id: '5', name: 'User Research', category: 'Compétences métier', level: 'Avancé' },
      { id: '6', name: 'Design System', category: 'Compétences métier', level: 'Expert' }
    ],
    experiences: [
      {
        id: '1',
        position: 'Senior UI/UX Designer',
        company: 'TechStart SAS',
        location: 'Paris, France',
        startDate: '2021-03',
        endDate: '',
        isCurrentJob: true,
        description: 'Lead designer sur les produits phares de la startup',
        achievements: [
          'Amélioration de 40% du taux de conversion après refonte UX',
          'Création du design system utilisé par toute l\'équipe',
          'Management d\'une équipe de 3 designers junior'
        ]
      },
      {
        id: '2',
        position: 'UI/UX Designer',
        company: 'Agence Digital',
        location: 'Paris, France',
        startDate: '2020-06',
        endDate: '2021-02',
        isCurrentJob: false,
        description: 'Designer sur projets clients variés',
        achievements: [
          'Design de 15+ interfaces web et mobile',
          'Collaboration avec équipes de développement agiles'
        ]
      }
    ]
  },
  {
    basicInfo: {
      title: 'CV Développeur Full-Stack',
      firstName: 'Thomas',
      lastName: 'Martin',
      position: 'Développeur Full-Stack React/Node.js',
      email: 'thomas.martin@dev.com',
      phone: '06 98 76 54 32',
      location: 'Lyon, France'
    },
    formations: [
      {
        id: '1',
        degree: 'Master Informatique',
        school: 'INSA Lyon',
        location: 'Lyon, France',
        startYear: '2017',
        endYear: '2019',
        description: 'Spécialisation développement web et mobile'
      }
    ],
    skills: [
      { id: '1', name: 'React', category: 'Frameworks & Librairies', level: 'Expert' },
      { id: '2', name: 'Node.js', category: 'Frameworks & Librairies', level: 'Avancé' },
      { id: '3', name: 'TypeScript', category: 'Langages de programmation', level: 'Avancé' },
      { id: '4', name: 'PostgreSQL', category: 'Bases de données', level: 'Avancé' },
      { id: '5', name: 'Docker', category: 'Outils & Technologies', level: 'Intermédiaire' },
      { id: '6', name: 'Git', category: 'Outils & Technologies', level: 'Expert' }
    ],
    experiences: [
      {
        id: '1',
        position: 'Développeur Full-Stack Senior',
        company: 'DevCorp',
        location: 'Lyon, France',
        startDate: '2021-01',
        endDate: '',
        isCurrentJob: true,
        description: 'Développement d\'applications web complexes',
        achievements: [
          'Architecture de 3 applications React/Node.js',
          'Réduction de 50% du temps de chargement',
          'Mentor de 2 développeurs junior'
        ]
      }
    ]
  },
  {
    basicInfo: {
      title: 'CV Chef de Projet Digital',
      firstName: 'Sophie',
      lastName: 'Leroy',
      position: 'Chef de Projet Digital',
      email: 'sophie.leroy@project.com',
      phone: '06 45 67 89 12',
      location: 'Bordeaux, France'
    },
    formations: [
      {
        id: '1',
        degree: 'Master Management de Projets',
        school: 'ESC Bordeaux',
        location: 'Bordeaux, France',
        startYear: '2016',
        endYear: '2018',
        description: 'Spécialisation gestion de projets digitaux et transformation numérique'
      }
    ],
    skills: [
      { id: '1', name: 'Gestion de projet Agile', category: 'Compétences métier', level: 'Expert' },
      { id: '2', name: 'Scrum', category: 'Compétences métier', level: 'Expert' },
      { id: '3', name: 'Jira', category: 'Outils & Technologies', level: 'Avancé' },
      { id: '4', name: 'Leadership', category: 'Soft skills', level: 'Avancé' },
      { id: '5', name: 'Communication', category: 'Soft skills', level: 'Expert' }
    ],
    experiences: [
      {
        id: '1',
        position: 'Chef de Projet Digital Senior',
        company: 'Innovation Corp',
        location: 'Bordeaux, France',
        startDate: '2020-09',
        endDate: '',
        isCurrentJob: true,
        description: 'Pilotage de projets de transformation digitale',
        achievements: [
          'Livraison de 12 projets dans les délais et budgets',
          'Management d\'équipes multidisciplinaires de 8 personnes',
          'Réduction de 30% des délais de livraison'
        ]
      }
    ]
  }
];

// Fonction pour initialiser les CVs de démonstration
export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Initialisation des données de démonstration...');
    
    // Vérifier s'il y a déjà des CVs
    const existingCVs = await CVService.getAllCVs();
    
    if (existingCVs.length > 0) {
      console.log('📋 Des CVs existent déjà, abandon du seed');
      return;
    }
    
    // Créer les CVs de démonstration
    for (const cvData of seedCVs) {
      // Ajouter un userId de démonstration si pas d'utilisateur connecté
      const cvDataWithUser = { ...cvData, userId: 'demo-user' };
      await CVService.createCV(cvDataWithUser);
      console.log(`✅ CV créé: ${cvData.basicInfo.title}`);
    }
    
    console.log('🎉 Initialisation terminée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  }
};

// Fonction pour réinitialiser la base de données (utile pour le développement)
export const resetDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Réinitialisation de la base de données...');
    
    const existingCVs = await CVService.getAllCVs();
    
    // Supprimer tous les CVs existants
    for (const cv of existingCVs) {
      if (cv.id) {
        await CVService.deleteCV(cv.id);
        console.log(`🗑️ CV supprimé: ${cv.basicInfo.title}`);
      }
    }
    
    // Réinitialiser avec les données de seed
    await seedDatabase();
    
    console.log('✨ Base de données réinitialisée!');
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    throw error;
  }
};

// Fonction pour réinitialiser avec des CVs pour un utilisateur spécifique
export const resetDatabaseForUser = async (userId: string): Promise<void> => {
  try {
    console.log(`🔄 Réinitialisation des données pour l'utilisateur ${userId}...`);
    
    const existingCVs = await CVService.getAllCVs();
    
    // Supprimer tous les CVs de l'utilisateur
    for (const cv of existingCVs) {
      if (cv.id && cv.userId === userId) {
        await CVService.deleteCV(cv.id);
        console.log(`🗑️ CV supprimé: ${cv.basicInfo.title}`);
      }
    }
    
    // Créer les CVs de démonstration pour cet utilisateur
    for (const cvData of seedCVs) {
      const cvDataWithUser = { ...cvData, userId };
      await CVService.createCV(cvDataWithUser);
      console.log(`✅ CV créé pour l'utilisateur: ${cvData.basicInfo.title}`);
    }
    
    console.log('✨ Données réinitialisées pour l\'utilisateur!');
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    throw error;
  }
};