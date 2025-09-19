/**
 * Script de nettoyage de la base de données Firebase (TypeScript)
 * ATTENTION: Ce script supprime TOUTES les données mais garde la structure
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { getStorage, ref, listAll, deleteObject } from 'firebase/storage';

// Importer votre configuration Firebase
// Remplacez ce chemin par le chemin vers votre fichier de config
const firebaseConfig = {
  // Copiez votre configuration Firebase ici
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Interface pour les statistiques de nettoyage
interface CleaningStats {
  collectionsCleared: string[];
  documentsDeleted: number;
  filesDeleted: number;
  errors: string[];
}

// Liste des collections à nettoyer
const COLLECTIONS_TO_CLEAN = [
  'users',
  'cvs', 
  'shared_cvs',
  'cv_views',
  'cv_conversions',
  'recruiter_profiles',
  'viewed_cvs'
] as const;

class DatabaseCleaner {
  private stats: CleaningStats = {
    collectionsCleared: [],
    documentsDeleted: 0,
    filesDeleted: 0,
    errors: []
  };

  /**
   * Nettoie une collection spécifique
   */
  async cleanCollection(collectionName: string): Promise<void> {
    console.log(`🧹 Nettoyage de la collection: ${collectionName}`);
    
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      
      if (querySnapshot.empty) {
        console.log(`   ✅ Collection ${collectionName} déjà vide`);
        this.stats.collectionsCleared.push(collectionName);
        return;
      }

      const docCount = querySnapshot.docs.length;
      console.log(`   📊 ${docCount} documents trouvés`);
      
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
      
      this.stats.collectionsCleared.push(collectionName);
      this.stats.documentsDeleted += docCount;
      console.log(`   ✅ Collection ${collectionName} nettoyée (${docCount} documents supprimés)`);
      
    } catch (error) {
      const errorMsg = `Erreur lors du nettoyage de ${collectionName}: ${error}`;
      console.error(`   ❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
      throw error;
    }
  }

  /**
   * Nettoie le Storage Firebase
   */
  async cleanStorage(): Promise<void> {
    console.log('🗂️ Nettoyage du Storage...');
    
    try {
      const storageRef = ref(storage);
      const result = await listAll(storageRef);
      
      if (result.items.length === 0 && result.prefixes.length === 0) {
        console.log('   ✅ Storage déjà vide');
        return;
      }

      console.log(`   📁 ${result.prefixes.length} dossiers trouvés`);
      console.log(`   📄 ${result.items.length} fichiers trouvés`);

      // Collecter tous les fichiers à supprimer
      const deletePromises: Promise<void>[] = [];
      
      // Fichiers à la racine
      deletePromises.push(...result.items.map(item => deleteObject(item)));
      
      // Fichiers dans les dossiers (récursif)
      for (const folderRef of result.prefixes) {
        try {
          const folderResult = await listAll(folderRef);
          deletePromises.push(...folderResult.items.map(item => deleteObject(item)));
        } catch (error) {
          console.warn(`   ⚠️ Impossible de lister le dossier ${folderRef.fullPath}:`, error);
        }
      }

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        this.stats.filesDeleted = deletePromises.length;
        console.log(`   ✅ Storage nettoyé (${deletePromises.length} fichiers supprimés)`);
      }
      
    } catch (error) {
      const errorMsg = `Erreur lors du nettoyage du Storage: ${error}`;
      console.error(`   ❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
      // Ne pas faire échouer le script pour le storage
    }
  }

  /**
   * Nettoie toute la base de données
   */
  async cleanDatabase(): Promise<CleaningStats> {
    try {
      console.log('🚀 Début du nettoyage de la base de données...\n');

      // 1. Nettoyer les collections Firestore
      for (const collectionName of COLLECTIONS_TO_CLEAN) {
        await this.cleanCollection(collectionName);
      }

      // 2. Nettoyer le Storage
      await this.cleanStorage();

      this.displaySummary();
      return this.stats;
      
    } catch (error) {
      console.error('\n💥 Erreur durant le nettoyage:', error);
      throw error;
    }
  }

  /**
   * Affiche un résumé des opérations
   */
  private displaySummary(): void {
    console.log('\n🎉 Nettoyage terminé !');
    console.log('📋 Résumé:');
    console.log(`   ✅ ${this.stats.collectionsCleared.length} collections nettoyées`);
    console.log(`   🗑️ ${this.stats.documentsDeleted} documents supprimés`);
    console.log(`   📁 ${this.stats.filesDeleted} fichiers supprimés`);
    
    if (this.stats.errors.length > 0) {
      console.log(`   ⚠️ ${this.stats.errors.length} erreur(s) rencontrée(s)`);
      this.stats.errors.forEach(error => console.log(`      - ${error}`));
    }
    
    console.log('   🏗️ Structure des collections préservée');
  }
}

/**
 * Fonction utilitaire pour confirmer l'opération
 */
async function confirmOperation(): Promise<boolean> {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('⚠️  ATTENTION: Cette opération va supprimer TOUTES les données de votre base Firebase !');
    console.log('📝 Collections qui seront nettoyées:');
    COLLECTIONS_TO_CLEAN.forEach(col => console.log(`   - ${col}`));
    console.log('🗂️ Le Storage sera également nettoyé');
    console.log('\n❗ Cette action est IRRÉVERSIBLE !');
    console.log('\n🔍 Assurez-vous d\'avoir une sauvegarde si nécessaire.');
    
    rl.question('\n❓ Êtes-vous sûr de vouloir continuer? (tapez "OUI" pour confirmer): ', (answer: string) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'oui');
    });
  });
}

/**
 * Point d'entrée principal
 */
async function main(): Promise<void> {
  try {
    console.log('🧹 Script de nettoyage de la base de données Firebase\n');
    
    // Demander confirmation seulement si on n'est pas en mode force
    const forceMode = process.argv.includes('--force');
    
    if (!forceMode) {
      const confirmed = await confirmOperation();
      
      if (!confirmed) {
        console.log('\n❌ Opération annulée par l\'utilisateur');
        process.exit(0);
      }

      console.log('\n⏳ Démarrage du nettoyage dans 3 secondes...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    const cleaner = new DatabaseCleaner();
    await cleaner.cleanDatabase();
    
    console.log('\n✨ Base de données nettoyée avec succès !');
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  }
}

// Exporter pour utilisation en tant que module
export { DatabaseCleaner, COLLECTIONS_TO_CLEAN };

// Exécuter le script si appelé directement
if (require.main === module) {
  main();
}