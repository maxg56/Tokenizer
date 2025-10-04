# 🚀 MaxToken42 Mining System

Système de minage complet pour MaxToken42 avec smart contracts Solidity et interface Web3.

## 📋 Architecture

### Contrats intelligents

1. **MaxToken42Mining.sol** - Token ERC20 avec capacité de mint
2. **MiningContractV2.sol** - Contrat de minage avec proof-of-work
3. **Token42.sol** - Version basique originale (conservée pour référence)

## 🔧 Fonctionnalités du système de minage

### ⛏️ Proof-of-Work authentique
- Algorithme de hachage basé sur keccak256
- Difficulté ajustable automatiquement
- Cible de temps de bloc : 5 minutes
- Ajustement de difficulté tous les 144 blocs

### 🏆 Système de récompenses
- **Récompense de base** : 100 MTK42 par bloc
- **Bonus de puissance** : 50% à 150% selon la puissance (1-100%)
- **Bonus de fidélité** : Jusqu'à 25% après 30 jours
- **Bonus de performance** : Jusqu'à 10% selon les blocs trouvés
- **Halving** : Récompense divisée par 2 tous les 210k blocs

### 🎁 Bonus quotidiens
- 50 MTK42 par jour pour les mineurs actifs
- Cooldown de 24 heures
- Automatiquement crédité

### 📊 Statistiques complètes
- Tracking individuel par mineur
- Statistiques globales du réseau
- Historique des blocs
- Métriques de performance

## 🚀 Déploiement

### Prérequis
```bash
cd code
pnpm install
```

### Configuration réseau
Éditer `hardhat.config.ts` pour ajouter vos réseaux et clés.

### Déploiement
```bash
# BSC Testnet
pnpm exec hardhat run scripts/deployMining.ts --network bsctest

# BSC Mainnet
pnpm exec hardhat run scripts/deployMining.ts --network bsc
```

### Exemple de sortie
```
🚀 Deploying MaxToken42 Mining System...

✅ MaxToken42Mining deployed to: 0x123...
✅ MiningContractV2 deployed to: 0x456...
✅ Mining contract granted MINER_ROLE

📊 Initial mining statistics:
🔢 Current block: 1
⛏️  Total mined: 0.0 MTK42
👥 Active miners: 0
🏆 Current block reward: 100.0 MTK42
```

## 🧪 Tests

### Lancer tous les tests
```bash
pnpm test
```

### Tests couverts
- ✅ Déploiement des contrats
- ✅ Permissions de minage
- ✅ Démarrage/arrêt du minage
- ✅ Proof-of-work et validation
- ✅ Calcul des récompenses
- ✅ Bonus quotidiens
- ✅ Ajustement de difficulté
- ✅ Statistiques et métriques

## 🎮 Comment miner

### 1. Démarrer le minage
```solidity
// Démarrer avec 75% de puissance
miningContract.startMining(75);
```

### 2. Miner un bloc
```solidity
// Trouver un nonce valide puis miner
uint256 nonce = findValidNonce();
miningContract.mineBlock(nonce);
```

### 3. Réclamer bonus quotidien
```solidity
miningContract.claimDailyBonus();
```

## 🔍 Proof-of-Work expliqué

### Algorithme
```solidity
bytes32 hash = keccak256(abi.encodePacked(
    currentBlock,      // Numéro de bloc
    msg.sender,        // Adresse du mineur
    nonce,            // Valeur à deviner
    block.timestamp   // Timestamp actuel
));

uint256 target = type(uint256).max / difficulty;
require(uint256(hash) < target, "Invalid proof-of-work");
```

### Recherche de nonce
Le mineur doit trouver une valeur `nonce` telle que le hash résultant soit inférieur à la cible.

**Exemple en JavaScript :**
```javascript
function findValidNonce(blockNumber, minerAddress, difficulty) {
  let nonce = 0;
  const target = BigInt(2) ** BigInt(256) / BigInt(difficulty);

  while (true) {
    const hash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "address", "uint256", "uint256"],
        [blockNumber, minerAddress, nonce, Math.floor(Date.now() / 1000)]
      )
    );

    if (BigInt(hash) < target) {
      return nonce;
    }
    nonce++;
  }
}
```

