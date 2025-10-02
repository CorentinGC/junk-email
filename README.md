# Junk Mail - Disposable Email Server

Serveur d'emails jetables avec Next.js 15, TypeScript, serveur SMTP local et Redis.

## Features

- ✉️ **Serveur SMTP** intégré (port 25) pour réception d'emails
- 🔄 **Stockage temporaire** avec Redis (TTL configurable via env)
- 💾 **Historique persistant** avec SQLite (adresses créées, compteurs emails)
- 🎨 **Interface moderne** Next.js 15 + TypeScript + SCSS
- 📱 **Mobile-first** design responsive
- 📧 **Adresses permanentes** : création aléatoire ou personnalisée (a-z, 0-9, .-_)
- 🗑️ **Suppression manuelle** : gestion individuelle des adresses via interface
- 📜 **Historique adresses** : sidebar avec adresses récentes
- 🔗 **Liens directs inbox** : accès direct via URL partageable `/inbox/[address]`
- 📎 **Pièces jointes** : téléchargement et affichage inline des images
- 🖼️ **HTML sécurisé** : affichage emails HTML avec sanitization renforcée
- 🔒 **Protection par mot de passe** : authentification cookie HTTP-only
- 🐳 **Docker Compose** pour déploiement simplifié
- 🔒 **Sécurité** : sanitization HTML stricte, validation, protection XSS

## Architecture

```
├── src/
│   ├── app/              # Next.js App Router
│   │   └── api/          # API routes
│   ├── components/       # React components (Atomic Design)
│   ├── lib/              # Business logic
│   │   ├── redis.ts      # Redis client (emails temporaires)
│   │   ├── database.ts   # SQLite (historique persistant)
│   │   └── emailStorage.ts
│   ├── smtp/             # SMTP server
│   ├── styles/           # SCSS global + modules
│   └── types/            # TypeScript types
├── data/                 # SQLite database (auto-créé)
├── Dockerfile            # Next.js app
├── Dockerfile.smtp       # SMTP server
└── docker-compose.yml    # Orchestration
```

### Stockage hybride

- **Redis** : Emails temporaires (TTL via `EMAIL_RETENTION_DAYS`), adresses actives
- **SQLite** : 
  - Historique des adresses créées (permanentes)
  - Compteurs emails reçus, statistiques
  - Adresses supprimables manuellement via interface

## Prérequis

- **Node.js** 22+
- **Redis** (ou Docker)
- **Port 25** disponible (SMTP)
- **Domaine** configuré avec MX record sur Cloudflare

## Installation (Développement)

```bash
# 1. Installer dépendances
npm install

# 2. Configurer environnement
cp .env.example .env
# Éditer .env avec votre domaine

# 3. Lancer Redis (ou via Docker)
docker run -d -p 6379:6379 redis:7-alpine

# 4. Lancer serveur SMTP (terminal 1)
npm run smtp:dev

# 5. Lancer app Next.js (terminal 2)
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Déploiement (Docker Compose)

```bash
# 1. Créer fichier de configuration
cp env.prod.example .env.prod

# 2. Éditer .env.prod avec vos valeurs
nano .env.prod
# Modifier au minimum : SMTP_DOMAIN, APP_PASSWORD

# 3. Build et lancer
docker-compose up -d

# 4. Vérifier logs
docker-compose logs -f

