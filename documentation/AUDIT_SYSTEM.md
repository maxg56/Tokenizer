# Système d'Audit MaxToken42

## Vue d'ensemble

Le système d'audit MaxToken42 fournit une infrastructure complète de traçabilité pour tous les événements importants du système blockchain. Il permet d'enregistrer, de rechercher et d'analyser toutes les actions effectuées sur les smart contracts.

## Architecture

### Composants

```
├── IAuditLogger.sol       # Interface du système d'audit
├── AuditLogger.sol        # Implémentation du logger centralisé
└── Scripts
    └── deployAuditLogger.ts   # Script de déploiement
```

### Fonctionnalités principales

1. **Enregistrement d'événements** : Capture toutes les actions importantes
2. **Recherche avancée** : Requêtes par acteur, type, contrat, plage de temps
3. **Vérification d'intégrité** : Hash cryptographique pour chaque entrée
4. **Statistiques** : Métriques globales et par acteur
5. **Contrôle d'accès** : Système de rôles avec AccessControl
6. **Pause d'urgence** : Capacité de suspendre l'audit

## Types d'événements audités

Le système supporte 18 types d'événements différents :

| Type | Code | Description |
|------|------|-------------|
| TOKEN_MINTED | 0 | Création de nouveaux tokens |
| TOKEN_BURNED | 1 | Destruction de tokens |
| TOKEN_TRANSFERRED | 2 | Transfert de tokens |
| MINING_STARTED | 3 | Démarrage du minage |
| MINING_STOPPED | 4 | Arrêt du minage |
| BLOCK_MINED | 5 | Bloc miné avec succès |
| DAILY_BONUS_CLAIMED | 6 | Bonus quotidien réclamé |
| FAUCET_DRIP | 7 | Distribution du faucet |
| MULTISIG_TRANSACTION_SUBMITTED | 8 | Transaction multisig soumise |
| MULTISIG_TRANSACTION_CONFIRMED | 9 | Transaction multisig confirmée |
| MULTISIG_TRANSACTION_EXECUTED | 10 | Transaction multisig exécutée |
| MULTISIG_TRANSACTION_REVOKED | 11 | Transaction multisig révoquée |
| ROLE_GRANTED | 12 | Rôle accordé |
| ROLE_REVOKED | 13 | Rôle révoqué |
| OWNERSHIP_TRANSFERRED | 14 | Propriété transférée |
| CONTRACT_PAUSED | 15 | Contrat mis en pause |
| CONTRACT_UNPAUSED | 16 | Contrat réactivé |
| CONFIGURATION_CHANGED | 17 | Configuration modifiée |

## Système de rôles

### Rôles disponibles

- **DEFAULT_ADMIN_ROLE** : Administration complète du système
  - Peut ajouter/retirer des loggers
  - Peut mettre en pause/réactiver le système
  - Peut gérer tous les rôles

- **AUDITOR_ROLE** : Lecture et analyse des logs
  - Peut consulter tous les logs
  - Peut générer des rapports
  - Accès en lecture seule

- **LOGGER_ROLE** : Enregistrement d'événements
  - Peut créer des entrées d'audit
  - Requis pour les contrats qui souhaitent logger

## Utilisation

### Déploiement

```bash
# Depuis le dossier code/
cd code

# Déploiement local
npx hardhat run scripts/deployAuditLogger.ts --network localhost

# Déploiement BSC Testnet
npx hardhat run scripts/deployAuditLogger.ts --network bsctest

# Déploiement BSC Mainnet
npx hardhat run scripts/deployAuditLogger.ts --network bsc
```

### Intégration dans un contrat

```solidity
import "./IAuditLogger.sol";

contract MyContract {
    IAuditLogger public auditLogger;

    constructor(address _auditLogger) {
        auditLogger = IAuditLogger(_auditLogger);
    }

    function myFunction() external {
        // Votre logique métier

        // Logger l'événement
        bytes memory data = abi.encode(msg.sender, someValue);
        auditLogger.logEvent(
            IAuditLogger.AuditEventType.CONFIGURATION_CHANGED,
            msg.sender,
            address(this),
            data
        );
    }
}
```

### Exemples de code

#### Enregistrer un événement

```solidity
// Préparer les données à logger
bytes memory data = abi.encode(
    to,           // Adresse destinataire
    amount,       // Montant
    timestamp     // Timestamp
);

// Logger l'événement
auditLogger.logEvent(
    IAuditLogger.AuditEventType.TOKEN_MINTED,
    msg.sender,              // Acteur
    address(tokenContract),  // Contrat cible
    data                     // Données
);
```

#### Consulter les logs d'un acteur

```javascript
// JavaScript/TypeScript avec ethers.js
const auditLogger = await ethers.getContractAt("AuditLogger", auditLoggerAddress);

// Récupérer les 10 premiers logs de l'acteur
const logs = await auditLogger.getLogsByActor(
    actorAddress,
    0,    // offset
    10    // limit
);

// Parcourir les logs
for (const logId of logs) {
    const log = await auditLogger.getLog(logId);
    console.log(`Event: ${log.eventType}`);
    console.log(`Actor: ${log.actor}`);
    console.log(`Contract: ${log.targetContract}`);
    console.log(`Time: ${new Date(log.timestamp * 1000)}`);
}
```

#### Recherche par type d'événement

```javascript
// Récupérer tous les événements de minting
const TOKEN_MINTED = 0;
const logs = await auditLogger.getLogsByType(
    TOKEN_MINTED,
    0,    // offset
    100   // limit
);
```

#### Recherche par plage de temps

