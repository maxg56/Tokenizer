# ✅ Checklist de Déploiement - MaxToken42

Checklist complète pour valider le déploiement des smart contracts sur BSC Testnet.

---

## 📋 Pré-Déploiement

### Environnement
- [ ] Node.js >= 20 installé
- [ ] pnpm >= 9 installé
- [ ] Git repository à jour

### Configuration
- [ ] Fichier `.env` créé dans `/code`
- [ ] `PRIVATE_KEY` configurée (sans 0x)
- [ ] `BSCSCAN_API_KEY` configurée
- [ ] Wallet ajouté à Metamask

### Fonds
- [ ] Wallet possède au moins 0.1 tBNB
- [ ] Faucet BSC Testnet utilisé : https://testnet.binance.org/faucet-smart
- [ ] Balance vérifiée : `npx hardhat console --network bsctest`

### Tests
- [ ] Compilation réussie : `pnpm compile`
- [ ] Tous les tests passent : `pnpm test` (64/64 ✓)
- [ ] Aucune erreur de sécurité détectée
- [ ] Gas report généré : `REPORT_GAS=true pnpm test`

---

## 🚀 Déploiement

### Ordre de déploiement

#### 1. MaxToken42Mining (Token)
```bash
# Déployer avec pnpm deploy:bsctest ou manuellement
npx hardhat run scripts/deploy.ts --network bsctest
```

- [ ] Transaction confirmée
- [ ] Adresse du contrat notée
- [ ] Supply initial vérifié (1M MTK42)
- [ ] Deployer possède les tokens
- [ ] Deployer a le rôle DEFAULT_ADMIN_ROLE
- [ ] Deployer a le rôle MINER_ROLE

#### 2. MiningContract
```bash
# Utiliser l'adresse du token déployé
```

- [ ] Transaction confirmée
- [ ] Adresse du contrat notée
- [ ] Token address configurée correctement
- [ ] MINER_ROLE accordé au MiningContract
  ```bash
  token.addMiner(miningContractAddress)
  ```

#### 3. Faucet
```bash
# Utiliser l'adresse du token déployé
```

- [ ] Transaction confirmée
- [ ] Adresse du contrat notée
- [ ] Token address configurée correctement
- [ ] Faucet financé avec au moins 10,000 MTK42
  ```bash
  token.transfer(faucetAddress, "10000000000000000000000")
  ```

#### 4. MultiSigWallet (Optionnel - Bonus)
```bash
# Définir les signataires et le quorum
const owners = ["0x...", "0x...", "0x..."]
const required = 2
```

- [ ] Transaction confirmée
- [ ] Adresse du contrat notée
- [ ] Owners configurés correctement
- [ ] Required signatures = 2
- [ ] Fonctionnalité testée (submit + confirm + execute)

---

## ✅ Vérification sur BSCScan

### MaxToken42Mining
```bash
npx hardhat verify --network bsctest <TOKEN_ADDRESS> "1000000000000000000000000"
```

- [ ] Code vérifié avec succès
- [ ] Onglet "Contract" visible sur BSCScan
- [ ] Onglet "Read Contract" accessible
- [ ] Onglet "Write Contract" accessible
- [ ] Nom affiché : "MaxToken42"
- [ ] Symbole affiché : "MTK42"
- [ ] Total Supply : 1,000,000 MTK42

### MiningContract
```bash
npx hardhat verify --network bsctest <MINING_ADDRESS> <TOKEN_ADDRESS>
```

- [ ] Code vérifié avec succès
- [ ] Token address correcte dans le contrat
- [ ] Base reward = 100 MTK42
- [ ] Difficulty = 1000

### Faucet
```bash
npx hardhat verify --network bsctest <FAUCET_ADDRESS> <TOKEN_ADDRESS>
```

- [ ] Code vérifié avec succès
- [ ] Token address correcte
- [ ] Drip amount = 100 MTK42
- [ ] Cooldown = 24 heures
- [ ] Balance du faucet > 0

### MultiSigWallet
```bash
npx hardhat verify --network bsctest <MULTISIG_ADDRESS> '["0x...","0x...","0x..."]' 2
```

- [ ] Code vérifié avec succès
- [ ] Owners listés correctement
- [ ] Required = 2

---

## 🧪 Tests Post-Déploiement

### Token (MaxToken42Mining)

```javascript
// Dans hardhat console --network bsctest
const token = await ethers.getContractAt("MaxToken42Mining", "<TOKEN_ADDRESS>")
```

- [ ] `await token.name()` → "MaxToken42"
- [ ] `await token.symbol()` → "MTK42"
- [ ] `await token.decimals()` → 18
- [ ] `await token.totalSupply()` → 1000000000000000000000000
- [ ] `await token.MAX_SUPPLY()` → 10000000000000000000000000
- [ ] `await token.balanceOf("<DEPLOYER>")` > 0

### MiningContract

```javascript
const mining = await ethers.getContractAt("MiningContract", "<MINING_ADDRESS>")
```

- [ ] `await mining.token()` → <TOKEN_ADDRESS>
- [ ] `await mining.baseReward()` → 100 MTK42
- [ ] `await mining.difficulty()` → 1000
- [ ] `await mining.owner()` → <DEPLOYER>
- [ ] Token a accordé MINER_ROLE au contrat
  ```javascript
  await token.hasRole(await token.MINER_ROLE(), "<MINING_ADDRESS>")
  ```

### Faucet

```javascript
const faucet = await ethers.getContractAt("Faucet", "<FAUCET_ADDRESS>")
```