# 5. Arrêter
docker-compose down
```

### Variables d'environnement

Fichier `.env.prod` (production Docker) ou `.env` (développement) :

| Variable | Défaut | Description |
|----------|--------|-------------|
| `NODE_ENV` | production | Environment (production/development) |
| `WEB_PORT` | 3000 | Port externe Next.js |
| `APP_PASSWORD` | - | Mot de passe de protection (requis) |
| `EMAIL_RETENTION_DAYS` | 365 | Durée de rétention des emails (jours) |
| `SMTP_PORT` | 25 | Port SMTP |
| `SMTP_HOST` | 0.0.0.0 | Bind SMTP |
| `SMTP_DOMAIN` | localhost | Domaine mail |
| `REDIS_HOST` | redis | Hôte Redis (nom service Docker) |
| `REDIS_PORT` | 6379 | Port Redis |
| `DB_PATH` | /app/data | Chemin base SQLite (Docker) |

**Note** : 
- Les **adresses sont permanentes** (plus d'expiration automatique). Vous pouvez supprimer une adresse manuellement via le bouton de suppression dans l'historique.
- La durée de rétention des **emails** est configurable via `EMAIL_RETENTION_DAYS` (défaut: **365 jours**). Les emails expirent automatiquement après ce délai.

### Protection par mot de passe

L'application est protégée par authentification simple avec cookie HTTP-only :

**Configuration requise :**
```bash
# Dans .env.prod
APP_PASSWORD=votre_mot_de_passe_securise
```

**Fonctionnement :**
- Accès à l'app → Redirection automatique vers `/login` (middleware)
- Connexion avec `APP_PASSWORD` → Cookie HTTP-only défini (validité 7 jours)
- Middleware vérifie le cookie sur chaque requête
- Logout via `/api/auth/logout` → Suppression du cookie

**Sécurité :**
- Cookie HTTP-only (non accessible JavaScript, protection XSS)
- Secure en production (HTTPS uniquement)
- SameSite=lax (protection CSRF)
- Expiration automatique après 7 jours
- Validation côté serveur via middleware Next.js

### Création et gestion des adresses

**Page d'accueil simplifiée :**
- Input direct pour créer une adresse personnalisée + bouton "Créer"
- Bouton "Générer une adresse aléatoire" pour création automatique
- Sidebar avec historique des adresses récentes
- Si vous créez une adresse existante, vous êtes **automatiquement redirigé vers son inbox** (pas d'erreur)
- **Accès direct via URL** : Si vous accédez à `/inbox/monAdresse` et que l'adresse n'existe pas, elle est **créée automatiquement**

**Gestion des adresses :**
- Les adresses sont **permanentes** (pas d'expiration automatique)
- Suppression manuelle via bouton 🗑️ dans l'historique
- Une adresse supprimée peut être recréée par la suite
- Les emails sont conservés selon `EMAIL_RETENTION_DAYS` (défaut: 365 jours)

**Gestion des emails :**
- **Suppression individuelle** : Bouton 🗑️ sur chaque email dans la liste
- **Vider l'inbox** : Bouton pour supprimer tous les emails d'une inbox (conserve l'adresse)
- Confirmations avant suppression pour éviter les erreurs

### API Routes

**Adresses :**
- `POST /api/address` — Créer une adresse (personnalisée ou aléatoire)
- `GET /api/addresses` — Liste des adresses créées avec pagination
- `DELETE /api/address/[address]` — Supprimer une adresse et tous ses emails

**Inbox & Emails :**
- `GET /api/inbox/[address]` — Récupérer une inbox et ses emails (auto-création si inexistante)
- `DELETE /api/inbox/[address]` — Vider tous les emails d'une inbox (conserve l'adresse)
- `GET /api/email/[id]` — Récupérer un email spécifique
- `DELETE /api/email/[id]` — Supprimer un email spécifique

**Authentification :**
- `POST /api/auth/login` — Connexion (cookie HTTP-only)
- `POST /api/auth/logout` — Déconnexion

## Configuration DNS Cloudflare

### 1. Enregistrements DNS requis

Connectez-vous à Cloudflare et accédez à la zone DNS de votre domaine.

**Option A : Domaine principal (ex: `exemple.com`)**

| Type | Nom | Contenu/Valeur | Priorité | Proxy | TTL |
|------|-----|----------------|----------|-------|-----|
| **A** | `mail` | `VOTRE_IP_SERVEUR` | - | ⚠️ **OFF** (nuage gris) | Auto |
| **MX** | `@` | `mail.exemple.com` | `10` | - | Auto |

**Option B : Sous-domaine dédié (ex: `mail.exemple.com`)**

| Type | Nom | Contenu/Valeur | Priorité | Proxy | TTL |
|------|-----|----------------|----------|-------|-----|
| **A** | `mail` | `VOTRE_IP_SERVEUR` | - | ⚠️ **OFF** (nuage gris) | Auto |
| **MX** | `mail` | `mail.exemple.com` | `10` | - | Auto |

⚠️ **IMPORTANT** : Le proxy Cloudflare (nuage orange) doit être **désactivé** sur l'enregistrement A, sinon le SMTP ne fonctionnera pas.

### 2. Configuration serveur (firewall)

```bash
# Ouvrir port SMTP (25)
sudo ufw allow 25/tcp

# Ouvrir port web (3000 ou 80/443 si reverse proxy)
sudo ufw allow 3000/tcp

# Vérifier règles
sudo ufw status
```

### 3. Déploiement avec domaine

```bash
# Sur votre serveur
cd /opt/junk-mail  # ou votre chemin

# Configurer domaine
export SMTP_DOMAIN=mail.exemple.com

# Lancer services
docker-compose up -d

