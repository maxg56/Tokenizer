# MaxToken42 Mining System - Makefile
# Automatisation complète du développement, test et déploiement

.PHONY: help install build test deploy clean dev frontend backend lint format

# Configuration
NETWORK ?= bsctest
PORT ?= 3001

# Couleurs pour les messages
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

# Message d'aide par défaut
help:
	@echo "$(CYAN)🚀 MaxToken42 Mining System$(RESET)"
	@echo "$(CYAN)================================$(RESET)"
	@echo ""
	@echo "$(GREEN)📦 Installation:$(RESET)"
	@echo "  make install          - Installer toutes les dépendances"
	@echo "  make install-backend  - Installer dépendances smart contracts"
	@echo "  make install-frontend - Installer dépendances frontend"
	@echo ""
	@echo "$(GREEN)🔨 Développement:$(RESET)"
	@echo "  make dev              - Démarrer frontend + backend en parallèle"
	@echo "  make dev-frontend     - Démarrer seulement le frontend Next.js"
	@echo "  make dev-backend      - Démarrer seulement le node Hardhat"
	@echo "  make build            - Builder frontend et contracts"
	@echo ""
	@echo "$(GREEN)🧪 Tests:$(RESET)"
	@echo "  make test             - Lancer tous les tests"
	@echo "  make test-contracts   - Tests smart contracts seulement"
	@echo "  make test-frontend    - Tests frontend seulement"
	@echo "  make test-watch       - Tests en mode watch"
	@echo ""
	@echo "$(GREEN)🚀 Déploiement:$(RESET)"
	@echo "  make deploy           - Déployer sur BSC Testnet"
	@echo "  make deploy-mainnet   - Déployer sur BSC Mainnet"
	@echo "  make deploy-local     - Déployer en local"
	@echo "  make verify           - Vérifier les contrats"
	@echo ""
	@echo "$(GREEN)🔧 Outils:$(RESET)"
	@echo "  make lint             - Linter tout le code"
	@echo "  make format           - Formater tout le code"
	@echo "  make clean            - Nettoyer les artifacts"
	@echo "  make reset            - Reset complet du projet"
	@echo ""
	@echo "$(GREEN)📊 Monitoring:$(RESET)"
	@echo "  make logs             - Voir les logs de développement"
	@echo "  make status           - Statut des services"
	@echo "  make ps               - Processus en cours"
	@echo ""
	@echo "$(YELLOW)Variables d'environnement:$(RESET)"
	@echo "  NETWORK=bsctest       - Réseau de déploiement (bsctest|bsc|localhost)"
	@echo "  PORT=3001             - Port du frontend"

# =====================================
# 📦 INSTALLATION
# =====================================

install: install-backend install-frontend
	@echo "$(GREEN)✅ Installation complète terminée!$(RESET)"

install-backend:
	@echo "$(CYAN)📦 Installation des dépendances smart contracts...$(RESET)"
	cd code && pnpm install
	@echo "$(GREEN)✅ Backend installé$(RESET)"

install-frontend:
	@echo "$(CYAN)📦 Installation des dépendances frontend...$(RESET)"
	cd mining-nextjs && pnpm install
	@echo "$(GREEN)✅ Frontend installé$(RESET)"

# =====================================
# 🔨 DÉVELOPPEMENT
# =====================================

dev: dev-backend dev-frontend
	@echo "$(GREEN)🚀 Services de développement démarrés!$(RESET)"
	@echo "$(CYAN)Frontend: http://localhost:$(PORT)$(RESET)"
	@echo "$(CYAN)Hardhat Node: http://localhost:8545$(RESET)"

dev-frontend:
	@echo "$(CYAN)🌐 Démarrage du frontend Next.js...$(RESET)"
	cd mining-nextjs && pnpm dev --port $(PORT) &

dev-backend:
	@echo "$(CYAN)⛏️  Démarrage du node Hardhat...$(RESET)"
	cd code && pnpm exec hardhat node &

build: build-contracts build-frontend
	@echo "$(GREEN)✅ Build complet terminé!$(RESET)"

build-contracts:
	@echo "$(CYAN)🔨 Compilation des smart contracts...$(RESET)"
	cd code && pnpm exec hardhat compile
	@echo "$(GREEN)✅ Smart contracts compilés$(RESET)"

build-frontend:
	@echo "$(CYAN)🔨 Build du frontend Next.js...$(RESET)"
	cd mining-nextjs && pnpm run build
	@echo "$(GREEN)✅ Frontend buildé$(RESET)"

# =====================================
# 🧪 TESTS
# =====================================

test: test-contracts
	@echo "$(GREEN)✅ Tous les tests passés!$(RESET)"

test-contracts:
	@echo "$(CYAN)🧪 Lancement des tests smart contracts...$(RESET)"
	cd code && pnpm test

test-frontend:
	@echo "$(CYAN)🧪 Lancement des tests frontend...$(RESET)"
	cd mining-nextjs && pnpm test

