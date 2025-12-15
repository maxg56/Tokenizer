#!/bin/bash

# =============================================================================
# Tokenizer42 - Script d'initialisation
# =============================================================================
# Ce script configure l'environnement de développement pour Tokenizer42
# Compatible: Linux & macOS
# =============================================================================

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
print_header() {
    echo ""
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Vérifier la version de Node.js
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            print_success "Node.js $(node -v) installé"
            return 0
        else
            print_error "Node.js version 18+ requise (actuelle: $(node -v))"
            return 1
        fi
    else
        print_error "Node.js n'est pas installé"
        return 1
    fi
}

# Vérifier le gestionnaire de paquets
check_package_manager() {
    if command_exists pnpm; then
        PACKAGE_MANAGER="pnpm"
        print_success "pnpm $(pnpm -v) installé (recommandé)"
    elif command_exists npm; then
        PACKAGE_MANAGER="npm"
        print_warning "npm $(npm -v) installé (pnpm recommandé)"
        print_info "Pour installer pnpm: npm install -g pnpm"
    else
        print_error "Aucun gestionnaire de paquets Node.js trouvé"
        return 1
    fi
    return 0
}

# Vérifier Git
check_git() {
    if command_exists git; then
        print_success "Git $(git --version | cut -d' ' -f3) installé"
        return 0
    else
        print_warning "Git n'est pas installé (optionnel mais recommandé)"
        return 0
    fi
}

print_header "TOKENIZER42 - Configuration de l'environnement"

echo "Ce script va:"
echo "  1. Vérifier les prérequis (Node.js, npm/pnpm)"
echo "  2. Installer les dépendances"
echo "  3. Configurer le fichier .env"
echo "  4. Compiler les smart contracts"
echo "  5. Vérifier la configuration"
echo ""

# =============================================================================
# Étape 1: Vérification des prérequis
# =============================================================================
print_header "Étape 1/5: Vérification des prérequis"

PREREQS_OK=true

check_node_version || PREREQS_OK=false
check_package_manager || PREREQS_OK=false
check_git

if [ "$PREREQS_OK" = false ]; then
    print_error "Certains prérequis ne sont pas satisfaits"
    echo ""
    echo "Installation de Node.js:"
    echo "  - macOS: brew install node"
    echo "  - Linux: https://nodejs.org/en/download/"
    echo "  - nvm: https://github.com/nvm-sh/nvm"
    exit 1
fi

# =============================================================================
# Étape 2: Installation des dépendances
# =============================================================================
print_header "Étape 2/5: Installation des dépendances"

cd "$(dirname "$0")/code"

if [ -f "node_modules/.package-lock.json" ] || [ -f "node_modules/.pnpm" ]; then
    print_info "Les dépendances semblent déjà installées"
    read -p "Voulez-vous les réinstaller? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Suppression de node_modules..."
        rm -rf node_modules
        print_info "Installation des dépendances avec $PACKAGE_MANAGER..."
        $PACKAGE_MANAGER install
    fi
else
    print_info "Installation des dépendances avec $PACKAGE_MANAGER..."
    $PACKAGE_MANAGER install
fi

print_success "Dépendances installées"

# =============================================================================
# Étape 3: Configuration de l'environnement
# =============================================================================
print_header "Étape 3/5: Configuration de l'environnement"

cd "$(dirname "$0")/code"

if [ -f ".env" ]; then
    print_warning "Le fichier .env existe déjà"
    read -p "Voulez-vous le remplacer? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env .env.backup
        print_info "Backup créé: .env.backup"
        cp .env.example .env
        print_success "Fichier .env créé depuis .env.example"
    fi
else
    cp .env.example .env
    print_success "Fichier .env créé depuis .env.example"
fi

echo ""
print_warning "IMPORTANT: Éditez le fichier code/.env avec vos clés:"
echo "  - PRIVATE_KEY: Clé privée de votre wallet (sans 0x)"
echo "  - BSCSCAN_API_KEY: Clé API de BSCScan"
echo ""

# =============================================================================
# Étape 4: Compilation des smart contracts
# =============================================================================
print_header "Étape 4/5: Compilation des smart contracts"

cd "$(dirname "$0")/code"

print_info "Compilation des contrats Solidity..."
$PACKAGE_MANAGER run compile

print_success "Smart contracts compilés"

# =============================================================================
# Étape 5: Vérification finale
# =============================================================================
print_header "Étape 5/5: Vérification de la configuration"

cd "$(dirname "$0")/code"

# Vérifier que les fichiers nécessaires existent
FILES_OK=true

check_file() {
    if [ -f "$1" ]; then
        print_success "Fichier trouvé: $1"
    else
        print_error "Fichier manquant: $1"
        FILES_OK=false
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        print_success "Répertoire trouvé: $1"
    else
        print_error "Répertoire manquant: $1"
        FILES_OK=false
    fi
}

check_file "hardhat.config.ts"
check_file ".env"
check_file "package.json"
check_dir "contracts"
check_dir "scripts"
check_dir "test"
check_dir "artifacts"

if [ "$FILES_OK" = true ]; then
    print_success "Configuration vérifiée avec succès!"
else
    print_warning "Certains fichiers sont manquants"
fi

# =============================================================================
# Résumé
# =============================================================================
print_header "Configuration terminée!"

echo "Commandes disponibles:"
echo ""
echo "  Développement local:"
echo "    make install          - Installer les dépendances"
echo "    make test             - Lancer les tests"
echo "    make node             - Démarrer un noeud local"
echo "    make deploy-local     - Déployer en local"
echo ""
echo "  Déploiement:"
echo "    make deploy-testnet   - Déployer sur BSC Testnet"
echo "    make deploy-mainnet   - Déployer sur BSC Mainnet"
echo ""
echo "  Docker:"
echo "    docker-compose up     - Démarrer l'environnement complet"
echo ""
echo "Prochaines étapes:"
echo "  1. Éditez code/.env avec vos clés"
echo "  2. Lancez 'make test' pour vérifier l'installation"
echo "  3. Lancez 'make node' puis 'make deploy-local' pour tester"
echo ""
print_warning "N'oubliez pas: NE JAMAIS commit le fichier .env!"
