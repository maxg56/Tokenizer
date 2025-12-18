import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { trackDeployment, createDeploymentInfo, Deployment } from "./utils/deploymentTracker";

// =============================================================================
// Types
// =============================================================================

interface DeploymentConfig {
  initialSupply: bigint;
}

interface DeployedContracts {
  token: {
    address: string;
    contract: Awaited<ReturnType<typeof ethers.deployContract>>;
  };
  mining: {
    address: string;
    contract: Awaited<ReturnType<typeof ethers.deployContract>>;
  };
}

interface DeploymentResult {
  tokenAddress: string;
  miningAddress: string;
  deployerAddress: string;
}

// =============================================================================
// Logger Utility (Security-conscious logging)
// =============================================================================

const Logger = {
  separator: () => console.log("=".repeat(60)),
  blank: () => console.log(""),
  header: (title: string) => {
    Logger.separator();
    console.log(title);
    Logger.separator();
  },
  step: (num: number, message: string) => console.log(`${num}. ${message}`),
  info: (message: string) => console.log(`   ${message}`),
  success: (message: string) => console.log(`   ${message}`),
  // Security: mask sensitive parts of addresses for logs
  maskAddress: (address: string): string => {
    if (!address || address.length < 10) return "****";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },
};

// =============================================================================
// Environment Validation
// =============================================================================

function validateEnvironment(): void {
  // Validate that we're not accidentally exposing private keys
  if (
    process.env.PRIVATE_KEY &&
    !/^[0-9a-fA-F]{64}$/.test(process.env.PRIVATE_KEY)
  ) {
    throw new Error("Invalid PRIVATE_KEY format: must be exactly 64 hexadecimal characters");
  }
}

// =============================================================================
// Configuration
// =============================================================================

function loadConfig(): DeploymentConfig {
  return {
    initialSupply: ethers.parseEther("1000000"), // 1M MTK42
  };
}

// =============================================================================
// Deployment Functions
// =============================================================================

async function deployToken(config: DeploymentConfig): Promise<DeployedContracts["token"]> {
  Logger.step(1, "Deploying MaxToken42Mining token...");

  const MaxToken42Mining = await ethers.getContractFactory("MaxToken42Mining");
  const token = await MaxToken42Mining.deploy(config.initialSupply);
  await token.waitForDeployment();

  const address = await token.getAddress();
  const maxSupply = await token.MAX_SUPPLY();

  Logger.info(`Contract deployed at: ${Logger.maskAddress(address)}`);
  Logger.info(`Initial supply: ${ethers.formatEther(config.initialSupply)} MTK42`);
  Logger.info(`Max supply: ${ethers.formatEther(maxSupply)} MTK42`);
  Logger.blank();

  return { address, contract: token };
}

async function deployMining(tokenAddress: string): Promise<DeployedContracts["mining"]> {
  Logger.step(2, "Deploying MiningContract...");

  const MiningContract = await ethers.getContractFactory("MiningContract");
  const mining = await MiningContract.deploy(tokenAddress);
  await mining.waitForDeployment();

  const address = await mining.getAddress();

  Logger.info(`Contract deployed at: ${Logger.maskAddress(address)}`);
  Logger.blank();

  return { address, contract: mining };
}

// =============================================================================
// Initialization Functions
// =============================================================================

async function grantMinerRole(
  token: DeployedContracts["token"],
  miningAddress: string
): Promise<void> {
  Logger.step(3, "Setting up mining permissions...");

  const tx = await token.contract.addMiner(miningAddress);
  await tx.wait();

  const canMint = await token.contract.canMint(miningAddress);
  Logger.info("Mining contract granted MINER_ROLE");
  Logger.info(`Permissions verified: ${canMint}`);
  Logger.blank();
}

async function logMiningConfig(mining: DeployedContracts["mining"]): Promise<void> {
  Logger.step(4, "Mining configuration:");

  const baseReward = await mining.contract.baseReward();
  const difficulty = await mining.contract.difficulty();
  const blockTime = await mining.contract.blockTime();

  Logger.info(`Base reward: ${ethers.formatEther(baseReward)} MTK42`);
  Logger.info(`Initial difficulty: ${difficulty.toString()}`);
  Logger.info(`Target block time: ${blockTime.toString()} seconds`);
  Logger.blank();
}

