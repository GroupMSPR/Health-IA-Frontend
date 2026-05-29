# 🎨 Health-IA-Frontend - Interface Web HealthAI Coach

**Frontend Web** de la plateforme HealthAI Coach, construit avec **React 19**, **TypeScript** et **Vite**. Cette application permet aux utilisateurs d'interagir avec la plateforme, de visualiser leurs tableaux de bord et de suivre leurs métriques de santé.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

![Type](https://img.shields.io/badge/Type-SPA_Web-purple)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Stack technologique](#stack-technologique)
- [Installation](#installation)
- [Scripts disponibles](#scripts-disponibles)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Documentation supplémentaire](#documentation-supplémentaire)

---

## Vue d'ensemble

**Health-IA-Frontend** est l'interface utilisateur centrale de la plateforme HealthAI Coach. Elle offre une expérience fluide, moderne et réactive pour :

- ✅ Naviguer dans l'application via une Single Page Application (SPA)
- ✅ Visualiser les données et statistiques de santé (intégration de Recharts)
- ✅ Interagir avec l'API Backend REST
- ✅ Fournir une expérience utilisateur optimisée grâce à un stylisme sur-mesure (Tailwind CSS)

**Point d'entrée recommandé** :  
Le repository [Health-IA-Workspace](https://github.com/GroupMSPR/Health-IA-Workspace) qui orchestre l'ensemble du projet.

---

## Architecture

### Structure du projet

```bash
Health-IA-Frontend/
├── public/                 # Fichiers statiques (favicon, ressources SVG)
├── src/                    # Code source principal
│   ├── assets/             # Images et logos
│   ├── styles/             # Feuilles de style (Tailwind, CSS global)
│   ├── App.tsx             # Composant racine
│   └── main.tsx            # Point d'entrée de l'application React
├── docker-compose.yml      # Orchestration Docker locale
├── Dockerfile              # Fichier de construction de l'image Docker
├── eslint.config.js        # Configuration du linter
├── index.html              # Template HTML principal
├── package.json            # Dépendances et scripts npm
├── postcss.config.js       # Configuration PostCSS (pour Tailwind)
├── tailwind.config.js      # Configuration de Tailwind CSS
├── tsconfig.*.json         # Configurations TypeScript (app, node)
└── vite.config.ts          # Configuration du bundler Vite
```

---

## Stack technologique

### Frontend

- **Bibliothèque UI** : React 19
- **Langage** : TypeScript
- **Bundler / Dev Server** : Vite 8
- **Styling** : Tailwind CSS 3.4 & PostCSS
- **Graphiques & DataViz** : Recharts 3.8
- **Icônes** : Lucide React

### Outils de qualité

- **Linter** : ESLint 10
  - Typage strict
  - React Hooks
  - React Refresh

### DevOps

- **Containerization** : Docker
- **Orchestration** : Docker Compose

---

## Installation

### Prérequis

- Node.js 20+ (pour le développement local)
- npm
- Docker Desktop (recommandé pour l'environnement isolé)

---

### Déploiement avec Docker (Recommandé)

Le projet est préconfiguré pour tourner dans un conteneur.  
Le port interne `5173` de Vite est exposé sur le port `5000` de votre machine hôte.

```bash
# 1. Cloner depuis le workspace (recommandé)
# ou directement le repository

git clone https://github.com/GroupMSPR/Health-IA-Frontend.git
cd Health-IA-Frontend

# 2. Lancer l'application via Docker Compose

docker compose up -d
```

L'application sera accessible sur :

```txt
http://localhost:5000
```

---

### Installation locale (Sans Docker)

```bash
# 1. Cloner le repository

git clone https://github.com/GroupMSPR/Health-IA-Frontend.git
cd Health-IA-Frontend

# 2. Installer les dépendances

npm install

# 3. Lancer le serveur de développement

npm run dev
```

L'application sera accessible sur :

```txt
http://localhost:5173
```

---

## Scripts disponibles

Dans le répertoire du projet, vous pouvez exécuter les commandes suivantes :

| Commande          | Description |
|------------------|-------------|
| `npm run dev` | Lance le serveur de développement Vite avec Hot Module Replacement (HMR). |
| `npm run build` | Compile le TypeScript et construit l'application optimisée pour la production dans `/dist`. |
| `npm run lint` | Analyse le code avec ESLint pour détecter les erreurs de syntaxe et de typage. |
| `npm run preview` | Démarre un serveur web local pour tester le build de production. |

---

## Configuration

### Configuration Docker

Le fichier `docker-compose.yml` configure un service frontend optimisé pour le développement :

- Les fichiers locaux sont montés en tant que volumes (`.:/app`) permettant au Hot Reload de Vite de fonctionner à travers le conteneur.
- La variable d'environnement `NODE_ENV=development` est définie.

### Tailwind CSS

Les styles utilitaires sont générés par Tailwind.  
Vous pouvez modifier le thème, les couleurs et les plugins dans le fichier :

```txt
tailwind.config.js
```

---

## Troubleshooting

### Le Hot Reload ne fonctionne pas avec Docker

#### Problème

Les modifications de code ne se reflètent pas dans le navigateur.

#### Solution

Assurez-vous que la commande de démarrage expose bien le réseau local.

Le fichier Dockerfile inclut déjà le flag :

```bash
CMD ["npm", "run", "dev", "--", "--host"]
```

Ce flag est indispensable avec Vite dans un conteneur.

---

### Erreur de port lors du lancement de Docker

#### Problème

```txt
Bind for 0.0.0.0:5000 failed: port is already allocated
```

#### Solution

Le port `5000` est déjà utilisé par une autre application sur votre machine.

Modifiez le port exposé dans `docker-compose.yml` :

```yaml
ports:
  - "5001:5173"
```

---

## 📚 Documentation supplémentaire

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Recharts Documentation](https://recharts.org/)

---

## 👥 Équipe

Développeurs MSPR :

- Ilan
- Anthony
- Diana

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🔗 Liens

- **Organization** : GroupMSPR
- **Workspace** : Health-IA-Workspace
- **Backend** : Health-IA-Backend
- **ETL** : Health-IA-ETL
- **FastAPI** : Health-IA-FastAPI
- **Grafana** : Health-IA-Grafana

---

Dernière mise à jour : 29 mai 2026

Pour toute question ou contribution, consultez le repository ou ouvrez une issue.