- [ ] `await faucet.token()` → <TOKEN_ADDRESS>
- [ ] `await faucet.dripAmount()` → 100 MTK42
- [ ] `await faucet.cooldownTime()` → 86400 (24h)
- [ ] `await token.balanceOf("<FAUCET_ADDRESS>")` > 0
- [ ] Test drip() fonctionne
  ```javascript
  await faucet.drip()
  ```

### MultiSigWallet

```javascript
const multisig = await ethers.getContractAt("MultiSigWallet", "<MULTISIG_ADDRESS>")
```

- [ ] `await multisig.getOwners()` → liste des owners
- [ ] `await multisig.required()` → 2
- [ ] Test submit transaction
- [ ] Test confirm transaction
- [ ] Test execute transaction (avec 2 confirmations)

---

## 📝 Documentation

### Mise à jour des fichiers

- [ ] `/deployment/addresses.json` mis à jour avec toutes les adresses
- [ ] `/deployment/README.md` mis à jour avec les liens BSCScan
- [ ] `/deployments.json` à la racine mis à jour
- [ ] README principal mis à jour avec les adresses de déploiement

### Screenshots recommandés

- [ ] Page BSCScan du token avec code vérifié
- [ ] Transaction de déploiement du token
- [ ] Interface "Read Contract" du token
- [ ] Interface "Write Contract" du token
- [ ] Balance du faucet sur BSCScan

---

## 🎯 Démonstration

### Actions de base à démontrer

#### 1. Création du token ✅
- [x] Token déployé sur BSC Testnet
- [x] Initial supply de 1M MTK42 créé
- [x] Deployer possède les tokens

#### 2. Transfert de tokens
```javascript
await token.transfer("0x...", ethers.parseEther("100"))
```
- [ ] Transaction réussie
- [ ] Balance du destinataire mise à jour
- [ ] Événement Transfer émis

#### 3. Minage de tokens
```javascript
await mining.startMining(50) // 50% de puissance
await mining.mineBlock(12345) // avec un nonce
```
- [ ] Mining démarré
- [ ] Bloc miné avec succès
- [ ] Reward reçu

#### 4. Faucet
```javascript
await faucet.drip()
```
- [ ] 100 MTK42 reçus
- [ ] Cooldown de 24h activé
- [ ] Ne peut pas drip immédiatement

#### 5. MultiSig (Bonus)
```javascript
await multisig.submitTransaction("0x...", 0, "0x")
await multisig.confirmTransaction(0) // signataire 1
// Changer de compte
await multisig.confirmTransaction(0) // signataire 2
await multisig.executeTransaction(0)
```
- [ ] Transaction soumise
- [ ] Confirmations collectées (2/2)
- [ ] Transaction exécutée

---

## 🔒 Sécurité Post-Déploiement

### Vérifications de sécurité

- [ ] Les clés privées sont sécurisées et sauvegardées
- [ ] Le fichier .env n'est pas commité sur Git
- [ ] Les adresses des contrats sont sauvegardées en multiple endroits
- [ ] Les transactions de déploiement sont confirmées (> 15 confirmations)
- [ ] Aucun fond réel (BNB mainnet) n'a été utilisé

### Audit rapide

- [ ] Vérifier que seul le owner peut appeler les fonctions admin
- [ ] Vérifier que seul MINER_ROLE peut minter
- [ ] Vérifier que MAX_SUPPLY ne peut pas être dépassé
- [ ] Tester la fonction pause() du Faucet
- [ ] Tester le système multisig avec plusieurs signataires

---

## 📊 Résumé Final

### Informations à documenter dans le README

```markdown
## 🌐 Déploiement

Les contrats sont déployés sur **BSC Testnet** :

| Contrat | Adresse | Explorer |
|---------|---------|----------|
| MaxToken42Mining | 0x... | [View on BSCScan](https://testnet.bscscan.com/address/0x...) |
| MiningContract | 0x... | [View on BSCScan](https://testnet.bscscan.com/address/0x...) |
| Faucet | 0x... | [View on BSCScan](https://testnet.bscscan.com/address/0x...) |
| MultiSigWallet | 0x... | [View on BSCScan](https://testnet.bscscan.com/address/0x...) |

**Réseau** : BSC Testnet (Chain ID: 97)
**Standard** : BEP-20 (compatible ERC-20)
```

---

## ✅ Validation Finale

### Conformité avec le sujet

- [x] 1. Token contient "42" dans le nom ✓
- [x] 2. Blockchain BNB Chain (BEP-20) ✓
- [x] 3. Code clair et commenté ✓
- [ ] 4. Déployé sur testnet public ⚠️ **À FAIRE**
- [ ] 4. Publié sur BSCScan ⚠️ **À FAIRE**
- [ ] 4. Adresse documentée dans /deployment ⚠️ **À FAIRE**
- [x] 5. README.md complet ✓
- [x] 6. Documentation dans /documentation ✓
- [ ] 7. Démonstration préparée ⚠️ **À FAIRE**
- [x] 8. Structure du repo conforme ✓
- [x] ⭐ Bonus: MultiSig implémenté ✓

---

## 📌 Notes Importantes

> ⚠️ **Ce projet utilise uniquement des testnets**
>
> Aucun fond réel n'est utilisé. Les tokens n'ont aucune valeur monétaire.
> C'est un projet éducatif pour apprendre le développement blockchain.

> 💡 **Avant de passer en production (mainnet)**
>
> 1. Faire auditer les contrats par un expert
> 2. Tester exhaustivement pendant plusieurs semaines
> 3. Utiliser un hardware wallet pour les clés
> 4. Avoir une stratégie de communication claire
> 5. Prévoir un plan de réponse aux incidents

---

**Date de création** : 2025-12-23
**Version** : 1.0.0
**Status** : ⚠️ Prêt pour déploiement testnet
