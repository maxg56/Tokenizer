import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { trackDeployment, createDeploymentInfo, Deployment } from "./utils/deploymentTracker";

// =============================================================================
// Types
// =============================================================================

interface DeploymentResult {
  auditLoggerAddress: string;
  deployerAddress: string;
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
  success: (message: string) => console.log(`✓  ${message}`),
  error: (message: string) => console.log(`✗  ${message}`),
  maskAddress: (address: string): string => {
    if (!address || address.length < 10) return "****";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },
};

// =============================================================================
// Environment Validation
// =============================================================================

function validateEnvironment(): void {
  if (
    process.env.PRIVATE_KEY &&
    !/^[0-9a-fA-F]{64}$/.test(process.env.PRIVATE_KEY)
  ) {
    throw new Error(
      "PRIVATE_KEY in .env is not a valid 64-character hex string (without 0x prefix)"
    );
  }
}

// =============================================================================
// Contract Deployment
// =============================================================================

async function deployAuditLogger(
  deployer: HardhatEthersSigner
): Promise<DeploymentResult> {
  Logger.header("MAXTOKEN42 AUDIT LOGGER DEPLOYMENT");
  Logger.blank();

  // Display deployer info
  Logger.step(1, "Deployer Information");
  Logger.info(`Address: ${Logger.maskAddress(deployer.address)}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  Logger.info(`Balance: ${ethers.formatEther(balance)} ETH`);
  Logger.blank();

  // Deploy AuditLogger
  Logger.step(2, "Deploying AuditLogger Contract");
  Logger.info("Deploying...");

  const AuditLoggerFactory = await ethers.getContractFactory("AuditLogger", deployer);
  const auditLogger = await AuditLoggerFactory.deploy();
  await auditLogger.waitForDeployment();

  const auditLoggerAddress = await auditLogger.getAddress();
  Logger.success(`AuditLogger deployed at: ${auditLoggerAddress}`);
  Logger.blank();

  // Verify roles
  Logger.step(3, "Verifying Roles");

  const DEFAULT_ADMIN_ROLE = await auditLogger.DEFAULT_ADMIN_ROLE();
  const AUDITOR_ROLE = await auditLogger.AUDITOR_ROLE();
  const LOGGER_ROLE = await auditLogger.LOGGER_ROLE();

  const hasAdminRole = await auditLogger.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  const hasAuditorRole = await auditLogger.hasRole(AUDITOR_ROLE, deployer.address);
  const hasLoggerRole = await auditLogger.hasRole(LOGGER_ROLE, deployer.address);

  Logger.info(`Admin Role: ${hasAdminRole ? '✓' : '✗'}`);
  Logger.info(`Auditor Role: ${hasAuditorRole ? '✓' : '✗'}`);
  Logger.info(`Logger Role: ${hasLoggerRole ? '✓' : '✗'}`);
  Logger.blank();

  // Get initial state
  Logger.step(4, "Contract State");
  const logCount = await auditLogger.getLogCount();
  const isPaused = await auditLogger.paused();

  Logger.info(`Initial Log Count: ${logCount}`);
  Logger.info(`Paused: ${isPaused}`);
  Logger.blank();

  // Track deployment
  Logger.step(5, "Saving Deployment Information");

  const network = await ethers.provider.getNetwork();
  const deployments: Deployment[] = [
    createDeploymentInfo("AuditLogger", auditLoggerAddress, {}),
  ];

  await trackDeployment(deployments);
  Logger.success("Deployment information saved");
  Logger.blank();

  // Summary
  Logger.separator();
  Logger.blank();
  console.log("📋 DEPLOYMENT SUMMARY");
  Logger.blank();
  console.log(`Network:          ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer:         ${deployer.address}`);
  console.log(`AuditLogger:      ${auditLoggerAddress}`);
  Logger.blank();
  console.log("✅ All contracts deployed successfully!");
  Logger.blank();
  Logger.separator();

  return {
    auditLoggerAddress,
    deployerAddress: deployer.address,
  };
}

// =============================================================================
// Post-Deployment Configuration
// =============================================================================

async function configureAuditLogger(
  auditLoggerAddress: string,
  deployer: HardhatEthersSigner,
  additionalLoggers?: string[]
): Promise<void> {
  Logger.header("AUDIT LOGGER CONFIGURATION");
  Logger.blank();

  const auditLogger = await ethers.getContractAt("AuditLogger", auditLoggerAddress, deployer);

  if (additionalLoggers && additionalLoggers.length > 0) {
    Logger.step(1, "Adding Additional Loggers");

    for (const loggerAddress of additionalLoggers) {
      Logger.info(`Adding logger: ${loggerAddress}`);
      const tx = await auditLogger.addLogger(loggerAddress);
      await tx.wait();
      Logger.success(`Logger added: ${Logger.maskAddress(loggerAddress)}`);
    }
    Logger.blank();
  }

  Logger.success("Configuration complete!");
  Logger.blank();
  Logger.separator();
}

// =============================================================================
// Main Deployment Script
// =============================================================================

async function main(): Promise<void> {
  try {
    // Validate environment
    validateEnvironment();

    // Get deployer
    const [deployer] = await ethers.getSigners();

    if (!deployer) {
      throw new Error("No deployer account available");
    }

    // Deploy contracts
    const deployment = await deployAuditLogger(deployer);

    // Optional: Configure with additional loggers
    // Uncomment and add addresses as needed:
    // await configureAuditLogger(deployment.auditLoggerAddress, deployer, [
    //   "0x...", // Add logger addresses here
    // ]);

    // Export for use in other scripts
    return;
  } catch (error) {
    Logger.error(`Deployment failed: ${error}`);
    process.exit(1);
  }
}

// =============================================================================
// Script Execution
// =============================================================================

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

// Export for use in other scripts
export { deployAuditLogger, configureAuditLogger };
