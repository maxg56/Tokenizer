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

## ⚠️ Avertissement

Démonstration éducative - Minage simulé. Tester sur testnet avant production.