## 🔧 Configuration du contrat

### Paramètres modifiables (owner seulement)
```solidity
setBaseReward(200 * 10**18);    // Changer récompense de base
setBlockTime(600);              // Changer temps de bloc cible
setDifficulty(2000);           // Ajuster difficulté manuellement
pause() / unpause();           // Pause d'urgence
```

### Événements importants
```solidity
event BlockMined(address indexed miner, uint256 indexed blockNumber, uint256 reward, uint256 difficulty, bytes32 hash);
event DifficultyAdjusted(uint256 oldDifficulty, uint256 newDifficulty);
event DailyBonusClaimed(address indexed miner, uint256 amount);
```

## 📊 Métriques et KPIs

### Statistiques du mineur
- Puissance de minage active
- Total de tokens minés
- Nombre de blocs trouvés
- Date d'arrivée
- Récompense estimée
- Éligibilité bonus quotidien

### Statistiques globales
- Bloc actuel
- Total de tokens minés
- Difficulté actuelle
- Nombre de mineurs actifs
- Récompense de bloc actuelle
- Blocs jusqu'au prochain ajustement

## 🔐 Sécurité

### Mesures de protection
- **ReentrancyGuard** : Protection contre les attaques de réentrance
- **Pausable** : Arrêt d'urgence
- **AccessControl** : Gestion des rôles et permissions
- **Ownable** : Fonctions d'administration protégées

### Limites et validations
- Puissance de minage : 1-100%
- Cooldown entre changements : 60 secondes
- Proof-of-work obligatoire
- Vérification de la supply maximale

### Bonnes pratiques
- Pas de fonctions de mint public
- Événements pour toutes les actions importantes
- Gestion d'erreurs complète
- Tests exhaustifs

## 🌐 Intégration Frontend

### Configuration Web3
```typescript
// Configuration des contrats
export const TOKEN_CONFIG = {
  address: '0x...',
  abi: [...],
}

export const MINING_CONFIG = {
  address: '0x...',
  abi: [...],
}
```

### Hook React personnalisé
```typescript
const {
  minerStats,
  globalStats,
  startMining,
  mineBlock,
  claimDailyBonus
} = useMining();
```

## 📈 Économie du token

### Supply et distribution
- **Initial Supply** : 1,000,000 MTK42
- **Max Supply** : 10,000,000 MTK42
- **Mining Supply** : 9,000,000 MTK42 (90% via minage)

### Mécanisme de halving
- Intervalle : 210,000 blocs (~2.4 ans à 5min/bloc)
- Réduction : 50% de la récompense
- Halving #1 : 100 → 50 MTK42
- Halving #2 : 50 → 25 MTK42
- ...

### Estimations temporelles
- **Temps de bloc cible** : 5 minutes
- **Blocs par jour** : 288
- **Tokens par jour** : ~28,800 MTK42 (initial)
- **Durée jusqu'à max supply** : ~8-10 ans

## 🛡️ Audit et sécurité

### Points d'attention
- [ ] Audit par un tiers des contrats
- [ ] Tests de stress avec forte charge
- [ ] Vérification économique du modèle
- [ ] Tests sur testnet avant mainnet

### Risques identifiés
- **Centralisation** : Owner peut modifier paramètres
- **Économique** : Modèle de halving non testé long terme
- **Technique** : Dépendance aux oracles de temps

## 📚 Ressources

- [Documentation Solidity](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Framework](https://hardhat.org/docs)
- [Ethers.js](https://docs.ethers.io/)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Ajouter des tests pour nouvelles fonctionnalités
4. Vérifier que tous les tests passent
5. Soumettre une pull request

## ⚠️ Avertissements

- **Testnet d'abord** : Toujours tester sur BSC Testnet
- **Audit requis** : Faire auditer avant mainnet
- **Risques financiers** : Comprendre les implications économiques
- **Pas de garantie** : Code fourni "tel quel"

---

**Le minage de MaxToken42 combine innovation blockchain et mécaniques de jeu pour créer une expérience utilisateur unique et engaging.** 🚀