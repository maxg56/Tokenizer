# 🚀 Guide de déploiement - Tokenizer42

Guide complet pour déployer les smart contracts MaxToken42Mining, MiningContract, Faucet et MultiSigWallet sur différents réseaux.

## 📋 Pré-requis

### Outils nécessaires
- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 9
- **Metamask** ou wallet compatible
- **Git** pour cloner le projet

### Comptes requis
- **Wallet Metamask** avec BNB pour les frais de gas
- **BSCScan API Key** (optionnel, pour vérification)

---

## 🛠️ Installation

### 1. Cloner et installer
```bash
git clone <your-repo-url>
cd Tokenizer/code
pnpm install
```

### 2. Configuration environnement
```bash
cp .env.example .env
```

Éditer `.env` :
```bash
# Clé privée de ton wallet (SANS le 0x)
PRIVATE_KEY=your_private_key_here

# API Key BSCScan (pour vérification)
BSCSCAN_API_KEY=your_api_key_here

# Rapport gas (optionnel)
REPORT_GAS=true
```

### 3. Obtenir ta clé privée

#### Metamask
1. Ouvrir Metamask
2. Cliquer sur les 3 points → Détails du compte
3. Exporter la clé privée
4. **⚠️ ATTENTION : Ne jamais partager cette clé !**

---

## 🌐 Réseaux disponibles

| Réseau | Chain ID | RPC | Gas Token | Usage |
|--------|----------|-----|-----------|-------|
| **Hardhat Local** | 1337 | http://127.0.0.1:8545 | ETH (fictif) | Développement |
| **BSC Testnet** | 97 | https://data-seed-prebsc-1-s1.binance.org:8545/ | tBNB (gratuit) | Tests |
| **BSC Mainnet** | 56 | https://bsc-dataseed1.binance.org/ | BNB (réel) | Production |

---

## 🧪 Déploiement Local (Développement)

### 1. Lancer le nœud local
```bash
# Terminal 1
pnpm node
```

### 2. Déployer les contrats
```bash
# Terminal 2
pnpm run deploy:local
```

### 3. Résultat attendu
```
============================================================
MaxToken42 Complete System Deployment
============================================================
Deployer: 0x...
Balance: 10000.0 ETH

Contract Addresses:
  Token (MTK42):     0x...
  Mining Contract:   0x...
  Faucet:            0x...
  MultiSig Wallet:   0x...
```

### 4. Tester l'intégration
```bash
pnpm test
```

---

## 🔧 Déploiement BSC Testnet

