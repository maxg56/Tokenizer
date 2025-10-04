# 🚀 Guide de déploiement - Tokenizer42

Guide complet pour déployer les smart contracts Token42 et MultiSig42 sur différents réseaux.

## 📋 Pré-requis

### Outils nécessaires
- **Node.js** ≥ 16.0.0
- **pnpm** ou npm
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
🚀 Deploying Token42 with account: 0x...
💰 Account balance: 10000.0 ETH
✅ Token42 deployed to: 0x5FbDB2315678...
📊 Initial supply: 1000000 TK42
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
- **Token42** : ~0.002 BNB (≈ $0.50)
- **MultiSig42** : ~0.005 BNB (≈ $1.25)
- **Total** : ~0.01 BNB (≈ $2.50)

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
pnpm exec hardhat run scripts/deploy.ts --network bsc
```

### 4. Vérification sur BSCScan
```bash
# Vérifier le contrat (optionnel mais recommandé)
npx hardhat verify --network bsc <CONTRACT_ADDRESS> 1000000
```

---

## 🔍 Vérification des contrats

### Pourquoi vérifier ?
- **Transparence** : Le code source devient public
- **Confiance** : Les utilisateurs peuvent vérifier le code
- **Interaction** : Interface BSCScan pour interagir avec le contrat

### Token42
```bash
npx hardhat verify --network bsctest <TOKEN_ADDRESS> 1000000
```

### MultiSig42
```bash
npx hardhat verify --network bsctest <MULTISIG_ADDRESS> \
  ["0xSignataire1", "0xSignataire2", "0xSignataire3"] 2
```

### Exemple de vérification réussie
```
Successfully submitted source code for contract
contracts/Token42.sol:Token42 at 0x1234...
for verification on the block explorer.
Waiting for verification result...

Successfully verified contract Token42 on Etherscan.
https://testnet.bscscan.com/address/0x1234...#code
```

---

## 📊 Scripts de déploiement avancés

### Script personnalisé MultiSig
```typescript
// scripts/deploy-multisig.ts
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  // Adresses des signataires
  const owners = [
    "0x...", // Signataire 1
    "0x...", // Signataire 2
    "0x...", // Signataire 3
  ];

  const requiredSignatures = 2; // 2 sur 3

  const MultiSig42 = await ethers.getContractFactory("MultiSig42");
  const multisig = await MultiSig42.deploy(owners, requiredSignatures);

  await multisig.waitForDeployment();

  console.log("🔐 MultiSig42 deployed:", await multisig.getAddress());
  console.log("👥 Owners:", owners.length);
  console.log("✅ Required signatures:", requiredSignatures);
}
```

### Script de déploiement complet
```typescript
// scripts/deploy-all.ts
async function deployAll() {
  // 1. Déployer Token42
  const token = await deployToken42(1_000_000);

  // 2. Déployer MultiSig42
  const multisig = await deployMultiSig42(owners, 2);

  // 3. Transférer une partie des tokens au MultiSig
  await token.transfer(multisig.address, parseUnits("500000", 18));

  console.log("🎉 Déploiement complet terminé !");
  console.log("Token42:", token.address);
  console.log("MultiSig42:", multisig.address);
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
# Token42 : initialSupply doit être > 0
# MultiSig42 : owners.length >= required && required > 0
```

### Logs de déploiement

#### Succès ✅
```
🚀 Deploying Token42 with account: 0x742d35Cc6523...
💰 Account balance: 0.1 BNB
⛽ Gas price: 5 gwei
✅ Token42 deployed to: 0x1234567890abcdef...
📊 Initial supply: 1000000 TK42
🔗 Transaction: 0xabcdef1234567890...
⏱️  Deployment time: 15 seconds
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
npx hardhat console --network bsctest

# Dans la console :
const token = await ethers.getContractAt("Token42", "0x...");
await token.name(); // "Token42"
await token.symbol(); // "TK42"
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