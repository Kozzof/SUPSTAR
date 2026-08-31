# SUPSTAR - Manuel utilisateur

## 1. Accéder à SUPSTAR

Après démarrage de l'application, ouvrir :

```text
http://localhost:5173
```

## 2. Créer un compte

Depuis la page d'inscription, renseigner :

- le nom affiché ;
- l'adresse e-mail ;
- le mot de passe.

Valider le formulaire pour créer le compte.

## 3. Se connecter

SUPSTAR propose deux méthodes.

### Connexion locale

Renseigner l'adresse e-mail et le mot de passe puis valider.

### Connexion Google

Sélectionner le bouton de connexion Google.

L'utilisateur est redirigé vers Google puis automatiquement renvoyé vers SUPSTAR après authentification.

## 4. Consulter les lieux

La page `Lieux` affiche les lieux enregistrés.

Sélectionner un lieu pour accéder à sa fiche complète.

## 5. Rechercher des lieux

Les lieux peuvent être filtrés à l'aide de plusieurs critères :

- texte ;
- catégorie ;
- ville ;
- note minimale ;
- prix ;
- statut personnel.

La pagination permet de parcourir les résultats.

## 6. Ajouter un lieu

Utiliser le formulaire de création disponible dans la page des lieux.

Les informations comprennent notamment :

- nom ;
- adresse ;
- ville ;
- pays ;
- catégorie ;
- description ;
- prix ;
- tags ;
- latitude ;
- longitude.

Les coordonnées servent à positionner le lieu sur la carte.

## 7. Consulter une fiche

La fiche d'un lieu affiche :

- ses informations générales ;
- sa note ;
- ses avis ;
- ses photos ;
- son statut personnel.

## 8. Publier un avis

Sur la fiche d'un lieu :

1. choisir une note de 1 à 5 ;
2. saisir un commentaire ;
3. publier l'avis.

L'utilisateur peut ensuite modifier ou supprimer son propre avis.

## 9. Statuts personnels

Un lieu peut être marqué :

- `Visité` ;
- `À visiter` ;
- `Favori`.

Les statuts peuvent ensuite être utilisés comme filtres.

## 10. Photos

La galerie d'un lieu utilise des liens vers des images.

Le créateur du lieu peut ajouter une URL de photo et supprimer les photos qu'il a ajoutées au lieu.

## 11. Carte

La page `Carte` affiche les lieux sur OpenStreetMap.

Les marqueurs proches sont automatiquement regroupés.

Cliquer sur un marqueur affiche une popup contenant des informations sur le lieu.

## 12. Géolocalisation

La carte peut utiliser la position actuelle de l'utilisateur.

Le navigateur demande l'autorisation d'accéder à la position.

Une fois acceptée, la carte peut se centrer sur cette position.

## 13. Point de départ

Le point de départ d'un itinéraire peut être :

- la position actuelle ;
- un emplacement sélectionné sur la carte.

Un lien permet ensuite d'ouvrir un itinéraire vers un lieu.

## 14. Créer une liste

Ouvrir la page `Listes`.

Renseigner :

- le nom ;
- une description éventuelle.

Puis sélectionner `Créer`.

Le créateur reçoit automatiquement le rôle `creator`.

## 15. Ajouter un lieu dans une liste

Ouvrir une liste puis sélectionner le lieu à ajouter.

Les utilisateurs possédant les permissions nécessaires peuvent ajouter ou retirer des lieux.

## 16. Rechercher dans une liste

La zone de recherche d'une liste permet de retrouver les lieux selon leurs informations, notamment :

- nom ;
- ville ;
- catégorie ;
- tags.

## 17. Ajouter un membre

Le créateur peut ajouter un utilisateur déjà inscrit à partir de son adresse e-mail.

Il lui attribue ensuite un rôle :

- éditeur ;
- commentateur ;
- lecteur.

## 18. Rôles

### Creator

Le créateur peut gérer entièrement la liste, ses membres et ses lieux.

### Editor

L'éditeur peut modifier la liste et gérer ses lieux.

### Commenter

Le commentateur peut consulter la liste et publier des commentaires.

### Reader

Le lecteur possède uniquement un accès en lecture.

## 19. Commentaires de liste

Les créateurs, éditeurs et commentateurs disposent d'une zone permettant de publier un commentaire.

Les membres peuvent consulter les messages associés à la liste.

L'auteur peut supprimer son propre commentaire.

Le créateur peut également modérer les commentaires.

## 20. Modifier une liste

Un créateur ou un éditeur peut modifier :

- le nom ;
- la description.

Le créateur peut également supprimer complètement la liste.

## 21. Gérer les membres

Le créateur peut :

- modifier le rôle d'un membre ;
- retirer un membre.

Le rôle du créateur lui-même ne peut pas être modifié depuis cette fonction.

## 22. Importer des données

Ouvrir la page `Données`.

Sélectionner un fichier :

- JSON ;
- CSV.

Lancer l'import.

SUPSTAR affiche ensuite le nombre de données importées et les éventuelles erreurs.

## 23. Exporter des données

Depuis la page `Données`, sélectionner le format :

- JSON ;
- CSV.

Le fichier contenant les lieux est alors récupéré par le navigateur.

## 24. Profil

La page `Profil` permet de modifier :

- le nom affiché ;
- les préférences de voyage.

Les préférences sont enregistrées sous forme JSON.

## 25. Changer son mot de passe

Pour un compte local :

1. renseigner le mot de passe actuel ;
2. saisir le nouveau mot de passe ;
3. valider.

Le serveur contrôle l'ancien mot de passe avant d'enregistrer le nouveau.

## 26. Se déconnecter

Utiliser le bouton de déconnexion présent dans la barre de navigation.

La session locale est alors supprimée.

## 27. Lancer SUPSTAR avec Docker

Prérequis :

- Docker Desktop ;
- Docker Compose.

Depuis la racine du projet :

```bash
docker compose up --build
```

Ouvrir ensuite :

```text
http://localhost:5173
```

## 28. Arrêter SUPSTAR

Depuis la racine :

```bash
docker compose down
```

## 29. Vérifier les services

La commande :

```bash
docker compose ps
```

doit afficher :

```text
supstar-database
supstar-api
supstar-web
```

Le service de base de données doit être indiqué comme sain.

## 30. API et Swagger

Health check :

```text
http://localhost:3000/api/health
```

Documentation Swagger :

```text
http://localhost:3000/api/docs
```
