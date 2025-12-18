import * as fs from "fs";
import * as path from "path";

// Interface pour un contrat déployé
interface DeployedContract {
  name: string;
  address: string;
  symbol?: string;
  deploymentTx?: string;
}

// Interface pour un déploiement
interface Deployment {
  timestamp: string;
  deployer: string;
  chainId: number;
  networkName: string;
  contracts: {
    token?: DeployedContract;
    mining?: DeployedContract;
    faucet?: DeployedContract;
    multiSig?: DeployedContract;
  };
  configuration?: {
    initialSupply?: string;
    maxSupply?: string;
    faucetFunding?: string;
    miningBaseReward?: string;
  };
}

// Interface pour le fichier deployments.json
interface DeploymentsFile {
  version: string;
  lastUpdated: string | null;
  networks: {
    [networkKey: string]: Deployment[];
  };
}

// Chemin vers le fichier deployments.json
const DEPLOYMENTS_PATH = path.resolve(__dirname, "../../../deployments.json");

/**
 * Lit le fichier deployments.json
 */
function readDeployments(): DeploymentsFile {
  try {
    if (fs.existsSync(DEPLOYMENTS_PATH)) {
      const content = fs.readFileSync(DEPLOYMENTS_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn("Warning: Could not read deployments.json, creating new file");
  }

  return {
    version: "1.0.0",
    lastUpdated: null,
    networks: {}
  };
}

/**
 * Écrit dans le fichier deployments.json
 */
function writeDeployments(data: DeploymentsFile): void {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DEPLOYMENTS_PATH, JSON.stringify(data, null, 2));
  console.log(`\n[Tracker] Deployment saved to: ${DEPLOYMENTS_PATH}`);
}

/**
 * Génère une clé unique pour le réseau
 */
function getNetworkKey(chainId: number, networkName: string): string {
  const networkMap: { [key: number]: string } = {
    1: "ethereum-mainnet",
    5: "ethereum-goerli",
    11155111: "ethereum-sepolia",
    56: "bsc-mainnet",
    97: "bsc-testnet",
    1337: "localhost",
    31337: "hardhat"
  };

  return networkMap[chainId] || `${networkName}-${chainId}`;
}

/**
 * Enregistre un nouveau déploiement
 */
export function trackDeployment(deployment: Deployment): void {
  const deployments = readDeployments();
  const networkKey = getNetworkKey(deployment.chainId, deployment.networkName);

  if (!deployments.networks[networkKey]) {
    deployments.networks[networkKey] = [];
  }

  // Ajouter le nouveau déploiement (le plus récent en premier)
  deployments.networks[networkKey].unshift(deployment);

  // Garder seulement les 10 derniers déploiements par réseau
  if (deployments.networks[networkKey].length > 10) {
    deployments.networks[networkKey] = deployments.networks[networkKey].slice(0, 10);
  }

  writeDeployments(deployments);
}

/**
 * Récupère le dernier déploiement pour un réseau
 */
export function getLatestDeployment(chainId: number, networkName: string): Deployment | null {
  const deployments = readDeployments();
  const networkKey = getNetworkKey(chainId, networkName);

  const networkDeployments = deployments.networks[networkKey];
  if (networkDeployments && networkDeployments.length > 0) {
    return networkDeployments[0];
  }

  return null;
}

/**
 * Récupère tous les déploiements
 */
export function getAllDeployments(): DeploymentsFile {
  return readDeployments();
}

/**
 * Crée un objet de déploiement à partir des informations fournies
 */
export function createDeploymentInfo(
  deployer: string,
  chainId: number,
  networkName: string,
  contracts: Deployment["contracts"],
  configuration?: Deployment["configuration"]
): Deployment {
  return {
    timestamp: new Date().toISOString(),
    deployer,
    chainId,
    networkName,
    contracts,
    configuration
  };
}

export { Deployment, DeployedContract, DeploymentsFile };