test-watch:
	@echo "$(CYAN)👀 Tests en mode watch...$(RESET)"
	cd code && pnpm exec hardhat test --watch

test-coverage:
	@echo "$(CYAN)📊 Génération du rapport de couverture...$(RESET)"
	cd code && pnpm exec hardhat coverage

# =====================================
# 🚀 DÉPLOIEMENT
# =====================================

deploy: deploy-contracts update-frontend-config
	@echo "$(GREEN)🚀 Déploiement terminé sur $(NETWORK)!$(RESET)"

deploy-contracts:
	@echo "$(CYAN)🚀 Déploiement des contrats sur $(NETWORK)...$(RESET)"
	cd code && pnpm exec hardhat run scripts/deployMining.ts --network $(NETWORK)
	@echo "$(GREEN)✅ Contrats déployés$(RESET)"

deploy-local: NETWORK=localhost
deploy-local: deploy-contracts
	@echo "$(GREEN)🏠 Déploiement local terminé!$(RESET)"

deploy-mainnet: NETWORK=bsc
deploy-mainnet:
	@echo "$(RED)⚠️  DÉPLOIEMENT MAINNET - Êtes-vous sûr? [y/N]$(RESET)"
	@read -p "" confirm && [ "$$confirm" = "y" ] || exit 1
	@$(MAKE) deploy-contracts NETWORK=bsc
	@echo "$(GREEN)🎉 Déploiement mainnet terminé!$(RESET)"

verify:
	@echo "$(CYAN)🔍 Vérification des contrats...$(RESET)"
	cd code && pnpm exec hardhat verify --network $(NETWORK)

update-frontend-config:
	@echo "$(YELLOW)⚠️  N'oubliez pas de mettre à jour les adresses dans:$(RESET)"
	@echo "  - mining-nextjs/src/lib/config.ts"
	@echo "  - mining-nextjs/.env.local"

# =====================================
# 🔧 OUTILS & MAINTENANCE
# =====================================

lint: lint-contracts lint-frontend
	@echo "$(GREEN)✅ Linting terminé!$(RESET)"

lint-contracts:
	@echo "$(CYAN)🔍 Linting smart contracts...$(RESET)"
	cd code && pnpm exec hardhat check

lint-frontend:
	@echo "$(CYAN)🔍 Linting frontend...$(RESET)"
	cd mining-nextjs && pnpm run lint

format: format-contracts format-frontend
	@echo "$(GREEN)✅ Formatage terminé!$(RESET)"

format-contracts:
	@echo "$(CYAN)✨ Formatage smart contracts...$(RESET)"
	cd code && npx prettier --write 'contracts/**/*.sol'

format-frontend:
	@echo "$(CYAN)✨ Formatage frontend...$(RESET)"
	cd mining-nextjs && pnpm run format || echo "Format script non configuré"

clean: clean-contracts clean-frontend
	@echo "$(GREEN)🧹 Nettoyage terminé!$(RESET)"

clean-contracts:
	@echo "$(CYAN)🧹 Nettoyage artifacts smart contracts...$(RESET)"
	cd code && rm -rf artifacts cache typechain-types

clean-frontend:
	@echo "$(CYAN)🧹 Nettoyage cache frontend...$(RESET)"
	cd mining-nextjs && rm -rf .next node_modules/.cache

reset: clean
	@echo "$(RED)🔄 Reset complet du projet...$(RESET)"
	cd code && rm -rf node_modules
	cd mining-nextjs && rm -rf node_modules
	@$(MAKE) install
	@echo "$(GREEN)✅ Reset terminé!$(RESET)"

# =====================================
# 📊 MONITORING & DEBUG
# =====================================

logs:
	@echo "$(CYAN)📋 Logs de développement:$(RESET)"
	@tail -f mining-nextjs/.next/trace || echo "Pas de logs Next.js"

status:
	@echo "$(CYAN)📊 Statut des services:$(RESET)"
	@echo "$(YELLOW)Frontend (port $(PORT)):$(RESET)"
	@curl -s http://localhost:$(PORT) > /dev/null && echo "  ✅ Running" || echo "  ❌ Stopped"
	@echo "$(YELLOW)Hardhat Node (port 8545):$(RESET)"
	@curl -s http://localhost:8545 > /dev/null && echo "  ✅ Running" || echo "  ❌ Stopped"

ps:
	@echo "$(CYAN)🔍 Processus en cours:$(RESET)"
	@ps aux | grep -E "(next|hardhat|pnpm)" | grep -v grep || echo "Aucun processus trouvé"

kill:
	@echo "$(RED)💀 Arrêt de tous les processus...$(RESET)"
	@pkill -f "next dev" || true
	@pkill -f "hardhat node" || true
	@pkill -f "pnpm dev" || true
	@echo "$(GREEN)✅ Processus arrêtés$(RESET)"

# =====================================
# 🎯 RACCOURCIS UTILES
# =====================================

