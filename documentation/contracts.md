# 📋 Documentation des Smart Contracts

Documentation technique détaillée des contrats Solidity du projet Tokenizer42.

## 📊 Vue d'ensemble

Le projet contient deux smart contracts principaux :
- **Token42.sol** : Token ERC20 standard
- **MultiSig42.sol** : Contrat de multisignature

---

## 🪙 Token42.sol - Token ERC20

### Description
Token ERC20 standard basé sur OpenZeppelin avec un supply fixe de 1 million de tokens.

### Caractéristiques techniques

| Propriété | Valeur | Description |
|-----------|--------|-------------|
| **Nom** | Token42 | Nom complet du token |
| **Symbole** | TK42 | Symbole de trading |
| **Décimales** | 18 | Précision (standard ERC20) |
| **Supply total** | 1,000,000 TK42 | Supply fixe au déploiement |
| **Mintable** | ❌ Non | Aucune fonction de création |
| **Burnable** | ❌ Non | Aucune fonction de destruction |
| **Pausable** | ❌ Non | Pas de mécanisme de pause |
| **Ownable** | ❌ Non | Pas de propriétaire privilégié |

### Code source

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token42 is ERC20 {
    constructor(uint256 initialSupply) ERC20("Token42", "TK42") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
}
```

### Fonctions héritées (OpenZeppelin ERC20)

#### Fonctions de lecture

| Fonction | Paramètres | Retour | Description |
|----------|------------|--------|-------------|
| `name()` | - | `string` | Retourne "Token42" |
| `symbol()` | - | `string` | Retourne "TK42" |
| `decimals()` | - | `uint8` | Retourne 18 |
| `totalSupply()` | - | `uint256` | Supply total en wei |
| `balanceOf(address)` | `account` | `uint256` | Solde d'un compte |
| `allowance(address,address)` | `owner, spender` | `uint256` | Allowance autorisée |

#### Fonctions d'écriture

| Fonction | Paramètres | Description |
|----------|------------|-------------|
| `transfer(address,uint256)` | `to, amount` | Transférer des tokens |
| `approve(address,uint256)` | `spender, amount` | Approuver une allowance |
| `transferFrom(address,address,uint256)` | `from, to, amount` | Transfert délégué |

### Événements émis

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
event Approval(address indexed owner, address indexed spender, uint256 value);
```

### Sécurité

#### ✅ Points forts
- **OpenZeppelin** : Utilise des contrats audités et sécurisés
- **Supply fixe** : Pas de risque d'inflation incontrôlée
- **Simplicité** : Code minimal, moins de surface d'attaque
- **Standard ERC20** : Compatible avec tous les wallets et DEX

#### ⚠️ Considérations
- **Pas de burn** : Les tokens ne peuvent pas être détruits
- **Pas de pause** : Impossible d'arrêter les transferts
- **Décentralisé** : Aucun contrôle administrateur après déploiement

### Gas costs (estimations)

| Opération | Gas estimé | Description |
|-----------|------------|-------------|
| **Déploiement** | ~500,000 | Création du contrat |
| **Transfer** | ~21,000 | Transfert simple |
| **Approve** | ~22,000 | Approbation |
| **TransferFrom** | ~23,000 | Transfert délégué |

---

## 🔐 MultiSig42.sol - Contrat MultiSig

### Description
Contrat de multisignature permettant de sécuriser des transactions importantes en nécessitant l'approbation de plusieurs signataires.

### Caractéristiques principales

| Propriété | Valeur | Description |
|-----------|--------|-------------|
| **Signataires max** | Configurable | Défini au déploiement |
| **Seuil requis** | Configurable | Nombre de signatures nécessaires |
| **Timelock** | Optionnel | Délai avant exécution |
| **Révocation** | ✅ Oui | Possibilité d'annuler une transaction |

### Architecture

```
MultiSig42
├── Gestion des signataires
├── Soumission de transactions
├── Approbation/Révocation
└── Exécution sécurisée
```

### Fonctions principales

