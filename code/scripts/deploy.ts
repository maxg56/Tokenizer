import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying Token42 with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  const INITIAL_SUPPLY = 1_000_000; // 1 million tokens

  // Déployer le contrat Token42
  const Token42 = await ethers.getContractFactory("Token42");
  const token = await Token42.deploy(INITIAL_SUPPLY);

  await token.waitForDeployment();

  const contractAddress = await token.getAddress();

  console.log("✅ Token42 deployed to:", contractAddress);
  console.log("📊 Initial supply:", INITIAL_SUPPLY, "TK42");
  console.log("🎯 Token name:", await token.name());
  console.log("🔤 Token symbol:", await token.symbol());
  console.log("🔢 Decimals:", await token.decimals());

  // Vérifier le solde du déployeur
  const deployerBalance = await token.balanceOf(deployer.address);
  console.log("💎 Deployer balance:", ethers.formatUnits(deployerBalance, 18), "TK42");

  // Afficher les informations utiles pour la vérification
  console.log("\n📋 Contract verification info:");
  console.log("Constructor args:", INITIAL_SUPPLY);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });