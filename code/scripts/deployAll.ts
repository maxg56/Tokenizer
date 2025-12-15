import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { trackDeployment, createDeploymentInfo, Deployment } from "./utils/deploymentTracker";

// =============================================================================
// Types
// =============================================================================

interface DeploymentConfig {
  initialSupply: bigint;
  faucetFunding: bigint;
  multiSigOwners: string[];
  requiredConfirmations: number;
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
  faucet: {
    address: string;
    contract: Awaited<ReturnType<typeof ethers.deployContract>>;
  };
  multiSig: {
    address: string;
    contract: Awaited<ReturnType<typeof ethers.deployContract>>;
  };
}

interface NetworkInfo {
  chainId: number;
  name: string;
}

// =============================================================================
// Logger Utility
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
  section: (title: string, items: Record<string, string>) => {
    console.log(`${title}:`);
    Object.entries(items).forEach(([key, value]) => {
      console.log(`  ${key.padEnd(16)} ${value}`);
    });
  },
};

// =============================================================================
// Configuration
// =============================================================================

function loadConfig(deployerAddress: string): DeploymentConfig {
  return {
    initialSupply: ethers.parseEther("1000000"),      // 1M tokens
    faucetFunding: ethers.parseEther("100000"),       // 100K tokens
    multiSigOwners: [deployerAddress],
    requiredConfirmations: 1,
  };
}

// =============================================================================
// Deployment Functions
// =============================================================================

async function deployToken(config: DeploymentConfig): Promise<DeployedContracts["token"]> {
  Logger.step(1, "Deploying MaxToken42Mining Token...");

  const MaxToken42Mining = await ethers.getContractFactory("MaxToken42Mining");
  const token = await MaxToken42Mining.deploy(config.initialSupply);
  await token.waitForDeployment();
  const address = await token.getAddress();

  Logger.info(`Token deployed at: ${address}`);
  Logger.info("Initial supply: 1,000,000 MTK42");
  Logger.info("Max supply: 10,000,000 MTK42");
  Logger.blank();

  return { address, contract: token };
}

async function deployMining(tokenAddress: string): Promise<DeployedContracts["mining"]> {
  Logger.step(2, "Deploying MiningContract...");

  const MiningContract = await ethers.getContractFactory("MiningContract");
  const mining = await MiningContract.deploy(tokenAddress);
  await mining.waitForDeployment();
  const address = await mining.getAddress();

  Logger.info(`Mining contract deployed at: ${address}`);
  Logger.blank();

  return { address, contract: mining };
}

async function deployFaucet(tokenAddress: string): Promise<DeployedContracts["faucet"]> {
  Logger.step(3, "Deploying Faucet...");

  const Faucet = await ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy(tokenAddress);
  await faucet.waitForDeployment();
  const address = await faucet.getAddress();

  Logger.info(`Faucet deployed at: ${address}`);
  Logger.blank();

  return { address, contract: faucet };
}

async function deployMultiSig(config: DeploymentConfig): Promise<DeployedContracts["multiSig"]> {
  Logger.step(4, "Deploying MultiSigWallet...");

  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
  const multiSig = await MultiSigWallet.deploy(
    config.multiSigOwners,
    config.requiredConfirmations
  );
  await multiSig.waitForDeployment();
  const address = await multiSig.getAddress();

  Logger.info(`MultiSig deployed at: ${address}`);
  Logger.info(`Owners: ${config.multiSigOwners.join(", ")}`);
  Logger.info(`Required confirmations: ${config.requiredConfirmations}`);
  Logger.blank();

  return { address, contract: multiSig };
}

// =============================================================================
// Initialization Functions
// =============================================================================

async function grantMinerRole(
  token: DeployedContracts["token"],
  miningAddress: string
): Promise<void> {
  Logger.info("Granting MINER_ROLE to mining contract...");
  const tx = await token.contract.addMiner(miningAddress);
  await tx.wait();
  Logger.success("MINER_ROLE granted successfully");
  Logger.blank();
}

