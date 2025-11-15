# Guide de Déploiement sur Vercel

## 📋 Prérequis

- Compte Vercel (gratuit ou payant)
- Repository GitHub connecté
- Variables d'environnement configurées

## 🚀 Étapes de Déploiement

### 1. Connexion du Projet à Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New Project"**
3. Importez le repository GitHub : `DevWeb31/phuong-long`
4. Vercel détectera automatiquement Next.js

### 2. Configuration du Build

Vercel détecte automatiquement Next.js, mais vérifiez :
- **Framework Preset**: Next.js
- **Root Directory**: `./` (racine du projet)
- **Build Command**: `npm run build` (par défaut)
- **Output Directory**: `.next` (par défaut)
- **Install Command**: `npm install` (par défaut)

### 3. Variables d'Environnement

Dans les **Settings > Environment Variables** de Vercel, ajoutez toutes les variables suivantes :

#### Variables Supabase (requises)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Variables Stripe (requises pour e-commerce)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Variables Facebook (optionnel)
```
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
FACEBOOK_PAGE_ACCESS_TOKEN=your-page-token
```

#### Variables Email (SendGrid ou Resend)
```
SENDGRID_API_KEY=SG.xxx
# ou
RESEND_API_KEY=re_xxx
```

#### Variables Cloudinary (optionnel)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Variables Analytics (optionnel)
```
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

#### Variables App
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

#### Variables Database (optionnel - si besoin direct)
```
DATABASE_URL=postgresql://...
```

#### Variables Redis (optionnel)
```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

#### Variables Sentry (optionnel)
```
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### 4. Configuration des Environnements

Pour chaque variable, vous pouvez choisir :
- **Production** : Variables pour production
- **Preview** : Variables pour les previews (branches)
- **Development** : Variables pour développement local

**Recommandation** :
- Production : Utilisez les clés de production (Stripe live, Supabase prod)
- Preview : Utilisez les clés de test (Stripe test, Supabase dev)

### 5. Domaine Personnalisé (optionnel)

1. Allez dans **Settings > Domains**
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions DNS

### 6. Webhooks Stripe

Si vous utilisez Stripe, configurez le webhook :
1. Allez dans **Settings > Git**
2. Notez l'URL du webhook : `https://your-domain.vercel.app/api/stripe/webhook`
3. Configurez ce webhook dans votre dashboard Stripe

### 7. Déploiement

1. Cliquez sur **"Deploy"**
2. Vercel va :
   - Installer les dépendances
   - Builder le projet
   - Déployer sur leur infrastructure
3. Le déploiement prend généralement 2-5 minutes

### 8. Vérification Post-Déploiement

Après le déploiement, vérifiez :
- ✅ Le site charge correctement
- ✅ L'authentification fonctionne
- ✅ Les images s'affichent (Supabase Storage)
- ✅ Les API routes fonctionnent
- ✅ Les webhooks Stripe sont configurés

## 🔧 Configuration Avancée

### Runtime Node.js pour Sharp

Le projet utilise `sharp` pour l'optimisation d'images. Vercel détecte automatiquement Next.js, mais assurez-vous que :
- Le runtime est bien **Node.js** (pas Edge)
- Les API routes qui utilisent Sharp ont `export const runtime = 'nodejs'`

### Build Optimizations

Vercel optimise automatiquement :
- ✅ Image optimization (Next.js Image)
- ✅ Code splitting
- ✅ Static generation
- ✅ Edge functions (si configuré)

## 📝 Notes Importantes

1. **Variables Sensibles** : Ne jamais commiter les variables d'environnement dans Git
2. **Service Role Key** : Gardez `SUPABASE_SERVICE_ROLE_KEY` secret (ne jamais exposer au client)
3. **Stripe Keys** : Utilisez les clés de test pour Preview, production pour Production
4. **Build Time** : Le premier build peut prendre plus de temps (cache des dépendances)

## 🐛 Dépannage

### Build échoue
- Vérifiez les logs de build dans Vercel
- Assurez-vous que toutes les variables d'environnement sont définies
- Vérifiez que `package.json` a les bonnes dépendances

### Erreurs Runtime
- Vérifiez les logs de fonction dans Vercel
- Assurez-vous que les variables d'environnement sont bien définies pour l'environnement concerné

### Images ne se chargent pas
- Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` est correct
- Vérifiez les CORS dans Supabase Storage
- Vérifiez que le bucket `coaches` existe et est public

## 🔗 Liens Utiles

- [Documentation Vercel](https://vercel.com/docs)
- [Next.js sur Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Variables d'environnement Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

