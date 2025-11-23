# MaxToken42 Mining System

Un ecosysteme blockchain complet avec token ERC20 minable, faucet, et portefeuille multi-signatures.

## Vue d'ensemble

Ce projet contient :
- **MaxToken42Mining** : Token ERC20 avec support de minage (max supply 10M)
- **MiningContract** : Systeme de minage proof-of-work avec rewards et bonus
- **Faucet** : Distribution gratuite de tokens pour testnets
- **MultiSigWallet** : Portefeuille multi-signatures pour la gouvernance
- **Frontend Next.js** : Interface web avec wagmi + RainbowKit

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Smart Contracts | Solidity 0.8.20, OpenZeppelin 5.0 |
| Framework | Hardhat 2.x |
| Tests | TypeScript, Chai, Mocha |
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Web3 | wagmi, viem, ethers.js 6, RainbowKit |
| CI/CD | GitHub Actions |

## Structure du projet

```
Tokenizer/
├── code/                          # Smart contracts
│   ├── contracts/
│   │   ├── MaxToken42Mining.sol   # Token ERC20 avec minage
│   │   ├── MiningContract.sol     # Contrat de minage PoW
│   │   ├── Faucet.sol             # Faucet pour distribution
│   │   ├── MultiSigWallet.sol     # Portefeuille multi-sig
│   │   └── Token42.sol            # Token ERC20 simple
│   ├── test/                      # Tests unitaires (64 tests)
│   ├── scripts/                   # Scripts de deploiement
│   └── hardhat.config.ts
├── mining-nextjs/                 # Frontend Next.js
│   ├── src/
│   │   ├── app/                   # Pages
│   │   ├── components/            # Composants React
│   │   ├── hooks/                 # Hooks custom
│   │   └── lib/                   # Config et utilitaires
│   └── package.json
├── .github/workflows/ci.yml       # GitHub Actions CI
└── README.md
```

## Installation rapide

### Prerequisites
- Node.js >= 20
- pnpm >= 9
- Git

### Backend (Smart Contracts)

```bash
cd code
pnpm install
pnpm compile
pnpm test          # 64 tests
```

### Frontend

```bash
cd mining-nextjs
pnpm install
pnpm dev           # http://localhost:3000
```

## Deploiement

### Local (developpement)

```bash
# Terminal 1: Lancer le noeud Hardhat
cd code && pnpm node

# Terminal 2: Deployer tous les contrats
pnpm deploy:local
```

### BSC Testnet

```bash
# Configurer .env avec PRIVATE_KEY
pnpm deploy:bsctest
```

### BSC Mainnet

```bash
pnpm deploy:bsc
```

## Contrats

### MaxToken42Mining (Token)

| Propriete | Valeur |
|-----------|--------|
| Nom | MaxToken42 |
| Symbole | MTK42 |
| Decimales | 18 |
| Supply initiale | 1,000,000 MTK42 |
| Supply max | 10,000,000 MTK42 |
| Mintable | Oui (MINER_ROLE) |
| Burnable | Oui (holder) |

**Fonctions principales:**
- `mint(to, amount)` - Minter des tokens (MINER_ROLE)
- `burn(amount)` - Bruler ses tokens
- `addMiner(address)` - Ajouter un mineur (owner)
- `removeMiner(address)` - Retirer un mineur (owner)

### MiningContract (Minage)

| Parametre | Valeur |
|-----------|--------|
| Reward de base | 100 MTK42 |
| Difficulte initiale | 1000 |
| Temps de bloc cible | 5 minutes |
| Halving | Tous les 210,000 blocs |
| Bonus quotidien | 50 MTK42 |

**Fonctions principales:**
- `startMining(power)` - Demarrer le minage (power 1-100)
- `stopMining()` - Arreter le minage
- `mineBlock(nonce)` - Soumettre un proof-of-work
- `claimDailyBonus()` - Reclamer le bonus quotidien
- `getMinerStats(address)` - Stats d'un mineur
- `getGlobalStats()` - Stats globales

**Systeme de rewards:**
- Bonus de puissance (50-150% selon power)
- Bonus de fidelite (jusqu'a 25% apres 30 jours)
- Bonus de performance (jusqu'a 10% apres 10 blocs)
- Halving automatique tous les 210k blocs

### Faucet

| Parametre | Valeur |
|-----------|--------|
| Montant par demande | 100 MTK42 |
| Cooldown | 24 heures |
| Limite quotidienne | 1000 demandes |

**Fonctions principales:**
- `drip()` - Demander des tokens
- `canDrip(address)` - Verifier si disponible
- `getStats()` - Statistiques du faucet
- `fund(amount)` - Financer le faucet

### MultiSigWallet

**Fonctions principales:**
- `submitTransaction(to, value, data)` - Soumettre une transaction
- `confirmTransaction(txIndex)` - Confirmer
- `executeTransaction(txIndex)` - Executer
- `revokeConfirmation(txIndex)` - Revoquer
- `addOwner(address)` - Ajouter un owner (via multisig)
- `removeOwner(address)` - Retirer un owner (via multisig)
- `changeRequirement(n)` - Modifier le quorum (via multisig)

## Tests

```bash
cd code
pnpm test
```

**Couverture:**
- 64 tests passants
- Token42: 14 tests (ERC20 standard)
- MiningContract: 16 tests (minage, rewards, admin)
- Faucet: 13 tests (drip, cooldown, stats)
- MultiSigWallet: 21 tests (submit, confirm, execute, governance)

## CI/CD

Le projet inclut une GitHub Action (`.github/workflows/ci.yml`) qui:
1. Compile les contrats
2. Execute les tests
3. Genere un rapport de couverture
4. Lint le frontend
5. Build le frontend
6. Scan de securite avec Slither

## Securite

### Points forts
- OpenZeppelin v5 pour les standards
- ReentrancyGuard sur les fonctions critiques
- Pausable pour les urgences
- AccessControl pour les roles
- Tests exhaustifs

### Recommandations
- Limiter `activeMinersList` pour eviter DoS
- Ajouter un timelock pour les fonctions admin
- Audit externe avant mainnet

## Scripts disponibles

```bash
# Backend (code/)
pnpm compile         # Compiler les contrats
pnpm test            # Lancer les tests
pnpm coverage        # Rapport de couverture
pnpm node            # Noeud local Hardhat
pnpm deploy:local    # Deployer localement
pnpm deploy:bsctest  # Deployer sur BSC Testnet
pnpm deploy:bsc      # Deployer sur BSC Mainnet

# Frontend (mining-nextjs/)
pnpm dev             # Serveur de dev
pnpm build           # Build production
pnpm lint            # Linter
```

## Configuration

### Variables d'environnement (code/.env)

```bash
# Cle privee du deployer (sans 0x)
PRIVATE_KEY=your_private_key

# API BSCScan pour verification
BSCSCAN_API_KEY=your_api_key

# Rapport de gas
REPORT_GAS=true
```

### Variables d'environnement (mining-nextjs/.env.local)

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Reseaux supportes

| Reseau | Chain ID | Usage |
|--------|----------|-------|
| Hardhat Local | 1337 | Developpement |
| BSC Testnet | 97 | Tests |
| BSC Mainnet | 56 | Production |

## License

MIT

## Avertissement

Ce code est a des fins educatives. Avant deploiement en production:
- Faire auditer les smart contracts
- Tester extensivement sur testnet
- Comprendre les risques financiers
