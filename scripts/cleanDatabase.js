/**
 * Script de nettoyage de la base de données Firebase
 * ATTENTION: Ce script supprime TOUTES les données mais garde la structure
 * 
 * Usage: node scripts/cleanDatabase.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { getAuth, deleteUser } from 'firebase/auth';
import { getStorage, ref, listAll, deleteObject } from 'firebase/storage';
import readline from 'readline';

// Configuration Firebase (à adapter avec vos vraies clés)
const firebaseConfig = {
  // Copiez votre configuration Firebase ici
  // ou importez-la depuis votre fichier de config
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Interface pour confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Liste des collections à nettoyer
const COLLECTIONS_TO_CLEAN = [
  'users',
  'cvs', 
  'shared_cvs',
  'cv_views',
  'cv_conversions',
  'recruiter_profiles',
  'viewed_cvs'
];

// Fonction pour supprimer tous les documents d'une collection
async function cleanCollection(collectionName) {
  console.log(`🧹 Nettoyage de la collection: ${collectionName}`);
  
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    
    if (querySnapshot.empty) {
      console.log(`   ✅ Collection ${collectionName} déjà vide`);
      return;
    }

    console.log(`   📊 ${querySnapshot.docs.length} documents trouvés`);
    
    // Utiliser des batches pour optimiser les suppressions
    const batches = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;

    querySnapshot.docs.forEach((document) => {
      currentBatch.delete(doc(db, collectionName, document.id));
      operationCount++;

      // Firebase limite à 500 opérations par batch
      if (operationCount === 500) {
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
    });

    // Ajouter le dernier batch s'il contient des opérations
    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    // Exécuter tous les batches
    console.log(`   🔄 Exécution de ${batches.length} batch(es)...`);
    await Promise.all(batches.map(batch => batch.commit()));
    
    console.log(`   ✅ Collection ${collectionName} nettoyée avec succès`);
    
  } catch (error) {
    console.error(`   ❌ Erreur lors du nettoyage de ${collectionName}:`, error);
    throw error;
  }
}

// Fonction pour nettoyer le Storage (fichiers uploadés)
async function cleanStorage() {
  console.log('🗂️ Nettoyage du Storage...');
  
  try {
    // Lister tous les dossiers dans le storage
    const storageRef = ref(storage);
    const result = await listAll(storageRef);
    
    if (result.items.length === 0 && result.prefixes.length === 0) {
      console.log('   ✅ Storage déjà vide');
      return;
    }

    console.log(`   📁 ${result.prefixes.length} dossiers trouvés`);
    console.log(`   📄 ${result.items.length} fichiers trouvés`);

    // Supprimer tous les fichiers
    const deletePromises = result.items.map(item => deleteObject(item));
    
    // Supprimer récursivement les dossiers
    for (const folderRef of result.prefixes) {
      const folderResult = await listAll(folderRef);
      deletePromises.push(...folderResult.items.map(item => deleteObject(item)));
    }

    await Promise.all(deletePromises);
    console.log('   ✅ Storage nettoyé avec succès');
    
  } catch (error) {
    console.error('   ❌ Erreur lors du nettoyage du Storage:', error);
    // Ne pas faire échouer le script pour le storage
  }
}

// Fonction principale de nettoyage
async function cleanDatabase() {
  try {
    console.log('🚀 Début du nettoyage de la base de données...\n');

    // 1. Nettoyer les collections Firestore
    for (const collectionName of COLLECTIONS_TO_CLEAN) {
      await cleanCollection(collectionName);
    }

    // 2. Nettoyer le Storage
    await cleanStorage();

    console.log('\n🎉 Nettoyage terminé avec succès !');
    console.log('📋 Résumé:');
    console.log(`   - ${COLLECTIONS_TO_CLEAN.length} collections nettoyées`);
    console.log('   - Storage nettoyé');
    console.log('   - Structure des collections préservée');
    
  } catch (error) {
    console.error('\n💥 Erreur durant le nettoyage:', error);
    process.exit(1);
  }
}

// Fonction de confirmation
function askConfirmation() {
  return new Promise((resolve) => {
    console.log('⚠️  ATTENTION: Cette opération va supprimer TOUTES les données de votre base Firebase !');
    console.log('📝 Collections qui seront nettoyées:');
    COLLECTIONS_TO_CLEAN.forEach(col => console.log(`   - ${col}`));
    console.log('🗂️ Le Storage sera également nettoyé');
    console.log('\n❗ Cette action est IRRÉVERSIBLE !');
    console.log('\n🔍 Assurez-vous d\'avoir une sauvegarde si nécessaire.');
    
    rl.question('\n❓ Êtes-vous sûr de vouloir continuer? (tapez "OUI" pour confirmer): ', (answer) => {
      resolve(answer.trim().toLowerCase() === 'oui');
    });
  });
}

// Point d'entrée principal
async function main() {
  try {
    console.log('🧹 Script de nettoyage de la base de données Firebase\n');
    
    const confirmed = await askConfirmation();
    
    if (!confirmed) {
      console.log('\n❌ Opération annulée par l\'utilisateur');
      process.exit(0);
    }

    console.log('\n⏳ Démarrage du nettoyage dans 3 secondes...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    await cleanDatabase();
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Exécuter le script
main();