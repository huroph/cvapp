/**
 * Script simple de nettoyage - Version sécurisée
 * Ne supprime que les données, garde la structure
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

// ⚠️ REMPLACEZ PAR VOTRE CONFIGURATION FIREBASE
const firebaseConfig = {
  // Copiez votre configuration ici
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearCollection(collectionName: string) {
  console.log(`🧹 Nettoyage: ${collectionName}`);
  
  const snapshot = await getDocs(collection(db, collectionName));
  console.log(`   📊 ${snapshot.docs.length} documents`);
  
  if (snapshot.docs.length === 0) {
    console.log(`   ✅ Déjà vide`);
    return;
  }
  
  for (const document of snapshot.docs) {
    await deleteDoc(doc(db, collectionName, document.id));
  }
  
  console.log(`   ✅ ${snapshot.docs.length} documents supprimés`);
}

async function main() {
  console.log('🚀 Nettoyage de la base de données...\n');
  
  const collections = [
    'users',
    'cvs', 
    'shared_cvs',
    'cv_views',
    'cv_conversions',
    'recruiter_profiles'
  ];
  
  for (const collectionName of collections) {
    try {
      await clearCollection(collectionName);
    } catch (error) {
      console.error(`❌ Erreur sur ${collectionName}:`, error);
    }
  }
  
  console.log('\n🎉 Nettoyage terminé !');
}

main().catch(console.error);