async function logMiningStats(mining: DeployedContracts["mining"]): Promise<void> {
  Logger.step(5, "Initial mining statistics:");

  const globalStats = await mining.contract.getGlobalStats();

  Logger.info(`Current block: ${globalStats[0].toString()}`);
  Logger.info(`Total mined: ${ethers.formatEther(globalStats[1])} MTK42`);
  Logger.info(`Active miners: ${globalStats[3].toString()}`);
  Logger.info(`Current block reward: ${ethers.formatEther(globalStats[4])} MTK42`);
  Logger.blank();
}

// =============================================================================
// Deployment Tracking
// =============================================================================

async function saveDeployment(
  deployer: HardhatEthersSigner,
  contracts: DeployedContracts
): Promise<Deployment> {
  const network = await deployer.provider.getNetwork();
  const chainId = Number(network.chainId);
  const networkName = network.name;

  const baseReward = await contracts.mining.contract.baseReward();
  const maxSupply = await contracts.token.contract.MAX_SUPPLY();

  const deploymentData = createDeploymentInfo(
    deployer.address,
    chainId,
    networkName,
    {
      token: {
        name: "MaxToken42Mining",
        address: contracts.token.address,
        symbol: "MTK42",
      },
      mining: {
        name: "MiningContract",
        address: contracts.mining.address,
      },
    },
    {
      initialSupply: "1000000",
      maxSupply: ethers.formatEther(maxSupply),
      miningBaseReward: ethers.formatEther(baseReward),
    }
  );

  Logger.info("Saving deployment to deployments.json...");
  trackDeployment(deploymentData);

  return deploymentData;
}

// =============================================================================
// Summary (Security: Full addresses only in deployment file, not logs)
// =============================================================================

function logDeploymentSummary(
  contracts: DeployedContracts,
  deployer: HardhatEthersSigner,
  networkName: string
): void {
  Logger.header("DEPLOYMENT COMPLETE!");

  // Security: Show masked addresses in logs
  console.log(`Token Contract:   ${Logger.maskAddress(contracts.token.address)}`);
  console.log(`Mining Contract:  ${Logger.maskAddress(contracts.mining.address)}`);
  console.log(`Deployer:         ${Logger.maskAddress(deployer.address)}`);
  console.log(`Network:          ${networkName}`);

  Logger.separator();
  Logger.blank();

  // Security: Direct users to secure file instead of logging full addresses
  console.log("Full contract addresses saved to: deployments.json");
  console.log("(Do not share this file publicly without review)");
  Logger.blank();

  console.log("Next steps:");
  console.log("1. Review deployments.json for contract addresses");
  console.log("2. Update frontend config with addresses from deployments.json");
  console.log("3. Verify contracts on block explorer if deploying to mainnet");
  console.log("4. Test mining functionality on testnet first");
}

// =============================================================================
// Main Function
// =============================================================================

async function main(): Promise<DeploymentResult> {
  // Security: Validate environment before deployment
  validateEnvironment();

  const [deployer] = await ethers.getSigners();
  const config = loadConfig();

  Logger.header("MaxToken42 Mining System Deployment");
  console.log(`Deployer: ${Logger.maskAddress(deployer.address)}`);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  Logger.blank();

  // Deploy contracts
  const token = await deployToken(config);
  const mining = await deployMining(token.address);

  const contracts: DeployedContracts = { token, mining };

  // Initialize
  await grantMinerRole(token, mining.address);
  await logMiningConfig(mining);
  await logMiningStats(mining);

  // Save and summarize
  const network = await deployer.provider.getNetwork();
  await saveDeployment(deployer, contracts);

  logDeploymentSummary(contracts, deployer, network.name);

  return {
    tokenAddress: token.address,
    miningAddress: mining.address,
    deployerAddress: deployer.address,
  };
}

// =============================================================================
// Entry Point
// =============================================================================

main()
  .then((result) => {
    // Security: Don't log full addresses, only confirmation
    console.log("Deployment successful! Check deployments.json for details.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:");
    // Security: Don't expose full error stack in production
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    } else {
      console.error(error.message || "Unknown error");
    }
    process.exit(1);
  });
