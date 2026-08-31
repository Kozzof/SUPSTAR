# SUPSTAR

SUPSTAR est une application web collaborative permettant de découvrir, noter, organiser et partager des lieux et des expériences.

Le projet repose sur une architecture composée d'un frontend React, d'une API NestJS et d'une base PostgreSQL/PostGIS.

## Fonctionnalités

- authentification locale ;
- authentification Google OAuth2 ;
- gestion des lieux ;
- notes et avis ;
- statuts visité / à visiter / favori ;
- recherche et filtres ;
- carte OpenStreetMap ;
- géolocalisation ;
- listes collaboratives ;
- rôles creator / editor / commenter / reader ;
- commentaires de listes ;
- photos par URL ;
- import JSON/CSV ;
- export JSON/CSV ;
- profil et préférences utilisateur ;
- Swagger ;
- Docker Compose.

## Technologies

### Backend

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- PostGIS
- Passport
- JWT
- Argon2
- Swagger

### Frontend

- React
- TypeScript
- Vite
- React Router
- Leaflet
- React Leaflet
- OpenStreetMap

### Infrastructure

- Docker
- Docker Compose
- Nginx

## Configuration

Créer un fichier `.env` à la racine à partir de `.env.example`.

Exemple :

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

Ne jamais versionner le véritable fichier `.env`.

## Lancement avec Docker

Depuis la racine :

```bash
docker compose up --build
```

Puis ouvrir :

```text
Application :
http://localhost:5173

API :
http://localhost:3000/api

Swagger :
http://localhost:3000/api/docs

Health check :
http://localhost:3000/api/health
```

Pour arrêter l'application :

```bash
docker compose down
```

## Lancement en développement

### Base de données

Depuis la racine :

```bash
docker compose up -d database
```

### API

```bash
cd api
npm install
npm run start:dev
```

### Frontend

Dans un autre terminal :

```bash
cd web
npm install
npm run dev
```

## Migrations

Depuis le dossier `api` :

```bash
npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts
```

## Tests

Tests unitaires :

```bash
cd api
npm test -- --runInBand
```

Tests E2E :

```bash
npm run test:e2e -- --runInBand
```

Build API :

```bash
npm run build
```

Build frontend :

```bash
cd ../web
npm run build
```

## Documentation

Documentation technique :

```text
docs/documentation-technique.md
```

Manuel utilisateur :

```text
docs/manuel-utilisateur.md
```

La documentation interactive de l'API est disponible avec Swagger :

```text
http://localhost:3000/api/docs
```
