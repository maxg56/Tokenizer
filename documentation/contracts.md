# Documentation des Smart Contracts

Documentation technique des contrats Solidity du projet Tokenizer42.

## Vue d'ensemble

Le projet contient quatre smart contracts :
- **MaxToken42Mining.sol** : Token ERC20 avec support de minage
- **MiningContract.sol** : Contrat de minage proof-of-work
- **Faucet.sol** : Distribution de tokens pour testnets
- **MultiSigWallet.sol** : Portefeuille multi-signatures

---

## MaxToken42Mining.sol - Token ERC20 Minable

### Description
Token ERC20 avec supply limitee, support de minage via roles et fonction burn.

### Caracteristiques techniques

| Propriete | Valeur | Description |
|-----------|--------|-------------|
| **Nom** | MaxToken42 | Nom complet du token |
| **Symbole** | MTK42 | Symbole de trading |
| **Decimales** | 18 | Precision (standard ERC20) |
| **Supply initial** | 1,000,000 MTK42 | Au deploiement |
| **Supply max** | 10,000,000 MTK42 | Limite absolue |
| **Mintable** | Oui (MINER_ROLE) | Via contrat de minage |
| **Burnable** | Oui | Chacun peut bruler ses tokens |
| **Pausable** | Non | Pas de mecanisme de pause |

### Fonctions principales

#### Lecture

| Fonction | Retour | Description |
|----------|--------|-------------|
| `name()` | `string` | Retourne "MaxToken42" |
| `symbol()` | `string` | Retourne "MTK42" |
| `decimals()` | `uint8` | Retourne 18 |
| `totalSupply()` | `uint256` | Supply actuel en wei |
| `MAX_SUPPLY()` | `uint256` | 10M MTK42 en wei |
| `remainingSupply()` | `uint256` | Tokens restants a minter |
| `canMint(address)` | `bool` | Verifie si l'adresse peut minter |

#### Ecriture

| Fonction | Acces | Description |
|----------|-------|-------------|
| `transfer(to, amount)` | Public | Transfert standard |
| `mint(to, amount)` | MINER_ROLE | Creer des tokens |
| `burn(amount)` | Public | Bruler ses propres tokens |
| `addMiner(address)` | Owner | Ajouter un mineur autorise |
| `removeMiner(address)` | Owner | Retirer un mineur |

### Evenements

```solidity
event TokenDeployed(address indexed owner, uint256 initialSupply, uint256 maxSupply);
event TokensMinted(address indexed to, uint256 amount);
event TokensBurned(address indexed from, uint256 amount);
event MinerAdded(address indexed miner);
event MinerRemoved(address indexed miner);
```

### Securite

- **AccessControl** : Seuls les MINER_ROLE peuvent minter
- **Supply cap** : Impossible de depasser MAX_SUPPLY
- **OpenZeppelin** : Base sur des contrats audites

---

## MiningContract.sol - Systeme de Minage

### Description
Contrat de minage proof-of-work avec recompenses, bonus et ajustement de difficulte.

### Caracteristiques

| Propriete | Valeur | Description |
|-----------|--------|-------------|
| **Recompense de base** | 100 MTK42 | Par bloc mine |
| **Difficulte initiale** | 1000 | Ajustable automatiquement |
| **Temps de bloc** | 5 minutes | Cible |
| **Halving** | 210,000 blocs | Division par 2 de la recompense |
| **Bonus quotidien** | 50 MTK42 | Pour mineurs actifs |

### Fonctions principales

#### Minage

| Fonction | Description |
|----------|-------------|
| `startMining(power)` | Demarrer le minage (power: 1-100%) |
| `stopMining()` | Arreter le minage |
| `mineBlock(nonce)` | Soumettre une preuve de travail |
| `claimDailyBonus()` | Reclamer le bonus quotidien |

#### Lecture

| Fonction | Description |
|----------|-------------|
| `getMinerStats(address)` | Statistiques d'un mineur |
| `getGlobalStats()` | Statistiques globales |
| `getCurrentReward()` | Recompense actuelle (avec halving) |
| `calculateReward(address)` | Recompense estimee pour un mineur |

### Proof-of-Work

```solidity
bytes32 hash = keccak256(abi.encodePacked(
    currentBlock,
    msg.sender,
    nonce,
    block.timestamp
));
uint256 target = type(uint256).max / difficulty;
require(uint256(hash) < target, "Invalid proof-of-work");
```

### Evenements

```solidity
event MiningStarted(address indexed miner, uint256 power);
event MiningStopped(address indexed miner);
event BlockMined(address indexed miner, uint256 indexed blockNumber, uint256 reward, uint256 difficulty, bytes32 hash);
event DifficultyAdjusted(uint256 oldDifficulty, uint256 newDifficulty);
event DailyBonusClaimed(address indexed miner, uint256 amount);
```

---

## Faucet.sol - Distribution de Tokens