# Vérifier que SMTP écoute
docker-compose logs smtp
# Devrait afficher: [SMTP] Server listening on 0.0.0.0:25
```

### 4. Vérification DNS (propagation)

Attendre 5-15 minutes pour propagation DNS, puis tester :

```bash
# Vérifier MX record
dig MX exemple.com +short
# Résultat attendu: 10 mail.exemple.com.

# Vérifier A record
dig A mail.exemple.com +short
# Résultat attendu: VOTRE_IP_SERVEUR

# Test connexion SMTP
telnet mail.exemple.com 25
# Si connecté, taper: QUIT
```

### 5. Test envoi/réception

```bash
# Depuis un autre serveur ou Gmail/Outlook
# Envoyer email à : test@mail.exemple.com

# Vérifier réception (sur le serveur)
curl http://localhost:3000/api/inbox/test@mail.exemple.com

# Ou depuis navigateur
# https://mail.exemple.com (si reverse proxy HTTPS configuré)
```

### 6. Enregistrements optionnels (amélioration délivrabilité)

**SPF (Sender Policy Framework) :**

| Type | Nom | Contenu |
|------|-----|---------|
| **TXT** | `@` | `v=spf1 ip4:VOTRE_IP_SERVEUR -all` |

**Note** : SPF/DKIM utiles si vous implémentez l'**envoi** d'emails plus tard. Ce serveur est actuellement **réception uniquement**.

### Troubleshooting DNS

**MX record pointe vers mauvaise cible :**
```bash
# Vérifier configuration
dig MX exemple.com
# Doit pointer vers mail.exemple.com, pas directement vers IP
```

**Port 25 inaccessible depuis extérieur :**
```bash
# Test depuis machine externe
nc -zv mail.exemple.com 25

# Si bloqué par hébergeur, utiliser port alternatif (587)
# Dans docker-compose.yml et .env: SMTP_PORT=587
```

**Cloudflare proxy activé par erreur :**
- Le proxy (nuage orange) **casse le SMTP** (uniquement HTTP/HTTPS)
- Cliquer sur le nuage pour le rendre **gris**
- Attendre 5 min pour propagation

## Validation des adresses

### Adresses générées aléatoirement
- **Caractères autorisés :** lettres minuscules (a-z) et chiffres (0-9)
- **Longueur :** 10 caractères
- **Exemple :** `abc123xyz0@mail.domain.com`

### Adresses personnalisées (custom)
- **Caractères autorisés :** 
  - Lettres (a-z, A-Z) - case insensitive
  - Chiffres (0-9)
  - Point (.)
  - Tiret (-)
  - Underscore (_)
- **Restrictions :**
  - Ne peut pas commencer ou finir par un point
  - Au moins 1 caractère
- **Exemples valides :**
  - `john.doe`
  - `user_123`
  - `test-email`
- **Exemples invalides :**
  - `.john` (commence par un point)
  - `user.` (finit par un point)
  - `user@domain` (@ non autorisé dans partie locale)
  - `user space` (espaces non autorisés)

## Routes & API

### Page `/inbox/[username]`
Accès direct à une inbox spécifique via URL simplifiée (username uniquement).

**Exemples :**
- `https://mail.votredomaine.com/inbox/test123`
- `https://mail.votredomaine.com/inbox/abc-xyz`
- Permet de partager un lien direct vers une inbox
- Bouton "Share Link" disponible dans l'interface pour copier l'URL
- Le domaine (@mail.votredomaine.com) est automatiquement ajouté côté serveur

### `POST /api/address`
Génère une nouvelle adresse email (permanente)

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "abc123@mail.votredomaine.com",
    "createdAt": 1234567890,
    "expiresAt": 0
  }
}
```
Note: `expiresAt: 0` signifie adresse permanente.

### `GET /api/inbox/[address]`
Récupère emails pour une adresse

**Response:**
```json
{
  "success": true,
  "data": {
    "inbox": { ... },
    "emails": [...]
  }
}
```

### `GET /api/email/[id]`
Récupère un email par ID

### `DELETE /api/email/[id]`
Supprime un email

### `GET /api/email/[id]/attachment/[filename]`
Télécharge une pièce jointe

**Exemple:**
- `/api/email/abc123xyz/attachment/document.pdf`
- `/api/email/abc123xyz/attachment/image.png`

**Headers:**
- `Content-Type`: Type MIME de la pièce jointe
- `Content-Disposition`: `attachment; filename="..."`
- `Content-Length`: Taille du fichier
- `Cache-Control`: `private, max-age=3600`

### `GET /api/addresses`
Récupère l'historique des adresses créées

**Query params:**
- `limit` (default: 50) : Nombre d'adresses
- `offset` (default: 0) : Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "id": 1,
        "address": "abc123@mail.exemple.com",
        "created_at": 1234567890,
        "email_count": 5,
        "last_email_at": 1234570000
      }
    ],
    "stats": {
      "total_addresses": 150,
      "total_emails": 423
    }
  }
}
```

