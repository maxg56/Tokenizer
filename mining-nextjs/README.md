# 🚀 MaxToken42 Mining Platform - Next.js

Plateforme de minage moderne pour MaxToken42 (MTK42) construite avec Next.js 15, TypeScript, Tailwind CSS et Web3.

## ✨ Fonctionnalités

- 🔗 **Web3 Integration** - RainbowKit + Wagmi + Viem
- ⛏️ **Mining Simulation** - Interface de minage en temps réel
- 📊 **Dashboard** - Statistiques et tracking des gains
- 🎁 **Rewards System** - Bonus quotidiens et achievements
- 🎨 **Cosmic Design** - Animations Framer Motion

## 🛠️ Stack

- **Next.js 15** + TypeScript
- **Tailwind CSS 4** + Framer Motion
- **Wagmi v2** + RainbowKit
- **Zustand** pour le state management

## 🚀 Installation

```bash
cd mining-nextjs
pnpm install
pnpm dev
```

## 🔧 Configuration

Créer `.env.local` :
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_project_id"
NEXT_PUBLIC_TOKEN_ADDRESS="0x..."
```

Éditer `src/lib/config.ts` pour l'adresse de votre contrat.

## 🎮 Utilisation

1. Connecter son wallet
2. Ajuster la puissance de minage
3. Démarrer le minage
4. Réclamer les récompenses

Interface moderne et responsive avec animations cosmiques.

## 🧪 Tests en Local

### 1. Démarrage de l'environnement de test

**Terminal 1 - Réseau Hardhat :**
```bash
cd code
pnpm exec hardhat node
# ✅ Réseau local sur http://127.0.0.1:8545
```

**Terminal 2 - Déploiement des contrats :**
```bash
cd code
pnpm exec hardhat run scripts/deploy.ts --network localhost
# ✅ Contrats déployés sur le réseau local
```

**Terminal 3 - Frontend Next.js :**
```bash
cd mining-nextjs
PORT=3002 pnpm dev
# ✅ Interface sur http://localhost:3002
```

### 2. Configuration MetaMask

1. **Ajouter le réseau Hardhat :**
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

2. **Importer un compte de test :**
   ```
   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   Balance: 10,000 ETH
   ```

### 3. Test des fonctionnalités

1. **Connexion Wallet :** Se connecter avec MetaMask
2. **Mining Interface :** Ajuster la puissance (1-100 GH/s)
3. **Démarrer le minage :** Commencer la simulation
4. **Statistiques :** Vérifier les gains en temps réel
5. **Récompenses :** Réclamer les bonus quotidiens

### 4. Tests automatisés

```bash
cd code
pnpm test  # Tests des smart contracts
```

**Statut actuel :** 16/17 tests passent ✅

### 5. Outils de debug

- **Console Hardhat :** Logs des transactions en temps réel
- **MetaMask :** Confirmation des transactions
- **Next.js Dev :** Hot reload pour développement

### 6. Contrats déployés

- **MaxToken42 (MTK42) :** `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`
- **MiningContract :** `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **Supply initial :** 1,000,000 MTK42

### 7. Commandes utiles

```bash
# Redémarrer l'environnement complet
make dev-restart

# Status des services
make status

# Nettoyer et reconstruire
make clean && make build
```

## ⚠️ Avertissement

Démonstration éducative - Minage simulé. Tester sur testnet avant production.