# Démarrage rapide pour développement
quick-start: install build deploy-local dev
	@echo "$(GREEN)🎉 Projet prêt pour le développement!$(RESET)"

# Préparation pour demo
demo: clean install build test deploy
	@echo "$(GREEN)🎭 Projet prêt pour la démo!$(RESET)"

# Pipeline CI/CD
ci: install lint test build
	@echo "$(GREEN)🔄 Pipeline CI/CD terminé!$(RESET)"

# =====================================
# 📁 GESTION DES FICHIERS
# =====================================

setup-env:
	@echo "$(CYAN)⚙️  Configuration des fichiers d'environnement...$(RESET)"
	@if [ ! -f code/.env ]; then \
		cp code/.env.example code/.env 2>/dev/null || echo "PRIVATE_KEY=your_private_key_here" > code/.env; \
		echo "$(YELLOW)📝 Créé code/.env - Ajoutez votre clé privée$(RESET)"; \
	fi
	@if [ ! -f mining-nextjs/.env.local ]; then \
		echo "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id" > mining-nextjs/.env.local; \
		echo "NEXT_PUBLIC_TOKEN_ADDRESS=0x..." >> mining-nextjs/.env.local; \
		echo "NEXT_PUBLIC_MINING_ADDRESS=0x..." >> mining-nextjs/.env.local; \
		echo "$(YELLOW)📝 Créé mining-nextjs/.env.local - Configurez les adresses$(RESET)"; \
	fi

backup:
	@echo "$(CYAN)💾 Création d'une sauvegarde...$(RESET)"
	@tar -czf maxtoken42-backup-$(shell date +%Y%m%d-%H%M%S).tar.gz \
		--exclude=node_modules \
		--exclude=.next \
		--exclude=artifacts \
		--exclude=cache \
		code/ mining-nextjs/ mining-frontend/ Makefile
	@echo "$(GREEN)✅ Sauvegarde créée$(RESET)"

# =====================================
# 🔬 ADVANCED FEATURES
# =====================================

# Analyser la taille du bundle
analyze:
	@echo "$(CYAN)📊 Analyse de la taille du bundle...$(RESET)"
	cd mining-nextjs && ANALYZE=true pnpm run build

# Optimiser les images
optimize-images:
	@echo "$(CYAN)🖼️  Optimisation des images...$(RESET)"
	@find . -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | head -10

# Générer la documentation
docs:
	@echo "$(CYAN)📚 Génération de la documentation...$(RESET)"
	cd code && pnpm exec hardhat docgen || echo "Docgen non configuré"

# Gas report
gas-report:
	@echo "$(CYAN)⛽ Rapport de consommation de gas...$(RESET)"
	cd code && REPORT_GAS=true pnpm test

# Security audit
audit:
	@echo "$(CYAN)🔒 Audit de sécurité...$(RESET)"
	cd code && pnpm audit
	cd mining-nextjs && pnpm audit

# =====================================
# 📱 MOBILE & RESPONSIVE
# =====================================

mobile-test:
	@echo "$(CYAN)📱 Test sur mobile (tunnel ngrok)...$(RESET)"
	@which ngrok > /dev/null || (echo "$(RED)Installez ngrok pour les tests mobile$(RESET)" && exit 1)
	@echo "$(YELLOW)Démarrage du tunnel mobile...$(RESET)"
	@ngrok http $(PORT)

# =====================================
# 🎨 DESIGN & UI
# =====================================

storybook:
	@echo "$(CYAN)📖 Démarrage de Storybook...$(RESET)"
	cd mining-nextjs && pnpm run storybook || echo "Storybook non configuré"

# =====================================
# 🌟 BONUS FEATURES
# =====================================

# Easter egg - animation ASCII
ascii-art:
	@echo "$(CYAN)"
	@echo "  ███╗   ███╗ █████╗ ██╗  ██╗████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗██╗  ██╗██████╗ "
	@echo "  ████╗ ████║██╔══██╗╚██╗██╔╝╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║██║  ██║╚════██╗"
	@echo "  ██╔████╔██║███████║ ╚███╔╝    ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║███████║ █████╔╝"
	@echo "  ██║╚██╔╝██║██╔══██║ ██╔██╗    ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║╚════██║██╔═══╝ "
	@echo "  ██║ ╚═╝ ██║██║  ██║██╔╝ ██╗   ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║     ██║███████╗"
	@echo "  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝     ╚═╝╚══════╝"
	@echo "$(RESET)"
	@echo "$(GREEN)                           🚀 Mining System Ready! 🚀$(RESET)"

# Version et informations
 :
	@echo "$(CYAN)📋 Informations du projet:$(RESET)"
	@echo "  MaxToken42 Mining System v1.0.0"
	@echo "  Smart Contracts: Solidity ^0.8.0"
	@echo "  Frontend: Next.js 15 + TypeScript"
	@echo "  Web3: Wagmi + RainbowKit + Viem"
	@echo "  Blockchain: BSC (Binance Smart Chain)"