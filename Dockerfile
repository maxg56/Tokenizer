# =============================================================================
# Tokenizer42 - Dockerfile
# =============================================================================
# Multi-stage build pour un environnement de développement et de déploiement
# =============================================================================

# Étape 1: Image de base avec Node.js
FROM node:20-alpine AS base

# Installation des outils système nécessaires
RUN apk add --no-cache git python3 make g++

# Installation de pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# =============================================================================
# Étape 2: Installation des dépendances
# =============================================================================
FROM base AS deps

# Copier les fichiers de dépendances
COPY code/package.json code/pnpm-lock.yaml* ./code/

# Installer les dépendances
WORKDIR /app/code
RUN pnpm install --frozen-lockfile

# =============================================================================
# Étape 3: Build des contrats
# =============================================================================
FROM deps AS builder

# Copier le code source
COPY code/ ./

# Compiler les smart contracts
RUN pnpm run compile

# =============================================================================
# Étape 4: Image de développement
# =============================================================================
FROM base AS development

WORKDIR /app

# Copier node_modules et le code source
COPY --from=deps /app/code/node_modules ./code/node_modules
COPY code/ ./code/

# Variables d'environnement
ENV NODE_ENV=development
ENV REPORT_GAS=true

# Port pour le noeud Hardhat
EXPOSE 8545

# Commande par défaut: démarrer le noeud Hardhat
CMD ["sh", "-c", "cd code && pnpm run node"]

# =============================================================================
# Étape 5: Image de test
# =============================================================================
FROM builder AS test

WORKDIR /app/code

# Commande pour lancer les tests
CMD ["pnpm", "test"]

# =============================================================================
# Étape 6: Image de production (pour les scripts de déploiement)
# =============================================================================
FROM builder AS production

WORKDIR /app/code

# Variables d'environnement de production
ENV NODE_ENV=production

# L'image de production contient tout ce qui est nécessaire pour déployer
# La commande de déploiement sera spécifiée via docker-compose ou docker run
CMD ["echo", "Use docker-compose to run specific deployment commands"]
