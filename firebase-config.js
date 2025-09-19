/**
 * Configuration des domaines autorisés pour Firebase Auth
 * 
 * Instructions pour configurer Firebase :
 * 
 * 1. Allez sur https://console.firebase.google.com
 * 2. Sélectionnez votre projet : cvapp-658dc
 * 3. Allez dans "Authentication" > "Settings" 
 * 4. Cliquez sur l'onglet "Authorized domains"
 * 5. Ajoutez ces domaines :
 */

const AUTHORIZED_DOMAINS = [
  'localhost',
  'cvapp-7vpa17z60-hugo-nahmias-projects.vercel.app',
  'cvapp-3s37t02ha-hugo-nahmias-projects.vercel.app',
  // Ajoutez votre domaine personnalisé ici si vous en avez un
  // 'monsite.com'
];

/**
 * Règles Firestore recommandées :
 */

const FIRESTORE_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les profils utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour les CVs privés
    match /cvs/{cvId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Règles pour les CVs partagés (lecture publique)
    match /shared_cvs/{shareId} {
      allow read: if true;
      allow create, update: if request.auth != null;
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.candidateId;
    }
    
    // Règles pour les vues de CV (analytics)
    match /cv_views/{viewId} {
      allow create: if true;
      allow read: if request.auth != null;
    }
    
    // Règles pour les conversions (analytics)
    match /cv_conversions/{conversionId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
    }
    
    // Règles pour les profils recruteurs
    match /recruiter_profiles/{recruiterId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == recruiterId;
    }
    
    // Règles pour les CVs sauvegardés par les recruteurs
    match /viewed_cvs/{viewId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.recruiterId;
    }
  }
}
`;

console.log('🔥 Domaines à autoriser dans Firebase Auth :');
AUTHORIZED_DOMAINS.forEach(domain => {
  console.log(`  ✅ ${domain}`);
});

console.log('\n📋 Règles Firestore à appliquer :');
console.log(FIRESTORE_RULES);

export { AUTHORIZED_DOMAINS, FIRESTORE_RULES };