# =============================================================================
# Tokenizer42 - Makefile
# =============================================================================
# Commandes standards pour le développement et le déploiement
# =============================================================================

.PHONY: all install test compile clean node deploy-local deploy-testnet deploy-mainnet \
        coverage lint format help docker-build docker-up docker-down docker-test \
        verify-testnet verify-mainnet setup security-check

# Configuration
PNPM := pnpm
CODE_DIR := code
DOCKER_COMPOSE := docker-compose

# Couleurs (compatibles avec la plupart des terminaux)
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

# =============================================================================
# Commandes principales
# =============================================================================

## Afficher l'aide
help:
	@echo ""
	@echo "$(BLUE)============================================================$(NC)"
	@echo "$(BLUE)  TOKENIZER42 - Commandes disponibles$(NC)"
	@echo "$(BLUE)============================================================$(NC)"
	@echo ""
	@echo "$(GREEN)Installation & Setup:$(NC)"
	@echo "  make install        - Installer les dépendances"
	@echo "  make setup          - Configuration complète (install + compile)"
	@echo "  make clean          - Nettoyer les fichiers générés"
	@echo ""
	@echo "$(GREEN)Développement:$(NC)"
	@echo "  make compile        - Compiler les smart contracts"
	@echo "  make test           - Lancer tous les tests"
	@echo "  make coverage       - Générer le rapport de couverture"
	@echo "  make node           - Démarrer un noeud Hardhat local"
	@echo ""
	@echo "$(GREEN)Déploiement:$(NC)"
	@echo "  make deploy-local   - Déployer sur le noeud local"
	@echo "  make deploy-testnet - Déployer sur BSC Testnet"
	@echo "  make deploy-mainnet - Déployer sur BSC Mainnet"
	@echo ""
	@echo "$(GREEN)Vérification:$(NC)"
	@echo "  make verify-testnet - Vérifier les contrats sur BSC Testnet"
	@echo "  make verify-mainnet - Vérifier les contrats sur BSC Mainnet"
	@echo ""
	@echo "$(GREEN)Docker:$(NC)"
	@echo "  make docker-build   - Construire l'image Docker"
	@echo "  make docker-up      - Démarrer les conteneurs"
	@echo "  make docker-down    - Arrêter les conteneurs"
	@echo "  make docker-test    - Lancer les tests dans Docker"
	@echo ""
	@echo "$(GREEN)Sécurité:$(NC)"
	@echo "  make security-check - Lancer l'analyse de sécurité (Slither)"
	@echo ""

## Cible par défaut
all: help

# =============================================================================
# Installation & Setup
# =============================================================================

## Installer les dépendances
install:
	@echo "$(BLUE)Installation des dépendances...$(NC)"
	cd $(CODE_DIR) && $(PNPM) install
	@echo "$(GREEN)Dépendances installées!$(NC)"

## Configuration complète
setup: install compile
	@echo "$(GREEN)Setup terminé!$(NC)"
	@echo "$(YELLOW)N'oubliez pas de configurer code/.env$(NC)"

## Nettoyer les fichiers générés
clean:
	@echo "$(BLUE)Nettoyage...$(NC)"
	cd $(CODE_DIR) && rm -rf artifacts cache coverage typechain-types
	cd $(CODE_DIR) && rm -rf node_modules
	rm -rf frontend/node_modules frontend/.next frontend/out
	@echo "$(GREEN)Nettoyage terminé!$(NC)"

## Nettoyer uniquement les artefacts de build
clean-build:
	@echo "$(BLUE)Nettoyage des artefacts de build...$(NC)"
	cd $(CODE_DIR) && rm -rf artifacts cache typechain-types
	@echo "$(GREEN)Artefacts nettoyés!$(NC)"

# =============================================================================
# Développement
# =============================================================================

## Compiler les smart contracts
compile:
	@echo "$(BLUE)Compilation des smart contracts...$(NC)"
	cd $(CODE_DIR) && $(PNPM) run compile
	@echo "$(GREEN)Compilation terminée!$(NC)"

## Lancer les tests
test:
	@echo "$(BLUE)Lancement des tests...$(NC)"
	cd $(CODE_DIR) && $(PNPM) run test
	@echo "$(GREEN)Tests terminés!$(NC)"

## Générer le rapport de couverture
coverage:
	@echo "$(BLUE)Génération du rapport de couverture...$(NC)"
	cd $(CODE_DIR) && $(PNPM) run coverage
	@echo "$(GREEN)Rapport généré dans code/coverage/$(NC)"

## Démarrer un noeud Hardhat local
node:
	@echo "$(BLUE)Démarrage du noeud Hardhat local...$(NC)"
	@echo "$(YELLOW)Le noeud sera accessible sur http://127.0.0.1:8545$(NC)"
	cd $(CODE_DIR) && $(PNPM) run node

