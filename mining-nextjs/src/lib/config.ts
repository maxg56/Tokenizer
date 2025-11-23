import { http, createConfig } from 'wagmi'
import { bsc, bscTestnet, localhost } from 'wagmi/chains'
import { coinbaseWallet, injected } from 'wagmi/connectors'


// Configuration des chaînes
export const config = createConfig({
  chains: [localhost, bscTestnet, bsc],
  connectors: [
    injected(),
    coinbaseWallet(),
  ],
  transports: {
    [localhost.id]: http(),
    [bscTestnet.id]: http(),
    [bsc.id]: http(),
  },
})

// Configuration du contrat MaxToken42Mining
export const TOKEN_CONFIG = {
  address: '0x0165878A594ca255338adfa4d48449f69242Eb8F' as `0x${string}`, // Adresse déployée localement
  abi: [
    // ABI du contrat ERC20 avec minting
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function MAX_SUPPLY() view returns (uint256)',
    'function remainingSupply() view returns (uint256)',
    'function canMint(address account) view returns (bool)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
  ] as const,
  chainId: localhost.id, // Réseau local pour les tests
} as const

// Configuration du contrat de minage
export const MINING_CONFIG = {
  address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as `0x${string}`, // Adresse déployée localement
  abi: [
    // ABI du contrat de minage
    'function startMining(uint256 power) external',
    'function stopMining() external',
    'function mineBlock(uint256 nonce) external',
    'function claimDailyBonus() external',
    'function calculateReward(address miner) view returns (uint256)',
    'function getCurrentBlockReward() view returns (uint256)',
    'function isValidProofOfWork(bytes32 hash) view returns (bool)',
    'function getMinerStats(address miner) view returns (uint256 power, uint256 totalMined, uint256 blocksFound, uint256 joinedAt, uint256 estimatedReward, bool isActive, bool canClaimDaily)',
    'function getGlobalStats() view returns (uint256 currentBlock, uint256 totalMined, uint256 difficulty, uint256 activeMiners, uint256 currentReward, uint256 nextDifficultyAdjustment)',
    'function getBlockDetails(uint256 blockNumber) view returns (address miner, uint256 timestamp, uint256 reward, uint256 difficulty, bytes32 hash)',
    'function baseReward() view returns (uint256)',
    'function difficulty() view returns (uint256)',
    'function blockTime() view returns (uint256)',
    'function currentBlock() view returns (uint256)',
    'function totalMined() view returns (uint256)',
    'event MiningStarted(address indexed miner, uint256 power)',
    'event MiningStopped(address indexed miner)',
    'event BlockMined(address indexed miner, uint256 indexed blockNumber, uint256 reward, uint256 difficulty, bytes32 hash)',
    'event DailyBonusClaimed(address indexed miner, uint256 amount)',
    'event DifficultyAdjusted(uint256 oldDifficulty, uint256 newDifficulty)',
  ] as const,
  chainId: localhost.id, // Réseau local pour les tests
} as const

// Types pour TypeScript
export type TokenConfig = typeof TOKEN_CONFIG
export type MiningConfig = typeof MINING_CONFIG

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}