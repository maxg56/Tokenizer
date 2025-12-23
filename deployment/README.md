# 📋 Informations de Déploiement - MaxToken42

Ce dossier contient toutes les informations relatives aux déploiements des smart contracts sur les différents réseaux.

---

## 🌐 Réseau de Déploiement

**Blockchain utilisée** : **BNB Smart Chain (BSC)**
**Standard de token** : **BEP-20** (compatible ERC-20)
**Environnement** : **Testnet** (BSC Testnet)

---

## 📍 Adresses des Contrats Déployés

### BSC Testnet (Chain ID: 97)

> ⚠️ **STATUS** : Contrats prêts pour déploiement
> Les contrats n'ont pas encore été déployés sur le testnet public.
> Une fois déployés, les adresses seront documentées ci-dessous.

| Contrat | Adresse | Explorer |
|---------|---------|----------|
| **MaxToken42Mining** | `À déployer` | [BSCScan Testnet](https://testnet.bscscan.com) |
| **MiningContract** | `À déployer` | [BSCScan Testnet](https://testnet.bscscan.com) |
| **Faucet** | `À déployer` | [BSCScan Testnet](https://testnet.bscscan.com) |
| **MultiSigWallet** | `À déployer` | [BSCScan Testnet](https://testnet.bscscan.com) |

---

## 🔧 Paramètres de Déploiement

### MaxToken42Mining (Token)
```solidity
constructor(uint256 _initialSupply)
```
- **Initial Supply** : `1,000,000 MTK42` (1000000000000000000000000 wei)
- **Max Supply** : `10,000,000 MTK42`
- **Deployer** : Reçoit l'initial supply et les rôles admin

### MiningContract
```solidity
constructor(address _token)
```
- **Token Address** : Adresse du MaxToken42Mining déployé
- **Base Reward** : `100 MTK42` par bloc
- **Initial Difficulty** : `1000`
- **Target Block Time** : `5 minutes`

### Faucet
```solidity
constructor(address _token)
```
- **Token Address** : Adresse du MaxToken42Mining déployé
- **Drip Amount** : `100 MTK42` par demande
- **Cooldown** : `24 heures`
- **Daily Limit** : `1000 demandes`

### MultiSigWallet
```solidity
constructor(address[] _owners, uint256 _required)
```
- **Owners** : `[0x..., 0x..., 0x...]` (3 signataires)
- **Required Signatures** : `2` (2 sur 3)

---

## 🚀 Procédure de Déploiement

### Pré-requis
- Node.js >= 20
- pnpm >= 9
- Wallet avec tBNB (BSC Testnet)
- API Key BSCScan (pour vérification)

### Étapes

1. **Configuration**
   ```bash
   cd code
   cp .env.example .env
   # Éditer .env avec PRIVATE_KEY et BSCSCAN_API_KEY
   ```

2. **Compilation**
   ```bash
   pnpm compile
   ```

3. **Tests**
   ```bash
   pnpm test
   # Doit passer les 64 tests
   ```

4. **Déploiement sur BSC Testnet**
   ```bash
   pnpm deploy:bsctest
   ```

5. **Vérification sur BSCScan**
   ```bash
   # Token
   pnpm exec hardhat verify --network bsctest <TOKEN_ADDRESS> "1000000000000000000000000"

   # Mining
   pnpm exec hardhat verify --network bsctest <MINING_ADDRESS> <TOKEN_ADDRESS>

   # Faucet
   pnpm exec hardhat verify --network bsctest <FAUCET_ADDRESS> <TOKEN_ADDRESS>

   # MultiSig
   pnpm exec hardhat verify --network bsctest <MULTISIG_ADDRESS> '["0x...","0x...","0x..."]' 2
   ```

---

## 📊 Informations du Réseau BSC Testnet

| Paramètre | Valeur |
|-----------|--------|
| **Nom du réseau** | BSC Testnet |
| **URL RPC** | https://data-seed-prebsc-1-s1.binance.org:8545/ |
| **Chain ID** | 97 |
| **Symbole de gas** | tBNB |
| **Explorateur** | https://testnet.bscscan.com |
| **Faucet** | https://testnet.binance.org/faucet-smart |

---

## ✅ Vérification Post-Déploiement

Une fois les contrats déployés, vérifier :

- [ ] Tous les contrats sont visibles sur BSCScan Testnet
- [ ] Le code source est vérifié sur BSCScan (icône verte ✓)
- [ ] Le token apparaît avec le bon nom "MaxToken42" et symbole "MTK42"
- [ ] Les transactions de déploiement sont confirmées
- [ ] Le MiningContract a le rôle MINER_ROLE sur le token
- [ ] Le Faucet est financé avec des tokens
- [ ] Le MultiSigWallet est configuré avec les bons signataires

---

## 🔒 Sécurité

### Bonnes pratiques suivies
- ✅ Déploiement sur **testnet uniquement** (pas d'argent réel)
- ✅ Utilisation d'OpenZeppelin 5.0 (contrats audités)
- ✅ AccessControl pour les permissions
- ✅ ReentrancyGuard sur les fonctions critiques
- ✅ Supply cap pour éviter l'inflation
- ✅ MultiSig pour la gouvernance

### Recommandations avant mainnet
- Faire auditer les contrats par un expert en sécurité
- Tester exhaustivement toutes les fonctionnalités
- Utiliser un hardware wallet pour les clés de production
- Configurer le MultiSig avec des clés séparées géographiquement

---

## 📝 Historique des Déploiements

| Date | Réseau | Version | Déployeur | Notes |
|------|--------|---------|-----------|-------|
| *À venir* | BSC Testnet | 1.0.0 | TBD | Déploiement initial |

---

## 🔗 Liens Utiles

- [Documentation BSC](https://docs.bnbchain.org/)
- [Guide Hardhat](https://hardhat.org/tutorial/deploying-to-a-live-network)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/contracts/)
- [BSCScan Testnet](https://testnet.bscscan.com)

---

## ⚠️ Note Importante

**Ce projet est à des fins éducatives et de test.**
Les contrats sont déployés sur testnet et n'utilisent que des tokens de test (tBNB) sans valeur réelle.

Pour toute question sur le déploiement, consulter `/documentation/deployment-guide.md`.
