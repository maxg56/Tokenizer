import { ethers } from "hardhat";
import { trackDeployment, createDeploymentInfo, Deployment } from "./utils/deploymentTracker";

// =============================================================================
// Security Utilities
// =============================================================================

const Logger = {
  separator: () => console.log("=".repeat(60)),
  blank: () => console.log(""),
  // Security: mask addresses in logs
  maskAddress: (address: string): string => {
    if (!address || address.length < 10) return "****";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },
};

// =============================================================================
// Environment Validation
// =============================================================================

function validateEnvironment(): void {
  if (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length < 64) {
    throw new Error("Invalid PRIVATE_KEY format");
  }
}

// =============================================================================
// Main Deployment Function
// =============================================================================

async function main(): Promise<Deployment> {
  // Security: Validate environment before deployment
  validateEnvironment();

  const [deployer] = await ethers.getSigners();

  Logger.separator();
  console.log("MaxToken42 Deployment");
  Logger.separator();

  // Security: Mask deployer address in logs
  console.log(`Deployer: ${Logger.maskAddress(deployer.address)}`);
  console.log(`Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);
  Logger.blank();

  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1 million tokens

  // Deploy contract
  console.log("Deploying MaxToken42...");
  const MaxToken42 = await ethers.getContractFactory("MaxToken42");
  const token = await MaxToken42.deploy(INITIAL_SUPPLY);

  await token.waitForDeployment();
  const contractAddress = await token.getAddress();

  // Security: Mask address in logs
  console.log(`Contract deployed at: ${Logger.maskAddress(contractAddress)}`);
  console.log(`Initial supply: ${ethers.formatEther(INITIAL_SUPPLY)} MTK42`);
  console.log(`Token name: ${await token.name()}`);
  console.log(`Token symbol: ${await token.symbol()}`);
  console.log(`Decimals: ${await token.decimals()}`);
  Logger.blank();

  // Get network info
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const networkName = network.name;

  // Track deployment (full addresses saved to file, not logged)
  const deploymentData = createDeploymentInfo(
    deployer.address,
    chainId,
    networkName,
    {
      token: {
        name: "MaxToken42",
        address: contractAddress,
        symbol: "MTK42",
      },
    },
    {
      initialSupply: "1000000",
    }
  );

  console.log("Saving deployment to deployments.json...");
  trackDeployment(deploymentData);

  Logger.separator();
  console.log("DEPLOYMENT COMPLETE!");
  Logger.separator();

  // Security: Direct users to file instead of logging full addresses
  console.log("Full contract address saved to: deployments.json");
  console.log(`Network: ${networkName}`);
  Logger.blank();

  return deploymentData;
}

// =============================================================================
// Entry Point
// =============================================================================

main()
  .then(() => {
    // Security: Don't log sensitive data
    console.log("Deployment successful! Check deployments.json for contract address.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:");
    // Security: Limit error exposure in production
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    } else {
      console.error(error.message || "Unknown error");
    }
    process.exit(1);
  });
