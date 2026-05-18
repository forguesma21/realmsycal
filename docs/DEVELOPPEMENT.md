# Guide développeur

Ce dépôt contient l’application web **Places** (`web/`), une API **Express + MongoDB** (`server/`), et optionnellement le squelette **React Native** à la racine.

## Application web + API (coordonnées Minecraft)

Client **Vite + React** et API pour enregistrer des coordonnées X/Y/Z par realm, avec comptes utilisateur (email + mot de passe) et données isolées par compte. L’interface actuelle charge les lieux depuis `web/public/coords.json` ; l’API est prête pour une intégration complète côté client.

### Prérequis

- [Node.js](https://nodejs.org/) ≥ 22.11
- [MongoDB](https://www.mongodb.com/) en local ou cluster [Atlas](https://www.mongodb.com/atlas)

### Démarrage en local

1. Copier `server/.env.example` vers `server/.env` et renseigner `MONGODB_URI`, `JWT_SECRET`, et éventuellement `CORS_ORIGIN` (URL du front en production).
2. Terminal 1 — API : `npm run coords:server` (port **3001**).
3. Terminal 2 — front : `npm run coords:web` → [http://localhost:5173](http://localhost:5173).

Le serveur de dev Vite proxyfie `/api` vers le backend.

### Production

- Build du front : `cd web && npm run build`, puis servir `web/dist` en HTTPS.
- Définir `CORS_ORIGIN` sur l’origine du site déployé.

### Structure

| Dossier | Rôle |
|---------|------|
| `web/` | Interface React (liste, carte Leaflet, `coords.json`) |
| `server/` | Auth JWT, CRUD realms et pins |
| `web/public/coords.json` | Données statiques pour le mode fichier JSON |

### Format `coords.json`

Voir le [README](../README.md#formats-supportés) pour le schéma JSON et les types de lieux.

---

## React Native (racine du dépôt)

Projet initialisé avec [`@react-native-community/cli`](https://github.com/react-native-community/cli). Voir [REACT-NATIVE.md](./REACT-NATIVE.md) pour lancer Metro et builder sur Android ou iOS.
