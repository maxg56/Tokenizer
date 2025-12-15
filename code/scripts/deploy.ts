import { ethers } from "hardhat";
import { trackDeployment, createDeploymentInfo } from "./utils/deploymentTracker";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying Token42 with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1 million tokens with 18 decimals

  // Déployer le contrat MaxToken42
  const MaxToken42 = await ethers.getContractFactory("MaxToken42");
  const token = await MaxToken42.deploy(INITIAL_SUPPLY);

  await token.waitForDeployment();

  const contractAddress = await token.getAddress();

  console.log("MaxToken42 deployed to:", contractAddress);
  console.log("Initial supply:", INITIAL_SUPPLY.toString(), "MTK42");
  console.log("Token name:", await token.name());
  console.log("Token symbol:", await token.symbol());
  console.log("Decimals:", await token.decimals());

  // Vérifier le solde du déployeur
  const deployerBalance = await token.balanceOf(deployer.address);
  console.log("Deployer balance:", ethers.formatUnits(deployerBalance, 18), "MTK42");

  // Get network info
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const networkName = network.name;

  // Track deployment
  const deploymentData = createDeploymentInfo(
    deployer.address,
    chainId,
    networkName,
    {
      token: {
        name: "MaxToken42",
        address: contractAddress,
        symbol: "MTK42"
      }
    },
    {
      initialSupply: "1000000"
    }
  );

  console.log("\nSaving deployment to deployments.json...");
  trackDeployment(deploymentData);

  // Afficher les informations utiles pour la vérification
  console.log("\nContract verification info:");
  console.log("Constructor args:", INITIAL_SUPPLY.toString());
  console.log("Network:", networkName);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
