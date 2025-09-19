# 🚀 Guide de Déploiement Vercel

## 📋 Prérequis
- [x] Compte Vercel (gratuit) : https://vercel.com
- [x] Compte GitHub (pour connecter le repository)
- [x] Vercel CLI installé : `npm install -g vercel`

## 🔑 Étapes de déploiement

### 1. Préparer le repository Git

```bash
# Si pas encore fait, initialiser Git
git init
git add .
git commit -m "Préparation pour le déploiement Vercel"

# Pousser vers GitHub (créer un repository d'abord)
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
git branch -M main
git push -u origin main
```

### 2. Déployer avec Vercel CLI

```bash
# Se connecter à Vercel
vercel login

# Déployer l'application (première fois)
vercel

# Suivez les instructions :
# - Link to existing project? No
# - What's your project's name? cvapp (ou votre nom préféré)
# - In which directory is your code located? ./
# - Want to override the settings? No
```

### 3. Configurer les variables d'environnement

Dans le dashboard Vercel (https://vercel.com/dashboard) :

1. Allez dans votre projet
2. Cliquez sur "Settings"
3. Cliquez sur "Environment Variables"
4. Ajoutez les variables suivantes :

```
VITE_FIREBASE_API_KEY = AIzaSyB0XYb5kib1qvNRAcWaxE3L3-OpcvvfJ00
VITE_FIREBASE_AUTH_DOMAIN = cvapp-658dc.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = cvapp-658dc
VITE_FIREBASE_STORAGE_BUCKET = cvapp-658dc.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 1006150464263
VITE_FIREBASE_APP_ID = 1:1006150464263:web:98d2e69e7319aee872cba2
VITE_FIREBASE_MEASUREMENT_ID = G-K12XNKHYYG
```

### 4. Redéployer avec les variables

```bash
# Redéployer en production
vercel --prod
```

### 5. Configurer Firebase pour la production

Dans la console Firebase (https://console.firebase.google.com) :

1. Allez dans "Authentication" > "Settings" > "Authorized domains"
2. Ajoutez votre domaine Vercel : `VOTRE_APP.vercel.app`
3. Allez dans "Firestore" > "Rules"
4. Vérifiez que les règles autorisent votre domaine

## 🛠️ Commandes utiles

```bash
# Déployer en production
vercel --prod

# Déployer un aperçu (preview)
vercel

# Voir les logs
vercel logs

# Voir les domaines
vercel domains

# Supprimer un projet
vercel remove
```

## 🔧 Configuration Firebase Rules

Assurez-vous que vos règles Firestore permettent l'accès depuis votre domaine :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les utilisateurs authentifiés
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour les CVs
    match /cvs/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Règles pour les CVs partagés (lecture publique)
    match /shared_cvs/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## ⚡ Optimisations pour la production

### Compression et cache
Vercel gère automatiquement :
- ✅ Compression Gzip/Brotli
- ✅ Cache statique
- ✅ CDN global
- ✅ HTTPS automatique

### Code splitting (optionnel)
Pour réduire la taille du bundle, vous pouvez utiliser le lazy loading :

```typescript
// Dans App.tsx
import { lazy, Suspense } from 'react';

const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard'));

// Utilisation
<Suspense fallback={<div>Chargement...</div>}>
  <RecruiterDashboard />
</Suspense>
```

## 🌐 Domaine personnalisé (optionnel)

1. Dans Vercel Dashboard > Settings > Domains
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions Vercel

## 📊 Monitoring

Vercel fournit automatiquement :
- Analytics de performance
- Logs de fonction
- Métriques de vitesse
- Surveillance d'uptime

## 🐛 Dépannage

### Erreur de build
```bash
# Vérifier les logs de build
vercel logs --follow

# Tester le build localement
npm run build
```

### Variables d'environnement
```bash
# Vérifier les variables
vercel env ls
```

### Problèmes Firebase
1. Vérifiez les domaines autorisés
2. Vérifiez les règles de sécurité
3. Vérifiez les quotas Firebase

## 🎉 Finalisation

Une fois déployé, votre application sera disponible à :
- URL de production : `https://VOTRE_APP.vercel.app`
- URLs de preview pour chaque commit

Félicitations ! 🎊 Votre CV App est maintenant en ligne !