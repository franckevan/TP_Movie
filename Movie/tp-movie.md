# TP Movie — API Films & Séances (Node 24 + TypeScript + PostgreSQL)

Ce TP consiste à construire une mini API HTTP qui expose :
- la liste des films
- les séances d'un film

Le but est pédagogique : comprendre une architecture simple et lisible avec une séparation **Domain / Infrastructure / Server**.

## Prérequis

- Node.js 24
- Docker + Docker Compose (recommandé pour PostgreSQL)
- VS Code (recommandé)

## Contexte technique

Ce TP se base sur :
- `node:http` (serveur HTTP natif)
- `pg` (PostgreSQL)
- TypeScript (mode strict)

Les données viennent d'une base PostgreSQL, initialisée par `TPs/Movie/schema.sql`.

## Exécution (recommandé)

Le plus simple pour exécuter ce TP est d'utiliser l'environnement `Apps/` (dépendances déjà installées, Docker + Postgres déjà câblés).

Deux options :

1) Travailler directement dans `Apps/src/Movie/` en suivant les étapes ci-dessous.
2) Copier ce squelette vers `Apps/src/Movie/` puis exécuter :

```bash
cp -R TPs/Movie/. Apps/src/Movie/
npm -C Apps run movie
```

Type-check (dans un second terminal) :
```bash
npm -C Apps run typecheck
```

## Structure imposée

Vous travaillez dans `TPs/Movie/` avec l'arborescence suivante :

- `Domain/`
  - `Movie.ts`
  - `Screening.ts`
- `Infrastructure/`
  - `DB.ts`
  - `MovieRepository.ts`
  - `ScreeningRepository.ts`
- `Server/`
  - `http.ts` (fourni : `sendJson`, `sendError`)
- `server.ts` (point d'entrée HTTP)
- `schema.sql` (fourni)

Règle : **le serveur HTTP ne doit pas contenir de SQL**. Le SQL doit vivre dans les repositories (Infrastructure).

## Base de données

1) Démarrer PostgreSQL avec Docker (exemple) :

```bash
cd Apps
docker compose up --build -d
```

2) Créer la base de données et les tables + seed :

Depuis la racine du dépôt :
```bash
docker exec -it cart-postgres psql -U postgres -d postgres -c "CREATE DATABASE cineconnect;"

# migration et seeders 
docker exec -i cart-postgres psql -U postgres -d cineconnect < TPs/Movie/schema.sql
```

3) Vérifier rapidement :

```bash
docker exec -it cart-postgres psql -U postgres -d cineconnect
```

Puis :
```sql
\dt
select * from movies;
select * from screenings;
```

##  Domain : définir les types

Dans `Domain/` :

1) `Domain/Movie.ts`
- définir le type `Movie` avec les champs :
  - `id: number`
  - `title: string`
  - `description: string | null`
  - `durationMinutes: number`
  - `rating: string | null`
  - `releaseDate: string | null` (date sous forme `YYYY-MM-DD`)

2) `Domain/Screening.ts`
- définir le type `Screening` avec :
  - `id: number`
  - `movieId: number`
  - `startTime: string` (date-time string)
  - `price: number`
  - `room: { id: number; name: string; capacity: number }`

Objectif : ces types représentent la forme des données **dans l'application**, indépendamment de Postgres.

## Infrastructure : connexion PostgreSQL

Dans `Infrastructure/DB.ts` :
- créer et exporter un `Pool` `pg`
- lire la configuration via variables d'environnement :
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

Rappel : dans `Apps/docker-compose.yml`, ces variables existent déjà côté service `app`.

## Infrastructure : repositories

1) `Infrastructure/MovieRepository.ts`
- créer une classe `MovieRepository`
- ajouter une méthode `list(): Promise<Movie[]>`
- requête SQL attendue : `select ... from movies order by id asc`
- simplification recommandée : caster la date côté SQL :
  - `release_date::text as "releaseDate"`

2) `Infrastructure/ScreeningRepository.ts`
- créer une classe `ScreeningRepository`
- ajouter une méthode `listByMovieId(movieId: number): Promise<Screening[]>`
- requête SQL attendue : `screenings` join `rooms`, filtrée par `movie_id`
- simplification recommandée : caster la date côté SQL :
  - `start_time::text as "startTime"`

Important :
- les requêtes doivent être **paramétrées** (`$1`) pour éviter les injections SQL
- les types “raw” de rows SQL peuvent rester **privés** dans les repositories

## Server : endpoints HTTP

Dans `server.ts` :

1) Créer un serveur avec `createServer`.
2) Ajouter un helper minimal :
   - `const [path] = (req.url ?? "/").split("?", 2)`
   - `const segments = path.split("/").filter(Boolean)`
3) Routes à implémenter :

- `GET /health` → `{ ok: true }`
- `GET /movies` → `{ ok: true, items: Movie[] }`
- `GET /movies/:id/screenings` → `{ ok: true, items: Screening[] }`
- alias FR (option) : `GET /movies/:id/seances` → même réponse

Note : cette approche ignore volontairement les query params pour les routes de base.  
Si un bonus nécessite des query params, vous pourrez parser `req.url` manuellement (ex: `split("&")`) ou introduire `URLSearchParams` plus tard.

Erreurs :
- si `id` est invalide → `400`
- route inconnue → `404`
- erreur serveur → `500` (message générique)

Vous pouvez utiliser `sendJson` et `sendError` depuis `Server/http.ts`.

##  Test manuel (curl)

```bash
curl -s http://localhost:3000/health
curl -s http://localhost:3000/movies
curl -s http://localhost:3000/movies/1/screenings
```

## Livrables

- Le code dans `TPs/Movie/` respecte la structure imposée
- Les endpoints `GET /movies` et `GET /movies/:id/screenings` fonctionnent
- TypeScript passe en `strict` (sans `any`)