### Description
Faucet pour distribuer des tokens MTK42 aux utilisateurs sur testnet.

### Configuration

| Propriete | Valeur | Description |
|-----------|--------|-------------|
| **Montant par demande** | 100 MTK42 | Configurable |
| **Cooldown** | 24 heures | Entre chaque demande |
| **Limite quotidienne** | 1000 demandes | Par jour |

### Fonctions principales

| Fonction | Acces | Description |
|----------|-------|-------------|
| `drip()` | Public | Demander des tokens |
| `canDrip(address)` | Public | Verifier eligibilite |
| `getStats()` | Public | Statistiques du faucet |
| `getUserStats(address)` | Public | Statistiques utilisateur |
| `fund(amount)` | Public | Financer le faucet |
| `setDripAmount(amount)` | Owner | Modifier le montant |
| `setCooldownTime(time)` | Owner | Modifier le cooldown |
| `pause() / unpause()` | Owner | Pause d'urgence |

### Evenements

```solidity
event TokensDripped(address indexed recipient, uint256 amount);
event FaucetFunded(address indexed funder, uint256 amount);
event DripAmountUpdated(uint256 oldAmount, uint256 newAmount);
event CooldownUpdated(uint256 oldCooldown, uint256 newCooldown);
```

---

## MultiSigWallet.sol - Portefeuille Multi-Signatures

### Description
Portefeuille necessitant plusieurs signatures pour executer des transactions.

### Caracteristiques

| Propriete | Description |
|-----------|-------------|
| **Signataires** | Configurable au deploiement |
| **Seuil requis** | Nombre de confirmations necessaires |
| **Revocation** | Possibilite d'annuler sa confirmation |
| **Gouvernance** | Ajout/suppression de signataires |

### Fonctions principales

#### Transactions

| Fonction | Description |
|----------|-------------|
| `submitTransaction(to, value, data)` | Proposer une transaction |
| `confirmTransaction(txIndex)` | Confirmer une transaction |
| `revokeConfirmation(txIndex)` | Revoquer sa confirmation |
| `executeTransaction(txIndex)` | Executer si assez de signatures |

#### Gouvernance

| Fonction | Description |
|----------|-------------|
| `addOwner(address)` | Ajouter un signataire |
| `removeOwner(address)` | Retirer un signataire |
| `changeRequirement(required)` | Modifier le seuil |

### Evenements

```solidity
event SubmitTransaction(address indexed owner, uint256 indexed txIndex, address indexed to, uint256 value, bytes data);
event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);
event OwnerAdded(address indexed owner);
event OwnerRemoved(address indexed owner);
event RequirementChanged(uint256 required);
```

---

## Tests

### Fichiers de test

| Fichier | Tests | Description |
|---------|-------|-------------|
| `Token42.test.ts` | 14 | Token ERC20 de base |
| `MiningContract.test.ts` | 16 | Systeme de minage |
| `Faucet.test.ts` | 13 | Distribution de tokens |
| `MultiSigWallet.test.ts` | 21 | Multi-signatures |

### Commandes

```bash
# Tous les tests
pnpm test

# Avec couverture
pnpm coverage

# Avec rapport gas
REPORT_GAS=true pnpm test
```

---

## Deploiement

### Parametres des constructeurs

#### MaxToken42Mining
```solidity
constructor(uint256 _initialSupply)
// _initialSupply: 1000000000000000000000000 (1M en wei)
```

#### MiningContract
```solidity
constructor(address _token)
// _token: Adresse du MaxToken42Mining
```

#### Faucet
```solidity
constructor(address _token)
// _token: Adresse du MaxToken42Mining
```

#### MultiSigWallet
```solidity
constructor(address[] _owners, uint256 _required)
// _owners: Tableau des adresses signataires
// _required: Nombre de signatures requises
```

### Verification sur BSCScan

```bash
# MaxToken42Mining
pnpm exec hardhat verify --network bsc <ADDRESS> "1000000000000000000000000"

# MiningContract
pnpm exec hardhat verify --network bsc <ADDRESS> <TOKEN_ADDRESS>

# Faucet
pnpm exec hardhat verify --network bsc <ADDRESS> <TOKEN_ADDRESS>

# MultiSigWallet
pnpm exec hardhat verify --network bsc <ADDRESS> '["0x...", "0x..."]' 2
```

---

## Securite

### Protections implementees

| Contrat | Protections |
|---------|-------------|
| MaxToken42Mining | AccessControl, Supply cap |
| MiningContract | ReentrancyGuard, Pausable, Ownable |
| Faucet | ReentrancyGuard, Pausable, Ownable, Cooldown |
| MultiSigWallet | ReentrancyGuard, Multi-sig |

### Recommandations

- Faire auditer les contrats avant deploiement mainnet
- Utiliser un hardware wallet pour les cles de deploiement
- Tester exhaustivement sur testnet
- Configurer le MultiSig avec plusieurs signataires de confiance