### 1. Obtenir des tBNB gratuits
- [BSC Testnet Faucet](https://testnet.binance.org/faucet-smart)
- Connecter Metamask sur BSC Testnet
- Demander 0.1 tBNB (suffisant pour plusieurs déploiements)

### 2. Ajouter BSC Testnet à Metamask

| Paramètre | Valeur |
|-----------|--------|
| **Nom du réseau** | BSC Testnet |
| **URL RPC** | https://data-seed-prebsc-1-s1.binance.org:8545/ |
| **Chain ID** | 97 |
| **Symbole** | tBNB |
| **Explorateur** | https://testnet.bscscan.com |

### 3. Compiler et déployer
```bash
# Compiler les contrats
pnpm compile

# Déployer sur BSC Testnet
pnpm run deploy:bsctest
```

### 4. Vérifier le déploiement
- Copier l'adresse du contrat depuis la console
- Aller sur [testnet.bscscan.com](https://testnet.bscscan.com)
- Rechercher l'adresse pour voir le contrat

---

## 🏭 Déploiement BSC Mainnet (Production)

### ⚠️ Checklist de sécurité OBLIGATOIRE

- [ ] **Contrats testés** sur Testnet avec succès
- [ ] **Tests unitaires** passent à 100%
- [ ] **Code audité** par des experts (recommandé)
- [ ] **Clé privée sécurisée** (hardware wallet recommandé)
- [ ] **BNB suffisant** pour les frais de gas (≥ 0.01 BNB)
- [ ] **Backup** de la clé privée et du projet

### 1. Calcul des coûts
```bash
# Estimer le gas nécessaire
pnpm compile
REPORT_GAS=true pnpm test
```

**Estimation des coûts (BSC Mainnet) :**
- **MaxToken42Mining** : ~0.002 BNB (≈ $0.50)
- **MiningContract** : ~0.003 BNB (≈ $0.75)
- **Faucet** : ~0.002 BNB (≈ $0.50)
- **MultiSigWallet** : ~0.005 BNB (≈ $1.25)
- **Total** : ~0.015 BNB (≈ $3.75)

### 2. Configuration réseau BSC Mainnet

| Paramètre | Valeur |
|-----------|--------|
| **Nom du réseau** | BSC Mainnet |
| **URL RPC** | https://bsc-dataseed1.binance.org/ |
| **Chain ID** | 56 |
| **Symbole** | BNB |
| **Explorateur** | https://bscscan.com |

### 3. Déploiement final
```bash
# ⚠️ ATTENTION : Ceci utilise de vrais BNB !
pnpm deploy:bsc
```

### 4. Vérification sur BSCScan
```bash
# Vérifier le token (avec l'initial supply en wei)
pnpm exec hardhat verify --network bsc <TOKEN_ADDRESS> "1000000000000000000000000"

# Vérifier le MiningContract (avec l'adresse du token)
pnpm exec hardhat verify --network bsc <MINING_ADDRESS> <TOKEN_ADDRESS>

# Vérifier le Faucet (avec l'adresse du token)
pnpm exec hardhat verify --network bsc <FAUCET_ADDRESS> <TOKEN_ADDRESS>
```

---

## 🔍 Vérification des contrats

### Pourquoi vérifier ?
- **Transparence** : Le code source devient public
- **Confiance** : Les utilisateurs peuvent vérifier le code
- **Interaction** : Interface BSCScan pour interagir avec le contrat

### MaxToken42Mining
```bash
pnpm exec hardhat verify --network bsctest <TOKEN_ADDRESS> "1000000000000000000000000"
```

### MultiSigWallet
```bash
pnpm exec hardhat verify --network bsctest <MULTISIG_ADDRESS> \
  '["0xSignataire1", "0xSignataire2", "0xSignataire3"]' 2
```

### Exemple de vérification réussie
```
Successfully submitted source code for contract
contracts/MaxToken42Mining.sol:MaxToken42Mining at 0x1234...
for verification on the block explorer.
Waiting for verification result...

Successfully verified contract MaxToken42Mining on BSCScan.
https://testnet.bscscan.com/address/0x1234...#code
```

---

## 📊 Scripts de déploiement

Le projet inclut plusieurs scripts de déploiement :

| Script | Commande | Description |
|--------|----------|-------------|
| `deployAll.ts` | `pnpm deploy:local` | Déploie tous les contrats (Token, Mining, Faucet, MultiSig) |
| `deployMining.ts` | `pnpm deploy:mining:local` | Déploie uniquement Token + Mining |
| `deploy.ts` | `pnpm deploy:token:local` | Déploie uniquement le Token |

### Exemple : Déploiement personnalisé MultiSig
```typescript
// scripts/deploy-multisig.ts
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  // Adresses des signataires (production)
  const owners = [
    "0x...", // Signataire 1
    "0x...", // Signataire 2
    "0x...", // Signataire 3
  ];

  const requiredSignatures = 2; // 2 sur 3

  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
  const multisig = await MultiSigWallet.deploy(owners, requiredSignatures);

  await multisig.waitForDeployment();

  console.log("🔐 MultiSigWallet deployed:", await multisig.getAddress());
  console.log("👥 Owners:", owners.length);
  console.log("✅ Required signatures:", requiredSignatures);
}
```

---

## 🚨 Troubleshooting

### Erreurs communes

#### "Insufficient funds for gas"
```bash
# Solution : Ajouter plus de BNB/tBNB sur ton wallet
# BSC Testnet : Utiliser le faucet
# BSC Mainnet : Acheter des BNB sur un exchange
```

#### "Nonce too high"
```bash
# Solution : Reset ton wallet
# Metamask > Settings > Advanced > Reset Account
```

#### "Contract creation code storage out of gas"
```bash
# Solution : Augmenter la limite de gas
# hardhat.config.ts > networks > bsc > gas: 10000000
```

#### "Reverted with reason string 'xxx'"
```bash
# Solution : Vérifier les paramètres du constructeur
# MaxToken42Mining : initialSupply doit être > 0
# MultiSigWallet : owners.length >= required && required > 0
```

### Logs de déploiement

#### Succès ✅
```
============================================================
MaxToken42 Complete System Deployment
============================================================
Deployer: 0x742d35Cc6523...
Balance: 0.1 BNB

Contract Addresses:
  Token (MTK42):     0x1234...
  Mining Contract:   0x5678...
  Faucet:            0x9abc...
  MultiSig Wallet:   0xdef0...

Deployment completed successfully!
============================================================
```

#### Échec ❌
```
❌ Deployment failed: Error: insufficient funds for gas
💡 Solution: Add more BNB to wallet: 0x742d35Cc6523...
🔗 Current balance: 0.001 BNB
⛽ Required: ~0.01 BNB
```

---

## 📈 Post-déploiement

### Actions recommandées après déploiement

#### 1. Documentation
- [ ] Noter les adresses des contrats
- [ ] Sauvegarder les paramètres de déploiement
- [ ] Documenter la configuration MultiSig

#### 2. Tests de validation
```bash
# Tester les fonctions de base
pnpm exec hardhat console --network bsctest

# Dans la console :
const token = await ethers.getContractAt("MaxToken42Mining", "0x...");
await token.name(); // "MaxToken42"
await token.symbol(); // "MTK42"
await token.totalSupply(); // "1000000000000000000000000"
```

#### 3. Sécurité
- [ ] Déconnection sécurisée de la clé privée de déploiement
- [ ] Configuration du MultiSig avec les vraies clés de l'équipe
- [ ] Test des procédures de récupération

#### 4. Monitoring
- [ ] Surveillance des transactions sur BSCScan
- [ ] Alertes pour les gros transferts
- [ ] Monitoring de l'activité du contrat

---

## 📞 Support et ressources

### Documentation officielle
- [Hardhat Deployment](https://hardhat.org/tutorial/deploying-to-a-live-network.html)
- [BSC Developer Guide](https://docs.bnbchain.org/docs/getting-started/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

### Communauté
- [BSC Discord](https://discord.gg/bnbchain)
- [Hardhat Discord](https://hardhat.org/discord)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/solidity)

### Urgences
En cas de problème critique après déploiement :
1. **Ne pas paniquer** 🧘‍♂️
2. **Documenter le problème** avec screenshots
3. **Contacter l'équipe** avec tous les détails
4. **Ne pas essayer de "réparer"** sans expertise

---

## ✅ Checklist finale

### Avant déploiement Mainnet
- [ ] Tests passent à 100%
- [ ] Code vérifié par un expert
- [ ] Paramètres de déploiement validés
- [ ] BNB suffisant sur le wallet
- [ ] Backup de toutes les clés
- [ ] Plan de communication prêt

### Après déploiement
- [ ] Contrats vérifiés sur BSCScan
- [ ] Adresses documentées et sauvegardées
- [ ] Tests de validation effectués
- [ ] Équipe notifiée du succès
- [ ] Marketing/communication lancé

**🎉 Félicitations ! Tes contrats sont maintenant déployés sur la blockchain BSC !**