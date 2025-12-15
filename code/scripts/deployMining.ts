import { ethers } from "hardhat";
import { trackDeployment, createDeploymentInfo } from "./utils/deploymentTracker";

async function main() {
  console.log("Deploying MaxToken42 Mining System...\n");

  // Obtenir le signer (deployer)
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // 1. Déployer le token MaxToken42Mining
  console.log("Deploying MaxToken42Mining token...");
  const MaxToken42Mining = await ethers.getContractFactory("MaxToken42Mining");

  // Supply initial de 1M tokens (sera étendu par le minage jusqu'à 10M)
  const initialSupply = ethers.parseEther("1000000"); // 1M MTK42

  const token = await MaxToken42Mining.deploy(initialSupply);
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("MaxToken42Mining deployed to:", tokenAddress);
  console.log("Initial supply:", ethers.formatEther(initialSupply), "MTK42");
  console.log("Max supply:", ethers.formatEther(await token.MAX_SUPPLY()), "MTK42\n");

  // 2. Déployer le contrat de minage
  console.log("Deploying MiningContract...");
  const MiningContract = await ethers.getContractFactory("MiningContract");

  const miningContract = await MiningContract.deploy(tokenAddress);
  await miningContract.waitForDeployment();

  const miningAddress = await miningContract.getAddress();
  console.log("MiningContract deployed to:", miningAddress);

  // 3. Configurer les permissions de minage
  console.log("\nSetting up mining permissions...");

  // Ajouter le contrat de minage comme mineur autorisé
  const addMinerTx = await token.addMiner(miningAddress);
  await addMinerTx.wait();
  console.log("Mining contract granted MINER_ROLE");

  // Vérifier les permissions
  const canMint = await token.canMint(miningAddress);
  console.log("Mining contract can mint:", canMint);

  // 4. Configuration initiale du minage
  console.log("\nConfiguring mining parameters...");

  const baseReward = await miningContract.baseReward();
  const difficulty = await miningContract.difficulty();
  const blockTime = await miningContract.blockTime();

  console.log("Base reward:", ethers.formatEther(baseReward), "MTK42");
  console.log("Initial difficulty:", difficulty.toString());
  console.log("Target block time:", blockTime.toString(), "seconds");

  // 5. Obtenir les statistiques initiales
  console.log("\nInitial mining statistics:");
  const globalStats = await miningContract.getGlobalStats();
  console.log("Current block:", globalStats[0].toString());
  console.log("Total mined:", ethers.formatEther(globalStats[1]), "MTK42");
  console.log("Active miners:", globalStats[3].toString());
  console.log("Current block reward:", ethers.formatEther(globalStats[4]), "MTK42");

  // 6. Get network info and track deployment
  const network = await deployer.provider.getNetwork();
  const chainId = Number(network.chainId);
  const networkName = network.name;

  const deploymentData = createDeploymentInfo(
    deployer.address,
    chainId,
    networkName,
    {
      token: {
        name: "MaxToken42Mining",
        address: tokenAddress,
        symbol: "MTK42"
      },
      mining: {
        name: "MiningContract",
        address: miningAddress
      }
    },
    {
      initialSupply: ethers.formatEther(initialSupply),
      maxSupply: ethers.formatEther(await token.MAX_SUPPLY()),
      miningBaseReward: ethers.formatEther(baseReward)
    }
  );

  console.log("\nSaving deployment to deployments.json...");
  trackDeployment(deploymentData);

  // 7. Afficher les informations de déploiement
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("MaxToken42Mining Token:", tokenAddress);
  console.log("Mining Contract:", miningAddress);
  console.log("Owner/Deployer:", deployer.address);
  console.log("Network:", networkName);
  console.log("=".repeat(60));

  // 8. Instructions pour l'utilisation
  console.log("\nNext steps:");
  console.log("1. Update frontend config with these addresses:");
  console.log(`   TOKEN_ADDRESS: "${tokenAddress}"`);
  console.log(`   MINING_ADDRESS: "${miningAddress}"`);
  console.log("2. Verify contracts on block explorer if deploying to mainnet");
  console.log("3. Test mining functionality on testnet first");

  return {
    token: tokenAddress,
    mining: miningAddress,
    deployer: deployer.address
  };
}

// Gestion des erreurs
main()
  .then((addresses) => {
    console.log("\nDeployment successful!");
    console.log("Token:", addresses.token);
    console.log("Mining:", addresses.mining);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nDeployment failed:");
    console.error(error);
    process.exit(1);
  });