async function fundFaucet(
  token: DeployedContracts["token"],
  faucet: DeployedContracts["faucet"],
  amount: bigint
): Promise<void> {
  Logger.info("Funding faucet with 100,000 MTK42...");

  const approveTx = await token.contract.approve(faucet.address, amount);
  await approveTx.wait();

  const fundTx = await faucet.contract.fund(amount);
  await fundTx.wait();

  Logger.success("Faucet funded successfully");
  Logger.blank();
}

// =============================================================================
// Summary & Logging
// =============================================================================

function logDeploymentSummary(contracts: DeployedContracts): void {
  Logger.header("DEPLOYMENT SUMMARY");
  Logger.blank();

  Logger.section("Contract Addresses", {
    "Token (MTK42):": contracts.token.address,
    "Mining Contract:": contracts.mining.address,
    "Faucet:": contracts.faucet.address,
    "MultiSig Wallet:": contracts.multiSig.address,
  });
  Logger.blank();

  Logger.section("Token Stats", {
    "Name:": "MaxToken42",
    "Symbol:": "MTK42",
    "Decimals:": "18",
    "Initial Supply:": "1,000,000 MTK42",
    "Max Supply:": "10,000,000 MTK42",
    "Faucet Balance:": "100,000 MTK42",
  });
  Logger.blank();

  Logger.section("Mining Config", {
    "Base Reward:": "100 MTK42",
    "Difficulty:": "1000",
    "Block Time:": "300s (5 min)",
    "Halving:": "210,000 blocks",
  });
  Logger.blank();

  Logger.section("Faucet Config", {
    "Drip Amount:": "100 MTK42",
    "Cooldown:": "24 hours",
    "Daily Limit:": "1000 claims",
  });
  Logger.blank();
}

function logDeployerInfo(deployer: HardhatEthersSigner, balance: bigint): void {
  Logger.header("MaxToken42 Complete System Deployment");
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  Logger.blank();
}

// =============================================================================
// Deployment Tracking
// =============================================================================

async function getNetworkInfo(): Promise<NetworkInfo> {
  const network = await ethers.provider.getNetwork();
  return {
    chainId: Number(network.chainId),
    name: network.name,
  };
}

function saveDeployment(
  deployer: string,
  network: NetworkInfo,
  contracts: DeployedContracts
): Deployment {
  const deploymentData = createDeploymentInfo(
    deployer,
    network.chainId,
    network.name,
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
      faucet: {
        name: "Faucet",
        address: contracts.faucet.address,
      },
      multiSig: {
        name: "MultiSigWallet",
        address: contracts.multiSig.address,
      },
    },
    {
      initialSupply: "1000000",
      maxSupply: "10000000",
      faucetFunding: "100000",
      miningBaseReward: "100",
    }
  );

  console.log("Saving deployment to deployments.json...");
  trackDeployment(deploymentData);

  Logger.blank();
  console.log("Deployment JSON for frontend config:");
  console.log(JSON.stringify(deploymentData, null, 2));
  Logger.blank();

  return deploymentData;
}

// =============================================================================
// Main Function
// =============================================================================

async function main(): Promise<Deployment> {
  // Setup
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  const config = loadConfig(deployer.address);

  logDeployerInfo(deployer, balance);

  // Deploy all contracts
  const token = await deployToken(config);
  const mining = await deployMining(token.address);
  const faucet = await deployFaucet(token.address);
  const multiSig = await deployMultiSig(config);

  const contracts: DeployedContracts = { token, mining, faucet, multiSig };

  // Initialize contracts
  await grantMinerRole(token, mining.address);
  await fundFaucet(token, faucet, config.faucetFunding);

  // Summary and save
  logDeploymentSummary(contracts);

  const network = await getNetworkInfo();
  const deploymentData = saveDeployment(deployer.address, network, contracts);

  Logger.separator();
  console.log("Deployment completed successfully!");
  Logger.separator();

  return deploymentData;
}

// =============================================================================
// Entry Point
// =============================================================================

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
