# 🚀 Tokenizer42 - ERC20 Token avec MultiSig

Un projet blockchain complet avec un token ERC20 et un contrat MultiSig, développé en **Solidity** avec des tests et scripts en **TypeScript**.

## 📋 Vue d'ensemble

Ce projet contient :
- **Token42** : Token ERC20 standard avec 1M de tokens initiaux
- **MultiSig42** : Contrat de multisignature pour sécuriser les transactions importantes
- **Tests complets** : Suite de tests TypeScript avec Hardhat
- **Scripts de déploiement** : Automatisation du déploiement sur différents réseaux

## 🛠️ Stack technique

- **Solidity** `^0.8.20` - Smart contracts
- **TypeScript** - Tests et scripts
- **Hardhat** - Framework de développement
- **OpenZeppelin** - Librairies sécurisées
- **Ethers.js** - Interaction avec la blockchain
- **Chai** - Framework de tests

## 📁 Structure du projet

```
Tokenizer/
├── README.md                     → Documentation principale
├── code/                         → Code source
│   ├── contracts/                → Smart contracts Solidity
│   │   ├── Token42.sol          → Token ERC20
│   │   └── MultiSig42.sol       → Contrat MultiSig
│   ├── test/                    → Tests TypeScript
│   │   └── Token42.test.ts      → Tests du token
│   ├── scripts/                 → Scripts de déploiement
│   │   └── deploy.ts            → Déploiement automatisé
│   ├── hardhat.config.ts        → Configuration Hardhat
│   ├── package.json             → Dépendances et scripts
│   ├── .env.example             → Template variables d'environnement
│   └── .gitignore               → Fichiers à ignorer
└── docs/                        → Documentation technique
```

## 🚀 Installation rapide

### Prérequis
- **Node.js** `>=16.0.0`
- **pnpm** (recommandé) ou npm
- **Git**

### Installation
```bash
# Cloner le projet
git clone <your-repo-url>
cd Tokenizer/code

# Installer les dépendances
pnpm install

# Copier le fichier d'environnement
cp .env.example .env
```

### Configuration
Éditer le fichier `.env` :
```bash
# Clé privée de ton wallet (SANS le 0x)
PRIVATE_KEY=your_private_key_here

# API Key pour BSCScan (optionnel, pour vérifier le contrat)
BSCSCAN_API_KEY=your_bscscan_api_key_here

# Activer le rapport de gas (optionnel)
REPORT_GAS=true
```

## 🧪 Tests

### Lancer tous les tests
```bash
pnpm test
```

### Tests couverts
- ✅ **Déploiement** : Vérification des paramètres initiaux
- ✅ **Transferts** : Entre différents comptes
- ✅ **Allowances** : Système d'approbation ERC20
- ✅ **Edge cases** : Gestion des erreurs et cas limites
- ✅ **Events** : Émission des événements Transfer/Approval

### Exemple de sortie
```
  Token42
    Deployment
      ✓ Should set the right owner
      ✓ Should assign the total supply of tokens to the owner
      ✓ Should have correct name and symbol
    Transactions
      ✓ Should transfer tokens between accounts
      ✓ Should fail if sender doesn't have enough tokens
    ...
  8 passing (2s)
```

## 🌐 Déploiement

### Compilation
```bash
pnpm compile
```

### Réseau local (développement)
```bash
# Terminal 1 : Lancer un nœud local
pnpm node

# Terminal 2 : Déployer
pnpm run deploy:local
```

### BSC Testnet
```bash
pnpm run deploy:bsctest
```

### BSC Mainnet (production)
```bash
# Assure-toi d'avoir des BNB pour les frais de gas !
pnpm exec hardhat run scripts/deploy.ts --network bsc
```

### Exemple de déploiement réussi
```
🚀 Deploying Token42 with account: 0x742d35Cc6523Bb...
💰 Account balance: 0.1 ETH
✅ Token42 deployed to: 0x1234567890abcdef...
📊 Initial supply: 1000000 TK42
🎯 Token name: Token42
🔤 Token symbol: TK42
```

## 📊 Caractéristiques du Token42

| Propriété | Valeur |
|-----------|--------|
| **Nom** | MaxToken42 |
| **Symbole** | MTK42 |
| **Décimales** | 18 |
| **Supply initial** | 1,000,000 TK42 |
| **Standard** | ERC20 |
| **Mintable** | Non (supply fixe) |
| **Burnable** | Non |

## 🔐 Sécurité

### Smart contracts
- Utilise **OpenZeppelin** pour les standards sécurisés
- Code audité et testé
- Pas de fonctions dangereuses (mint, burn non autorisés)

### Bonnes pratiques
- ✅ Clés privées dans `.env` (jamais dans le code)
- ✅ `.env` dans `.gitignore`
- ✅ Tests exhaustifs avant déploiement
- ✅ Vérification des contrats sur BSCScan

## 🛠️ Scripts disponibles

```bash
# Développement
pnpm compile          # Compiler les contrats
pnpm test            # Lancer les tests
pnpm node            # Nœud local Hardhat

# Déploiement
pnpm run deploy:local    # Déployer en local
pnpm run deploy:bsctest  # Déployer sur BSC Testnet

# Utilitaires
pnpm run coverage       # Rapport de couverture des tests
pnpm run gas-report     # Rapport de consommation gas
```

## 🌍 Réseaux supportés

| Réseau | Chain ID | RPC URL | Usage |
|--------|----------|---------|-------|
| **Hardhat Local** | 1337 | http://127.0.0.1:8545 | Développement |
| **BSC Testnet** | 97 | https://data-seed-prebsc-1-s1.binance.org:8545/ | Tests |
| **BSC Mainnet** | 56 | https://bsc-dataseed1.binance.org/ | Production |

## 🔧 Dépannage

### Erreurs communes

**Error: insufficient funds**
```bash
# Solution : Ajouter des BNB/ETH sur ton wallet
```

**Error: nonce too high**
```bash
# Solution : Reset ton wallet dans Metamask
# Settings > Advanced > Reset Account
```

**Cannot resolve dependency**
```bash
# Solution : Nettoyer et réinstaller
rm -rf node_modules
pnpm install
```

## 📚 Ressources utiles

- [Documentation Hardhat](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [BSC Documentation](https://docs.bnbchain.org/)
- [Ethers.js Guide](https://docs.ethers.io/)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

Créé avec ❤️ pour la blockchain

---

## 🚨 Avertissement

⚠️ **Ce code est à des fins éducatives.** Avant tout déploiement en production :
- Fais auditer tes smart contracts
- Teste extensivement sur testnet
- Comprends les risques financiers
- Utilise un wallet dédié pour les tests

**Les cryptomonnaies sont volatiles. Ne jamais investir plus que ce que tu peux te permettre de perdre.** 🚨