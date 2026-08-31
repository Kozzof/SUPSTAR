# SUPSTAR - Documentation technique

## 1. Présentation

SUPSTAR est une application web collaborative permettant de découvrir, noter, organiser et partager des lieux et des expériences.

Les principales fonctionnalités sont :

- création et authentification des utilisateurs ;
- authentification locale et Google OAuth2 ;
- création et gestion de lieux ;
- recherche et filtrage ;
- notes et avis ;
- statuts personnels ;
- listes collaboratives ;
- rôles et permissions ;
- commentaires sur les listes ;
- carte OpenStreetMap ;
- géolocalisation ;
- import et export JSON/CSV ;
- gestion de photos par URL ;
- gestion du profil utilisateur.

## 2. Architecture

L'application utilise une architecture séparée en trois parties :

```text
Navigateur
    |
    v
Frontend React
    |
    | API REST / HTTP
    v
API NestJS
    |
    v
PostgreSQL + PostGIS
```

Le frontend ne communique jamais directement avec la base de données.

La logique métier et les contrôles de permissions sont réalisés par l'API.

## 3. Technologies

### Backend

- Node.js
- NestJS
- TypeScript
- TypeORM
- Passport
- JWT
- Argon2
- Swagger / OpenAPI

### Frontend

- React
- TypeScript
- Vite
- React Router
- Leaflet
- React Leaflet
- react-leaflet-cluster
- OpenStreetMap

### Base de données

- PostgreSQL
- PostGIS

### Infrastructure

- Docker
- Docker Compose
- Nginx

## 4. Structure du projet

```text
SUPSTAR/
├── api/
│   ├── src/
│   │   ├── auth/
│   │   ├── data-transfer/
│   │   ├── database/
│   │   ├── lists/
│   │   ├── migrations/
│   │   ├── place-photos/
│   │   ├── place-statuses/
│   │   ├── places/
│   │   ├── reviews/
│   │   └── users/
│   ├── test/
│   └── Dockerfile
│
├── web/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── types/
│   ├── Dockerfile
│   └── nginx.conf
│
├── database/
│   └── init.sql
│
├── docs/
│   ├── documentation-technique.md
│   └── manuel-utilisateur.md
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## 5. Configuration

La configuration est réalisée avec des variables d'environnement.

Un fichier `.env.example` est fourni à la racine.

Variables principales :

```env
DB_HOST=127.0.0.1
POSTGRES_DB=supstar
POSTGRES_USER=supstar
POSTGRES_PASSWORD=change_me
POSTGRES_PORT=5433

JWT_SECRET=change_me
JWT_EXPIRES_IN=3600

GOOGLE_CLIENT_ID=change_me
GOOGLE_CLIENT_SECRET=change_me
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

FRONTEND_URL=http://localhost:5173
```

## 6. Base de données

SUPSTAR utilise PostgreSQL avec l'extension PostGIS.

PostGIS est activé dans :

```text
database/init.sql
```

avec :

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

La structure de la base est créée et mise à jour à l'aide de migrations TypeORM.

Les principales tables concernent :

- utilisateurs ;
- lieux ;
- avis ;
- statuts personnels ;
- listes ;
- membres des listes ;
- lieux des listes ;
- commentaires des listes ;
- photos.

Les identifiants principaux utilisent des UUID.

## 7. Authentification

### Authentification locale

L'utilisateur peut créer un compte avec :

- adresse e-mail ;
- mot de passe ;
- nom affiché.

Les mots de passe sont hachés avec Argon2 avant stockage.

Après authentification, l'API génère un JWT.

Le frontend transmet ce jeton dans l'en-tête :

```text
Authorization: Bearer <token>
```

### Google OAuth2

L'authentification Google repose sur Passport OAuth2.

Le parcours est le suivant :

```text
Frontend
   |
   v
/api/auth/google
   |
   v
Google
   |
   v
/api/auth/google/callback
   |
   v
Frontend /oauth/callback
```

L'API crée ou retrouve l'utilisateur et délivre ensuite un JWT.

## 8. API REST

Toutes les routes utilisent le préfixe :

```text
/api
```

Swagger est disponible sur :

```text
http://localhost:3000/api/docs
```

### Authentification

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/google
GET  /api/auth/google/callback
GET  /api/auth/me
```

### Utilisateur

```text
GET   /api/users/me/settings
PATCH /api/users/me
PATCH /api/users/me/password
```

### Lieux

```text
POST   /api/places
GET    /api/places
GET    /api/places/:id
PATCH  /api/places/:id
DELETE /api/places/:id
```

### Avis

```text
POST   /api/places/:placeId/reviews
GET    /api/places/:placeId/reviews
PATCH  /api/places/:placeId/reviews/:reviewId
DELETE /api/places/:placeId/reviews/:reviewId
```

### Statuts

```text
GET   /api/places/:placeId/status
PATCH /api/places/:placeId/status
```

### Photos

```text
GET    /api/places/:placeId/photos
POST   /api/places/:placeId/photos
DELETE /api/places/:placeId/photos/:photoId
```

### Listes

```text
POST   /api/lists
GET    /api/lists
GET    /api/lists/:listId
PATCH  /api/lists/:listId
DELETE /api/lists/:listId
```

### Membres d'une liste

```text
POST   /api/lists/:listId/members
PATCH  /api/lists/:listId/members/:memberId
DELETE /api/lists/:listId/members/:memberId
```

### Lieux d'une liste

```text
GET    /api/lists/:listId/places
POST   /api/lists/:listId/places
DELETE /api/lists/:listId/places/:placeId
```