```javascript
// Logs des dernières 24 heures
const now = Math.floor(Date.now() / 1000);
const oneDayAgo = now - 86400;

const logs = await auditLogger.getLogsByTimeRange(
    oneDayAgo,
    now,
    0,    // offset
    100   // limit
);
```

#### Statistiques globales

```javascript
const stats = await auditLogger.getGlobalStats();
console.log(`Total logs: ${stats.totalLogs}`);
console.log(`Mint events: ${stats.mintEvents}`);
console.log(`Burn events: ${stats.burnEvents}`);
console.log(`Mining events: ${stats.miningEvents}`);
```

#### Statistiques d'un acteur

```javascript
const stats = await auditLogger.getActorStats(actorAddress);
console.log(`Total actions: ${stats.totalActions}`);
console.log(`Mint actions: ${stats.mintActions}`);
console.log(`Burn actions: ${stats.burnActions}`);
console.log(`Transfer actions: ${stats.transferActions}`);
console.log(`Last activity: ${new Date(stats.lastActivityTime * 1000)}`);
```

## Administration

### Ajouter un logger

```javascript
// Seul un admin peut ajouter un logger
const tx = await auditLogger.addLogger(newLoggerAddress);
await tx.wait();
console.log("Logger added successfully");
```

### Retirer un logger

```javascript
const tx = await auditLogger.removeLogger(loggerAddress);
await tx.wait();
console.log("Logger removed successfully");
```

### Mettre en pause le système

```javascript
const tx = await auditLogger.pause();
await tx.wait();
console.log("Audit system paused");
```

### Réactiver le système

```javascript
const tx = await auditLogger.unpause();
await tx.wait();
console.log("Audit system unpaused");
```

## Vérification d'intégrité

Chaque log possède un hash cryptographique calculé à partir de :
- Log ID
- Type d'événement
- Acteur
- Contrat cible
- Timestamp
- Données

Pour vérifier l'intégrité d'un log :

```javascript
const isValid = await auditLogger.verifyLogIntegrity(logId);
console.log(`Log ${logId} integrity: ${isValid ? 'VALID' : 'CORRUPTED'}`);
```

## Tests

Le système d'audit dispose d'une suite de tests complète :

```bash
cd code
npx hardhat test test/AuditLogger.test.ts
```

### Couverture des tests

- ✅ Déploiement et initialisation
- ✅ Gestion des rôles (ajout/retrait de loggers)
- ✅ Enregistrement d'événements
- ✅ Récupération des logs (par ID, acteur, type, contrat)
- ✅ Recherche par plage de temps
- ✅ Pagination des résultats
- ✅ Vérification d'intégrité
- ✅ Statistiques globales et par acteur
- ✅ Pause/reprise du système
- ✅ Contrôles d'accès

## Sécurité

### Bonnes pratiques

1. **Contrôle d'accès strict**
   - Seuls les contrats autorisés peuvent logger
   - Utiliser le rôle LOGGER_ROLE

2. **Données sensibles**
   - Ne jamais logger de clés privées
   - Hasher les données sensibles avant de les logger
   - Utiliser `abi.encode()` pour structurer les données

3. **Pause d'urgence**
   - Le système peut être mis en pause en cas de problème
   - Les logs restent consultables même en pause

4. **Intégrité**
   - Chaque log possède un hash de vérification
   - Les logs ne peuvent pas être modifiés après création

### Limites connues

1. **Coût en gas**
   - L'enregistrement d'événements consomme du gas
   - Considérer le trade-off entre traçabilité et coût

2. **Stockage on-chain**
   - Les données sont stockées sur la blockchain
   - Pour des volumes importants, envisager un système hybride (on-chain + IPFS)

3. **Recherche**
   - Les recherches par plage de temps sont coûteuses en gas
   - Privilégier les recherches par index (acteur, type)

## Cas d'usage

### 1. Audit de sécurité

Tracer toutes les opérations administratives :

```solidity
function transferOwnership(address newOwner) public override onlyOwner {
    bytes memory data = abi.encode(owner(), newOwner);
    auditLogger.logEvent(
        IAuditLogger.AuditEventType.OWNERSHIP_TRANSFERRED,
        msg.sender,
        address(this),
        data
    );
    super.transferOwnership(newOwner);
}
```

### 2. Conformité réglementaire

Enregistrer toutes les transactions importantes pour les audits :

```solidity
function mint(address to, uint256 amount) external onlyRole(MINER_ROLE) {
    _mint(to, amount);

    bytes memory data = abi.encode(to, amount, totalSupply());
    auditLogger.logEvent(
        IAuditLogger.AuditEventType.TOKEN_MINTED,
        msg.sender,
        address(this),
        data
    );
}
```

### 3. Analyse d'activité

Générer des rapports d'activité des utilisateurs :

```javascript
async function generateUserReport(userAddress) {
    const stats = await auditLogger.getActorStats(userAddress);
    const logs = await auditLogger.getLogsByActor(userAddress, 0, 1000);

    return {
        address: userAddress,
        totalActions: stats.totalActions,
        mints: stats.mintActions,
        burns: stats.burnActions,
        transfers: stats.transferActions,
        lastActivity: new Date(stats.lastActivityTime * 1000),
        recentLogs: logs
    };
}
```

## Roadmap

### Version future

- [ ] Compression des données pour réduire les coûts
- [ ] Intégration IPFS pour les gros volumes
- [ ] Dashboard web pour visualiser les audits
- [ ] Exports CSV/JSON des logs
- [ ] Alertes automatiques sur événements suspects
- [ ] Agrégation de statistiques par période
- [ ] Support de filtres combinés (acteur + type + temps)

## Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation du projet
- Vérifier les tests pour des exemples d'utilisation

## License

MIT License - Voir le fichier LICENSE du projet principal.
