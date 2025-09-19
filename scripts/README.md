# 🧹 Script de Nettoyage de Base de Données Firebase

Ce dossier contient des scripts pour nettoyer complètement votre base de données Firebase tout en préservant la structure des collections.

## ⚠️ ATTENTION

**CES SCRIPTS SUPPRIMENT TOUTES LES DONNÉES DE MANIÈRE IRRÉVERSIBLE !**

- ✅ Structure des collections préservée
- ❌ Toutes les données supprimées
- ❌ Tous les fichiers Storage supprimés
- ❌ Tous les utilisateurs supprimés

## 📋 Collections nettoyées

- `users` - Profils utilisateurs
- `cvs` - CVs sauvegardés
- `shared_cvs` - CVs partagés
- `cv_views` - Statistiques de vues
- `cv_conversions` - Conversions recruteurs
- `recruiter_profiles` - Profils recruteurs
- `viewed_cvs` - Historique de consultation

## 🔧 Configuration

### 1. Mettre à jour la configuration Firebase

Éditez le fichier `cleanDatabase.ts` ou `cleanDatabase.js` et remplacez la configuration Firebase par la vôtre :

```typescript
const firebaseConfig = {
  apiKey: "votre-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-project-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "votre-app-id"
};
```

### 2. Installer les dépendances nécessaires

```bash
npm install tsx readline
```

## 🚀 Utilisation

### Mode interactif (recommandé)

```bash
# Version TypeScript (recommandée)
npx tsx scripts/cleanDatabase.ts

# Ou version JavaScript
node scripts/cleanDatabase.js
```

Le script vous demandera une confirmation avant de procéder.

### Mode force (pour scripts automatisés)

```bash
# ATTENTION: Pas de confirmation !
npx tsx scripts/cleanDatabase.ts --force
```

### Via npm scripts (si ajoutés au package.json)

```bash
# Mode interactif
npm run clean-db

# Mode force
npm run clean-db-force

# Version JS
npm run clean-db-js
```

## 📊 Fonctionnalités

### ✅ Sécurité
- Confirmation obligatoire (sauf mode `--force`)
- Délai de 3 secondes avant exécution
- Gestion des erreurs
- Logs détaillés

### 📈 Performance
- Traitement par batches (500 opérations max par batch)
- Suppressions parallèles pour le Storage
- Gestion optimisée des grandes collections

### 📋 Reporting
- Comptage des documents supprimés
- Comptage des fichiers supprimés
- Liste des erreurs rencontrées
- Résumé détaillé

## 🔍 Exemple d'exécution

```
🧹 Script de nettoyage de la base de données Firebase

⚠️  ATTENTION: Cette opération va supprimer TOUTES les données de votre base Firebase !
📝 Collections qui seront nettoyées:
   - users
   - cvs
   - shared_cvs
   - cv_views
   - cv_conversions
   - recruiter_profiles
   - viewed_cvs
🗂️ Le Storage sera également nettoyé

❗ Cette action est IRRÉVERSIBLE !

❓ Êtes-vous sûr de vouloir continuer? (tapez "OUI" pour confirmer): OUI

⏳ Démarrage du nettoyage dans 3 secondes...

🚀 Début du nettoyage de la base de données...

🧹 Nettoyage de la collection: users
   📊 15 documents trouvés
   🔄 Exécution de 1 batch(es)...
   ✅ Collection users nettoyée (15 documents supprimés)

🗂️ Nettoyage du Storage...
   📁 2 dossiers trouvés
   📄 8 fichiers trouvés
   ✅ Storage nettoyé (8 fichiers supprimés)

🎉 Nettoyage terminé !
📋 Résumé:
   ✅ 7 collections nettoyées
   🗑️ 45 documents supprimés
   📁 8 fichiers supprimés
   🏗️ Structure des collections préservée
```

## 🛡️ Sauvegardes

**FORTEMENT RECOMMANDÉ** : Faites une sauvegarde avant d'utiliser ces scripts !

### Export Firestore
```bash
# Via Firebase CLI
firebase firestore:export gs://votre-bucket/backup-$(date +%Y%m%d)
```

### Export Storage
```bash
# Via gsutil
gsutil -m cp -r gs://votre-storage-bucket gs://votre-backup-bucket/storage-backup-$(date +%Y%m%d)
```

## 🐛 Dépannage

### Erreur de permissions
- Vérifiez que vos règles Firestore permettent la suppression
- Vérifiez que votre compte a les droits admin

### Erreur de configuration
- Vérifiez la configuration Firebase dans le script
- Vérifiez que le projet Firebase est actif

### Erreur de timeout
- Pour de très grandes collections, le script peut prendre du temps
- Les batches optimisent les performances

## 🔗 Liens utiles

- [Documentation Firebase](https://firebase.google.com/docs)
- [Règles de sécurité Firestore](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Sauvegarde Firestore](https://firebase.google.com/docs/firestore/manage-data/export-import)