### `GET /api/stats`
Récupère statistiques globales

**Response:**
```json
{
  "success": true,
  "data": {
    "total_addresses": 150,
    "total_emails": 423,
    "active_addresses": 12
  }
}
```


## Scripts

- `npm run dev` : Lancer Next.js en dev
- `npm run build` : Build production
- `npm run start` : Lancer Next.js production
- `npm run smtp` : Lancer serveur SMTP
- `npm run smtp:dev` : SMTP avec hot-reload
- `npm run lint` : ESLint

## Sécurité (DICP)

- **Disponibilité** : Redis persistence, healthchecks Docker, volumes persistants SQLite
- **Intégrité** : Validation email, sanitization HTML, transactions SQLite
- **Confidentialité** : TTL auto, pas de logs sensibles, base locale
- **Preuve** : Timestamps, logs structurés, historique persistant

## Stockage & Données

### Base SQLite (persistante)

Fichier : `./data/addresses.db` (ou `DB_PATH`)

**Table `addresses` :**
- `id` : Primary key auto-increment
- `address` : Email address (unique)
- `created_at` : Timestamp création
- `email_count` : Nombre emails reçus
- `last_email_at` : Dernier email reçu

Note: Les adresses sont maintenant permanentes (plus de colonne `expires_at`).

**Backup :**
```bash
# Copier base de données
cp ./data/addresses.db ./backup-$(date +%Y%m%d).db

# Avec Docker
docker cp junk-mail-web-1:/app/data/addresses.db ./backup.db
```

**Suppression manuelle d'une adresse :**
```bash
# Via l'interface web : bouton supprimer dans l'historique

# Ou via API
curl -X DELETE http://localhost:3000/api/address/test@mail.votredomaine.com

# Ou directement en base
sqlite3 ./data/addresses.db "DELETE FROM addresses WHERE address = 'test@mail.votredomaine.com';"
```

## Fonctionnalités UI

### 1. Création d'adresse

**Mode aléatoire :**
- Génère automatiquement une adresse unique
- Format : `abc123xyz@mail.votredomaine.com`

**Mode personnalisé :**
- Saisir votre propre username
- Validation : caractères autorisés `a-z 0-9 . _ -`
- Détection automatique si adresse déjà existante

### 2. Historique des adresses

- Affichage des 10 dernières adresses créées (permanentes)
- Compteur d'emails reçus par adresse
- Bouton de suppression pour chaque adresse (🗑️)
- Clic sur adresse pour charger l'inbox
- Adresse supprimée peut être recréée ultérieurement

### 3. Vue détail email

- **Affichage HTML** : rendu sécurisé des emails HTML avec styles
- **Pièces jointes** : 
  - Liste interactive avec icônes (📎 fichiers, 🖼️ images)
  - Taille affichée (B, KB, MB)
  - Téléchargement au clic
  - **Images** : affichage automatique en grille responsive en bas de l'email
  - Lazy loading pour performance
- **Sanitization HTML** :
  - Tags autorisés : texte, formatage, images, styles inline
  - Protection XSS : scripts, iframes, objets bloqués
  - Styles CSS filtrés (colors, sizing, spacing uniquement)
  - Links sécurisés

## Tests

```bash
# Envoyer email test (depuis un autre serveur avec sendmail ou similaire)
echo "Test email body" | mail -s "Test Subject" test@mail.votredomaine.com

# Vérifier réception
curl http://localhost:3000/api/inbox/test@mail.votredomaine.com
```

## Troubleshooting

**Port 25 déjà utilisé:**
```bash
# Linux: vérifier processus
sudo lsof -i :25
# Changer port dans .env (SMTP_PORT=2525)
```

**Redis connexion error:**
```bash
# Vérifier Redis
redis-cli ping
# Doit retourner: PONG
```

**Emails non reçus:**
1. Vérifier MX record DNS propagé : `dig MX votredomaine.com`
2. Vérifier port 25 ouvert : `telnet votredomaine.com 25`
3. Vérifier logs SMTP : `docker-compose logs smtp`

## Licence

MIT

## Auteur

Eden Solutions <contact@eden-solutions.pro>