### Commentaires d'une liste

```text
GET    /api/lists/:listId/comments
POST   /api/lists/:listId/comments
DELETE /api/lists/:listId/comments/:commentId
```

### Import / export

```text
GET  /api/data/export/places
POST /api/data/import/places
```

## 9. Gestion des lieux

Un lieu contient notamment :

- nom ;
- adresse ;
- ville ;
- pays ;
- catégorie ;
- description ;
- horaires éventuels ;
- niveau de prix ;
- tags ;
- note moyenne ;
- nombre d'avis ;
- latitude et longitude.

Les coordonnées sont stockées avec PostGIS.

Un contrôle empêche la création répétée d'un même lieu selon son nom, son adresse, sa ville et son pays.

## 10. Recherche et filtres

La recherche des lieux peut utiliser :

- texte ;
- catégorie ;
- ville ;
- note minimale ;
- prix ;
- tags ;
- statut personnel ;
- coordonnées ;
- rayon géographique.

La pagination est réalisée côté API.

Pour les recherches géographiques, PostGIS permet de calculer la distance entre les lieux et une position donnée.

## 11. Carte OpenStreetMap

La carte repose sur Leaflet et OpenStreetMap.

Elle permet :

- d'afficher les lieux ;
- de regrouper les marqueurs ;
- de charger les lieux selon la zone visible ;
- de filtrer les résultats ;
- d'utiliser la géolocalisation du navigateur ;
- de sélectionner un point de départ ;
- d'afficher une popup par lieu ;
- d'ouvrir un itinéraire.

Les marqueurs sont chargés progressivement selon la zone consultée afin d'éviter de charger tous les lieux en permanence.

## 12. Avis

Un utilisateur peut laisser une note de 1 à 5 accompagnée d'un commentaire.

Un utilisateur ne possède qu'un avis par lieu.

Lors de la création, modification ou suppression d'un avis, le backend recalcule :

- la note moyenne ;
- le nombre total d'avis.

## 13. Statuts personnels

Chaque utilisateur peut marquer un lieu comme :

- visité ;
- à visiter ;
- favori.

Les statuts `visité` et `à visiter` sont exclusifs.

Le statut `favori` est indépendant.

## 14. Listes collaboratives

Les listes permettent de partager des lieux entre plusieurs utilisateurs.

Quatre rôles existent.

### Creator

Le créateur peut :

- consulter la liste ;
- la modifier ;
- la supprimer ;
- gérer les lieux ;
- gérer les membres ;
- modifier leurs rôles ;
- publier et modérer les commentaires.

### Editor

L'éditeur peut :

- consulter la liste ;
- modifier la liste ;
- ajouter ou retirer des lieux ;
- commenter.

### Commenter

Le commentateur peut :

- consulter la liste ;
- consulter ses lieux ;
- publier des commentaires.

### Reader

Le lecteur dispose uniquement des droits de lecture.

Toutes les permissions importantes sont vérifiées par l'API.

## 15. Import et export

Les lieux peuvent être exportés au format :

- JSON ;
- CSV.

L'import accepte également ces deux formats.

Chaque donnée importée est validée avant d'être enregistrée.

L'API retourne :

- le nombre d'éléments importés ;
- le nombre d'échecs ;
- la liste des erreurs éventuelles.

## 16. Sécurité

Les principales mesures utilisées sont :

- Argon2 pour les mots de passe ;
- JWT pour l'authentification ;
- OAuth2 pour Google ;
- ValidationPipe NestJS ;
- DTO validés avec class-validator ;
- contrôle des permissions côté serveur ;
- variables sensibles stockées dans l'environnement ;
- accès à la base via TypeORM ;
- routes protégées par les guards Passport/JWT.

## 17. Docker

Trois services sont définis :

```text
supstar-database
supstar-api
supstar-web
```

La base utilise l'image PostgreSQL/PostGIS.

L'API est construite depuis le Dockerfile NestJS.

Le frontend est compilé avec Vite puis servi par Nginx.

Lancement :

```bash
docker compose up --build
```

Arrêt :

```bash
docker compose down
```

Ports :

```text
Frontend : 5173
API      : 3000
Database : 5433
```

Dans le réseau Docker, l'API contacte PostgreSQL sur :

```text
database:5432
```

Le service API attend que la base soit déclarée saine avant de démarrer.

## 18. Tests

Les tests backend utilisent Jest et Supertest.

Tests unitaires :

```bash
cd api
npm test -- --runInBand
```

Tests E2E :

```bash
npm run test:e2e -- --runInBand
```

Ils vérifient notamment :

- le health check ;
- le refus d'une route protégée sans JWT ;
- l'inscription ;
- la connexion ;
- l'accès au compte avec JWT.

Le frontend est validé par :

```bash
cd web
npm run build
```

## 19. Documentation de l'API

Swagger génère une documentation interactive accessible sur :

```text
http://localhost:3000/api/docs
```

Elle permet de consulter les routes, DTO et méthodes HTTP de l'application.

## 20. Choix techniques

NestJS a été utilisé pour structurer clairement le backend en modules, contrôleurs et services.

React fournit une interface web basée sur des composants.

PostgreSQL est adapté aux relations entre utilisateurs, lieux, avis et listes.

PostGIS permet de réaliser les opérations géographiques.

JWT assure l'authentification entre un frontend et une API séparés.

Docker Compose permet de lancer l'ensemble de l'architecture avec une seule commande.

OpenStreetMap et Leaflet fournissent les fonctionnalités cartographiques demandées.
