# ToolShare API

ToolShare est une API REST de gestion de magasins d’outillage, de matériel,
de réservations et d’emprunts. Le backend utilise Node.js, Express, MongoDB
et Mongoose.

> **État du projet :** l’API expose actuellement l’authentification, la
> gestion des magasins, les réservations et les opérations d’emprunt pour les
> gestionnaires. La gestion complète des comptes et du matériel ainsi que
> l’installation initiale restent à finaliser.

## Prérequis

- Node.js 22 ou supérieur et npm, pour un lancement local
- Docker Engine et Docker Compose, pour le lancement conteneurisé

## Configuration et lancement avec Docker

Créer un fichier `.env` à la racine du dépôt. Compose le charge pour le
service API.

```env
PORT=3000
JWT_SECRET=remplacer-par-un-secret-aleatoire-de-32-caracteres-minimum
JWT_EXPIRES_IN=1h
```

Générer le secret localement, par exemple avec `openssl rand -base64 32`.
Ne pas versionner le fichier `.env`.

Lancer l’API et MongoDB :

```bash
docker compose up --build
```

L’API écoute sur <http://localhost:3000>. MongoDB fonctionne en replica set
mono-noeud, nécessaire aux transactions utilisées pour prévenir les
chevauchements de réservations. Les données persistent dans le volume nommé
`toolshare_data`.

Arrêter les conteneurs sans supprimer les données :

```bash
docker compose down
```

Supprimer également les données MongoDB :

```bash
docker compose down --volumes
```

Cette dernière commande est destructive.

## Lancement local

Le serveur MongoDB local doit être configuré comme replica set `rs0`. Installer
les dépendances puis créer `.env` :

```bash
npm ci
```

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/toolshare?replicaSet=rs0
JWT_SECRET=remplacer-par-un-secret-aleatoire-de-32-caracteres-minimum
JWT_EXPIRES_IN=1h
```

Lancer le serveur :

```bash
node src/server.js
```

Le serveur se connecte à MongoDB avant d’écouter les requêtes. `JWT_SECRET`
doit contenir au moins 32 caractères. `JWT_EXPIRES_IN` est optionnel et vaut
`1h` par défaut.

## Documentation de l’API

Swagger UI est disponible à <http://localhost:3000/api-docs>. La spécification
OpenAPI est générée depuis les annotations de [src/docs/](./src/docs/).
Les routes protégées exigent l’en-tête :

```http
Authorization: Bearer <token>
```

Exemple de connexion :

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"utilisateur@example.com","motDePasse":"mot-de-passe"}'
```

### Endpoints actuellement montés

| Méthode | Route | Accès | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Vérifier que l’API répond. |
| `POST` | `/api/auth/login` | Public | Ouvrir une session avec un compte existant. |
| `GET` | `/api/auth/me` | Authentifié | Consulter son profil. |
| `PATCH` | `/api/auth/me` | Authentifié | Modifier son nom ou son email. |
| `PATCH` | `/api/auth/change-password` | Authentifié | Modifier son mot de passe. |
| `GET` | `/api/magasins` | Authentifié | Lister les magasins visibles selon le rôle. |
| `GET` | `/api/magasins/:id` | Authentifié | Consulter un magasin autorisé. |
| `POST` | `/api/magasins` | Admin | Créer un magasin. |
| `PATCH` | `/api/magasins/:id` | Admin | Modifier le nom ou l’adresse. |
| `PATCH` | `/api/magasins/:id/desactiver` | Admin | Désactiver sans supprimer l’historique. |
| `GET` | `/api/reservations/disponibilite` | Authentifié | Vérifier un créneau pour un matériel et un magasin. |
| `POST` | `/api/reservations` | Utilisateur | Créer une réservation confirmée. |
| `GET` | `/api/reservations` | Authentifié | Lister les réservations de son périmètre. |
| `GET` | `/api/reservations/:id` | Authentifié | Consulter une réservation de son périmètre. |
| `PATCH` | `/api/reservations/:id/annuler` | Utilisateur | Annuler sa réservation confirmée avant son début. |
| `POST` | `/api/emprunts/:reservationId/sortie` | Gestionnaire | Enregistrer la sortie d’un matériel réservé. |
| `POST` | `/api/emprunts/:empruntId/retour` | Gestionnaire | Enregistrer le retour et l’état du matériel. |
| `GET` | `/api/emprunts/retards` | Gestionnaire | Lister les emprunts en retard de son magasin. |
| `GET` | `/api/emprunts/mouvements` | Gestionnaire | Consulter les mouvements de son magasin. |

Il n’y a pas d’inscription publique. Les opérations de création de comptes
réservées à l’Admin et au Gestionnaire restent à implémenter.

## Règles de réservation

La création attend `magasin`, `materiel`, `dateDebut` au format ISO 8601 et
`dureeHeures` strictement positive. Le magasin doit être actif; le matériel
doit y être rattaché, actif et disponible. `dateFin` est calculée par l’API.

Les réservations `CONFIRMEE` et `EN_COURS` occupent un créneau. Les intervalles
sont semi-ouverts : une réservation peut débuter exactement à la fin de la
précédente. La création utilise une transaction MongoDB et un verrou d’écriture
sur le document du matériel pour éviter que deux requêtes simultanées
n’acceptent des créneaux qui se chevauchent.

- L’Admin peut lister et consulter toutes les réservations.
- Le Gestionnaire est limité aux réservations des matériels de son magasin.
- L’Utilisateur ne voit et n’annule que ses propres réservations.
- L’annulation conserve la réservation avec le statut `ANNULEE`, libérant ainsi
  le créneau.

## Modèles de données

Les modèles Mongoose et leurs références sont dans `src/models/` :

| Modèle | Données principales |
|---|---|
| `Utilisateur` | Nom, email, mot de passe haché, rôle, état actif, magasin facultatif. |
| `Magasin` | Nom, adresse et état actif. |
| `Materiel` | Référence unique, nom, description, magasin, disponibilité, état actif. |
| `Reservation` | Utilisateur, matériel, dates, durée et statut. |
| `Emprunt` | Réservation unique, dates réelles de sortie et de retour, état au retour. |
| `Mouvement` | Type, date, description, matériel et utilisateur facultatif. |
| `Installation` | État persistant de l’installation et administrateur initial; le parcours d’installation n’est pas encore monté dans l’application. |

Les diagrammes PlantUML sont dans [UML/](./UML/).

## Tests

Lancer les tests automatisés :

```bash
npm test -- --runInBand
```

Les tests existants couvrent notamment l’authentification, les magasins, la
validation des réservations, leur périmètre d’accès, leur annulation et le
verrou utilisé pendant la création.

## Arborescence principale

```text
src/
  app.js              Montage de l’application et des routes
  server.js           Configuration et démarrage
  config/             Connexion MongoDB, JWT et Swagger
  controllers/        Adaptation requêtes/réponses HTTP
  docs/               Annotations OpenAPI
  middlewares/        Authentification, validation, erreurs
  models/             Schémas Mongoose
  repositories/       Accès aux données
  routes/             Routes Express
  services/           Règles métier
UML/                  Diagrammes PlantUML et ressources UML
```