#### Gestion des signataires

```solidity
function addOwner(address owner) external
function removeOwner(address owner) external
function replaceOwner(address oldOwner, address newOwner) external
function changeRequirement(uint requirement) external
```

#### Gestion des transactions

```solidity
function submitTransaction(address destination, uint value, bytes data) external
function confirmTransaction(uint transactionId) external
function revokeConfirmation(uint transactionId) external
function executeTransaction(uint transactionId) external
```

### États des transactions

| État | Description |
|------|-------------|
| **Pending** | En attente de signatures |
| **Executed** | Exécutée avec succès |
| **Failed** | Échec d'exécution |

### Événements

```solidity
event Confirmation(address indexed sender, uint indexed transactionId);
event Revocation(address indexed sender, uint indexed transactionId);
event Submission(uint indexed transactionId);
event Execution(uint indexed transactionId);
event ExecutionFailure(uint indexed transactionId);
```

### Cas d'usage recommandés

#### 🎯 Treasury management
- Gestion des fonds du projet
- Transferts importants
- Paiements aux équipes

#### 🔧 Governance
- Modifications de paramètres
- Mises à jour de contrats
- Décisions stratégiques

#### 🛡️ Sécurité
- Protection contre les clés compromises
- Validation collective
- Audit trail transparent

---

## 🧪 Tests et vérification

### Couverture des tests

#### Token42
- ✅ Déploiement correct
- ✅ Supply et allocation initiale
- ✅ Transferts standards
- ✅ Système d'allowances
- ✅ Gestion des erreurs
- ✅ Émission d'événements

#### MultiSig42
- ✅ Gestion des propriétaires
- ✅ Soumission de transactions
- ✅ Processus d'approbation
- ✅ Exécution sécurisée
- ✅ Révocation de signatures

### Scénarios de test

```bash
# Lancer tous les tests
pnpm test

# Tests avec couverture
pnpm run coverage

# Tests avec rapport gas
REPORT_GAS=true pnpm test
```

---

## 🚀 Déploiement

### Paramètres de déploiement

#### Token42
```solidity
constructor(uint256 initialSupply)
```
- `initialSupply` : 1000000 (1 million de tokens)

#### MultiSig42
```solidity
constructor(address[] _owners, uint _required)
```
- `_owners` : Array des adresses des signataires
- `_required` : Nombre de signatures requises

### Vérification sur BSCScan

```bash
# Vérifier Token42
npx hardhat verify --network bsc <CONTRACT_ADDRESS> 1000000

# Vérifier MultiSig42
npx hardhat verify --network bsc <CONTRACT_ADDRESS> ["0x...", "0x..."] 2
```

---

## 📚 Ressources complémentaires

### Standards utilisés
- [EIP-20](https://eips.ethereum.org/EIPS/eip-20) - Standard ERC20
- [OpenZeppelin ERC20](https://docs.openzeppelin.com/contracts/4.x/erc20)
- [MultiSig Best Practices](https://blog.openzeppelin.com/on-the-security-of-gnosis-safe-smart-contracts/)

### Outils de développement
- [Hardhat](https://hardhat.org/) - Framework de développement
- [OpenZeppelin](https://openzeppelin.com/) - Librairies sécurisées
- [Ethers.js](https://docs.ethers.io/) - Librairie JavaScript

### Audit et sécurité
- [Consensys Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Solidity Security](https://github.com/sigp/solidity-security-blog)

---

## ⚠️ Avertissements de sécurité

### Token42
- **Pas de burn** : Les tokens ne peuvent pas être détruits
- **Supply fixe** : Aucune possibilité d'augmenter le supply
- **Décentralisé** : Aucun contrôle administrateur

### MultiSig42
- **Clés de signature** : Sécuriser absolument les clés privées
- **Seuil de signature** : Choisir un équilibre sécurité/praticité
- **Test complet** : Tester tous les scénarios avant production

**Recommandation** : Faire auditer les contrats avant tout déploiement en production avec des fonds réels.