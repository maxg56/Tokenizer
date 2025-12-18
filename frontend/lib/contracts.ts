// Contract ABIs (minimal interfaces for frontend interaction)

export const ABIS = {
  token: [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function MAX_SUPPLY() view returns (uint256)',
    'function balanceOf(address account) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)',
  ],
  mining: [
    'function baseReward() view returns (uint256)',
    'function difficulty() view returns (uint256)',
    'function blockTime() view returns (uint256)',
    'function startMining(uint256 power) external',
    'function stopMining() external',
    'function claimDailyBonus() external',
    'function getMinerStats(address miner) view returns (bool, uint256, uint256, uint256, uint256, uint256)',
    'function getGlobalStats() view returns (uint256, uint256, uint256, uint256, uint256)',
    'function calculateReward(address miner) view returns (uint256)',
    'event MiningStarted(address indexed miner, uint256 power)',
    'event MiningStopped(address indexed miner)',
    'event BlockMined(address indexed miner, uint256 reward)',
  ],
  faucet: [
    'function dripAmount() view returns (uint256)',
    'function cooldownTime() view returns (uint256)',
    'function drip() external',
    'function canDrip(address user) view returns (bool, uint256)',
    'function getStats() view returns (uint256, uint256, uint256)',
    'function getUserStats(address user) view returns (uint256, uint256, bool)',
    'event Dripped(address indexed user, uint256 amount)',
  ],
};

// Network configurations
export const NETWORKS: Record<number, { name: string; rpcUrl: string; explorer: string }> = {
  1337: {
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    explorer: '',
  },
  31337: {
    name: 'Hardhat',
    rpcUrl: 'http://127.0.0.1:8545',
    explorer: '',
  },
  97: {
    name: 'BSC Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    explorer: 'https://testnet.bscscan.com',
  },
  56: {
    name: 'BSC Mainnet',
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    explorer: 'https://bscscan.com',
  },
};

// Contract addresses per network
// These will be loaded from deployments.json or can be configured here
const CONTRACT_ADDRESSES: Record<number, {
  token?: string;
  mining?: string;
  faucet?: string;
  multiSig?: string;
}> = {
  // Localhost (update after deployment)
  1337: {
    token: '',
    mining: '',
    faucet: '',
    multiSig: '',
  },
  // Hardhat (update after deployment)
  31337: {
    token: '',
    mining: '',
    faucet: '',
    multiSig: '',
  },
  // BSC Testnet (update after deployment)
  97: {
    token: '',
    mining: '',
    faucet: '',
    multiSig: '',
  },
  // BSC Mainnet (update after deployment)
  56: {
    token: '',
    mining: '',
    faucet: '',
    multiSig: '',
  },
};

// Function to get contract addresses for a specific chain
export function getContractAddresses(chainId: number) {
  return CONTRACT_ADDRESSES[chainId] || null;
}

// Function to update addresses (useful for loading from deployments.json)
export function setContractAddresses(chainId: number, addresses: {
  token?: string;
  mining?: string;
  faucet?: string;
  multiSig?: string;
}) {
  CONTRACT_ADDRESSES[chainId] = { ...CONTRACT_ADDRESSES[chainId], ...addresses };
}

// Helper to format addresses
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper to format token amounts
export function formatTokenAmount(amount: string, decimals: number = 4): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}
