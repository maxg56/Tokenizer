import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying MaxToken42 Mining System...\n");

  // Obtenir le signer (deployer)
  const [deployer] = await ethers.getSigners();
  console.log("💰 Deploying with account:", deployer.address);
  console.log("💸 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // 1. Déployer le token MaxToken42Mining
  console.log("📄 Deploying MaxToken42Mining token...");
  const MaxToken42Mining = await ethers.getContractFactory("MaxToken42Mining");

  // Supply initial de 1M tokens (sera étendu par le minage jusqu'à 10M)
  const initialSupply = ethers.parseEther("1000000"); // 1M MTK42

  const token = await MaxToken42Mining.deploy(initialSupply);
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("✅ MaxToken42Mining deployed to:", tokenAddress);
  console.log("📊 Initial supply:", ethers.formatEther(initialSupply), "MTK42");
  console.log("📊 Max supply:", ethers.formatEther(await token.MAX_SUPPLY()), "MTK42\n");

  // 2. Déployer le contrat de minage
  console.log("⛏️  Deploying MiningContractV2...");
  const MiningContractV2 = await ethers.getContractFactory("MiningContractV2");

  const miningContract = await MiningContractV2.deploy(tokenAddress);
  await miningContract.waitForDeployment();

  const miningAddress = await miningContract.getAddress();
  console.log("✅ MiningContractV2 deployed to:", miningAddress);

  // 3. Configurer les permissions de minage
  console.log("\n🔐 Setting up mining permissions...");

  // Ajouter le contrat de minage comme mineur autorisé
  const addMinerTx = await token.addMiner(miningAddress);
  await addMinerTx.wait();
  console.log("✅ Mining contract granted MINER_ROLE");

  // Vérifier les permissions
  const canMint = await token.canMint(miningAddress);
  console.log("🔍 Mining contract can mint:", canMint);

  // 4. Configuration initiale du minage
  console.log("\n⚙️  Configuring mining parameters...");

  const baseReward = await miningContract.baseReward();
  const difficulty = await miningContract.difficulty();
  const blockTime = await miningContract.blockTime();

  console.log("💎 Base reward:", ethers.formatEther(baseReward), "MTK42");
  console.log("🎯 Initial difficulty:", difficulty.toString());
  console.log("⏰ Target block time:", blockTime.toString(), "seconds");

  // 5. Obtenir les statistiques initiales
  console.log("\n📊 Initial mining statistics:");
  const globalStats = await miningContract.getGlobalStats();
  console.log("🔢 Current block:", globalStats[0].toString());
  console.log("⛏️  Total mined:", ethers.formatEther(globalStats[1]), "MTK42");
  console.log("👥 Active miners:", globalStats[3].toString());
  console.log("🏆 Current block reward:", ethers.formatEther(globalStats[4]), "MTK42");

  // 6. Afficher les informations de déploiement
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("📄 MaxToken42Mining Token:", tokenAddress);
  console.log("⛏️  Mining Contract:", miningAddress);
  console.log("👤 Owner/Deployer:", deployer.address);
  console.log("🌐 Network:", (await deployer.provider.getNetwork()).name);
  console.log("=".repeat(60));

  // 7. Instructions pour l'utilisation
  console.log("\n📝 Next steps:");
  console.log("1. Update frontend config with these addresses:");
  console.log(`   TOKEN_ADDRESS: "${tokenAddress}"`);
  console.log(`   MINING_ADDRESS: "${miningAddress}"`);
  console.log("2. Verify contracts on block explorer if deploying to mainnet");
  console.log("3. Test mining functionality on testnet first");

  // 8. Sauvegarder les adresses pour le frontend
  const deploymentInfo = {
    network: (await deployer.provider.getNetwork()).name,
    chainId: (await deployer.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      MaxToken42Mining: {
        address: tokenAddress,
        initialSupply: ethers.formatEther(initialSupply),
        maxSupply: ethers.formatEther(await token.MAX_SUPPLY())
      },
      MiningContractV2: {
        address: miningAddress,
        baseReward: ethers.formatEther(baseReward),
        difficulty: difficulty.toString(),
        blockTime: blockTime.toString()
      }
    }
  };

  console.log("\n💾 Deployment info (save this for your records):");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return {
    token: tokenAddress,
    mining: miningAddress,
    deployer: deployer.address
  };
}

// Gestion des erreurs
main()
  .then((addresses) => {
    console.log("\n🚀 Deployment successful!");
    console.log("Token:", addresses.token);
    console.log("Mining:", addresses.mining);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });