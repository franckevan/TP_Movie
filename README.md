# TP_Movie
Construire une mini-API HTTP en Node.js + TypeScript + PostgreSQL qui expose :  La liste des films (/movies)  Les séances d’un film (/movies/:id/screenings)  Avec une architecture simple et propre : séparation Domain / Infrastructure / Router, SQL uniquement dans les repositories, et Zod pour valider les frontiers runtime.






## ⚡ Problèmes rencontrés et corrigés

### 1️⃣ Ports occupés et démarrage du serveur

**Problème :**

Error: listen EADDRINUSE: address already in use :::3001

- Cause : un autre serveur tournait sur le port 3001.

**Solution :**
- Changer le port dans `server.ts :
``ts
const PORT = 3003; Exemple


2️  Correspondance colonnes DB → TypeScript

Problème :

Un littéral d'objet peut uniquement spécifier des propriétés connues,
mais 'duration_minutes' n'existe pas dans le type '{ durationMinutes: number; ... }'.

Cause : La DB utilise snake_case (duration_minutes, release_date) alors que le code TypeScript utilise camelCase (durationMinutes, releaseDate).

Solution :

Mapper correctement les colonnes dans MovieRepository via mapRowToMovie et lors des insert / update :

durationMinutes: data.durationMinutes, // map vers duration_minutes en DB
releaseDate: data.releaseDate ? new Date(data.releaseDate) : null // map vers release_date
3️ Gestion des dates

Problème : Les dates dans la DB s'affichaient toujours null dans les réponses JSON.

Solution :

Vérifier que la colonne DB est un Date et transformer en string ISO (YYYY-MM-DD) dans mapRowToMovie :

let releaseDate: string | null = null;
if (row.releaseDate instanceof Date && !isNaN(row.releaseDate.getTime())) {
  releaseDate = row.releaseDate.toISOString().split("T")[0];
}

4
  Test des endpoints

Endpoints principaux :

Méthode	Route	Description
GET	/health	Vérifie que le serveur est en ligne
GET	/movies	Liste tous les films
GET	/movies/:id	Récupère un film par ID
POST	/movies	Crée un film
PUT	/movies/:id	Remplace un film existant
PATCH	/movies/:id	Met à jour partiellement un film
DELETE	/movies/:id	Supprime un film
GET	/movies/:id/screenings	Liste les séances d’un film
🛠️ Installation et exécution

Cloner le projet

git clone <repo-url>
cd Movie

Installer les dépendances

npm install

Variables d'environnement (.env)

DB_HOST=localhost
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=db

Lancer PostgreSQL via Docker

docker run -d --name db-postgres -p 5434:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=db postgres:17-alpine

Démarrer le serveur

npm run dev

Serveur accessible sur http://localhost:3003/.

✅ Vérifications

Tester l’état du serveur :

curl http://localhost:3003/health

Tester la récupération des films :

curl http://localhost:3003/movies

Tester la création d’un film :

curl -X POST http://localhost:3003/movies -H "Content-Type: application/json" -d '{"title":"Nouvelle Film","durationMinutes":120}'
 Résultat attendu

Exemple de réponse pour /movies :

[
  {
    "id": 1,
    "title": "Inception",
    "description": "Sci-fi thriller about dreams within dreams.",
    "durationMinutes": 148,
    "rating": "PG-13",
    "releaseDate": "2010-07-16"
  },
  {
    "id": 2,
    "title": "Interstellar",
    "description": "Exploration through space and time.",
    "durationMinutes": 169,
    "rating": "PG-13",
    "releaseDate": "2014-11-07"
  }
]
📌 Remarques

Toutes les erreurs de serveur retournent :

{"ok":false,"error":"Internal Server Error"}

Les erreurs liées aux données (JSON invalid, champs manquants) retournent un code 400 avec un message détaillé.