# =============================================================================
# Déploiement
# =============================================================================

## Déployer sur le noeud local
deploy-local:
	@echo "$(BLUE)Déploiement sur le noeud local...$(NC)"
	cd $(CODE_DIR) && $(PNPM) run deploy:local
	@echo "$(GREEN)Déploiement local terminé!$(NC)"

## Déployer sur BSC Testnet
deploy-testnet:
	@echo "$(BLUE)Déploiement sur BSC Testnet...$(NC)"
	@echo "$(YELLOW)Assurez-vous d'avoir configuré PRIVATE_KEY dans code/.env$(NC)"
	@echo "$(YELLOW)Assurez-vous d'avoir des tBNB dans votre wallet$(NC)"
	cd $(CODE_DIR) && $(PNPM) run deploy:bsctest
	@echo "$(GREEN)Déploiement testnet terminé!$(NC)"

## Déployer sur BSC Mainnet (ATTENTION: utilise de vrais fonds!)
deploy-mainnet:
	@echo "$(YELLOW)============================================================$(NC)"
	@echo "$(YELLOW)  ATTENTION: Vous allez déployer sur BSC MAINNET$(NC)"
	@echo "$(YELLOW)  Cela utilisera de vrais BNB!$(NC)"
	@echo "$(YELLOW)============================================================$(NC)"
	@read -p "Êtes-vous sûr de vouloir continuer? (yes/no) " confirm && [ "$$confirm" = "yes" ]
	@echo "$(BLUE)Déploiement sur BSC Mainnet...$(NC)"
	cd $(CODE_DIR) && $(PNPM) run deploy:bsc
	@echo "$(GREEN)Déploiement mainnet terminé!$(NC)"

# =============================================================================
# Vérification des contrats
# =============================================================================

## Vérifier sur BSC Testnet
verify-testnet:
	@echo "$(BLUE)Vérification des contrats sur BSC Testnet...$(NC)"
	@echo "$(YELLOW)Utilisez les adresses du fichier deployments.json$(NC)"
	@echo "Exemple: cd $(CODE_DIR) && npx hardhat verify --network bsctest <CONTRACT_ADDRESS>"

## Vérifier sur BSC Mainnet
verify-mainnet:
	@echo "$(BLUE)Vérification des contrats sur BSC Mainnet...$(NC)"
	@echo "$(YELLOW)Utilisez les adresses du fichier deployments.json$(NC)"
	@echo "Exemple: cd $(CODE_DIR) && npx hardhat verify --network bsc <CONTRACT_ADDRESS>"

# =============================================================================
# Docker
# =============================================================================

## Construire l'image Docker
docker-build:
	@echo "$(BLUE)Construction de l'image Docker...$(NC)"
	$(DOCKER_COMPOSE) build
	@echo "$(GREEN)Image construite!$(NC)"

## Démarrer les conteneurs
docker-up:
	@echo "$(BLUE)Démarrage des conteneurs...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)Conteneurs démarrés!$(NC)"
	@echo "Frontend: http://localhost:3000"
	@echo "Hardhat Node: http://localhost:8545"

## Arrêter les conteneurs
docker-down:
	@echo "$(BLUE)Arrêt des conteneurs...$(NC)"
	$(DOCKER_COMPOSE) down
	@echo "$(GREEN)Conteneurs arrêtés!$(NC)"

## Lancer les tests dans Docker
docker-test:
	@echo "$(BLUE)Lancement des tests dans Docker...$(NC)"
	$(DOCKER_COMPOSE) run --rm contracts $(PNPM) test
	@echo "$(GREEN)Tests terminés!$(NC)"

# =============================================================================
# Sécurité
# =============================================================================

## Lancer l'analyse de sécurité avec Slither
security-check:
	@echo "$(BLUE)Analyse de sécurité avec Slither...$(NC)"
	@echo "$(YELLOW)Assurez-vous d'avoir Slither installé: pip install slither-analyzer$(NC)"
	cd $(CODE_DIR) && slither . --exclude-dependencies || true
	@echo "$(GREEN)Analyse terminée!$(NC)"

# =============================================================================
# Frontend
# =============================================================================

## Installer les dépendances du frontend
frontend-install:
	@echo "$(BLUE)Installation des dépendances frontend...$(NC)"
	cd frontend && $(PNPM) install
	@echo "$(GREEN)Dépendances frontend installées!$(NC)"

## Démarrer le frontend en mode développement
frontend-dev:
	@echo "$(BLUE)Démarrage du frontend...$(NC)"
	cd frontend && $(PNPM) dev

## Build du frontend pour la production
frontend-build:
	@echo "$(BLUE)Build du frontend...$(NC)"
	cd frontend && $(PNPM) build
	@echo "$(GREEN)Build terminé!$(NC)"
