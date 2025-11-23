import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("=".repeat(60));
  console.log("MaxToken42 Complete System Deployment");
  console.log("=".repeat(60));
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  console.log("");

  // === 1. Deploy Token ===
  console.log("1. Deploying MaxToken42Mining Token...");
  const initialSupply = ethers.parseEther("1000000"); // 1M tokens
  const MaxToken42Mining = await ethers.getContractFactory("MaxToken42Mining");
  const token = await MaxToken42Mining.deploy(initialSupply);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`   Token deployed at: ${tokenAddress}`);
  console.log(`   Initial supply: 1,000,000 MTK42`);
  console.log(`   Max supply: 10,000,000 MTK42`);
  console.log("");

  // === 2. Deploy Mining Contract ===
  console.log("2. Deploying MiningContract...");
  const MiningContract = await ethers.getContractFactory("MiningContract");
  const mining = await MiningContract.deploy(tokenAddress);
  await mining.waitForDeployment();
  const miningAddress = await mining.getAddress();
  console.log(`   Mining contract deployed at: ${miningAddress}`);
  console.log("");

  // Grant MINER_ROLE to mining contract
  console.log("   Granting MINER_ROLE to mining contract...");
  const grantTx = await token.addMiner(miningAddress);
  await grantTx.wait();
  console.log("   MINER_ROLE granted successfully");
  console.log("");

  // === 3. Deploy Faucet ===
  console.log("3. Deploying Faucet...");
  const Faucet = await ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy(tokenAddress);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log(`   Faucet deployed at: ${faucetAddress}`);
  console.log("");

  // Fund the faucet
  console.log("   Funding faucet with 100,000 MTK42...");
  const faucetFunding = ethers.parseEther("100000");
  const approveTx = await token.approve(faucetAddress, faucetFunding);
  await approveTx.wait();
  const fundTx = await faucet.fund(faucetFunding);
  await fundTx.wait();
  console.log("   Faucet funded successfully");
  console.log("");

  // === 4. Deploy MultiSig ===
  console.log("4. Deploying MultiSigWallet...");
  // By default, create a 2-of-3 multisig with the deployer
  // In production, you should add other signers
  const multiSigOwners = [deployer.address];
  const requiredConfirmations = 1;

  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
  const multiSig = await MultiSigWallet.deploy(multiSigOwners, requiredConfirmations);
  await multiSig.waitForDeployment();
  const multiSigAddress = await multiSig.getAddress();
  console.log(`   MultiSig deployed at: ${multiSigAddress}`);
  console.log(`   Owners: ${multiSigOwners.join(", ")}`);
  console.log(`   Required confirmations: ${requiredConfirmations}`);
  console.log("");

  // === Summary ===
  console.log("=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("");
  console.log("Contract Addresses:");
  console.log(`  Token (MTK42):     ${tokenAddress}`);
  console.log(`  Mining Contract:   ${miningAddress}`);
  console.log(`  Faucet:            ${faucetAddress}`);
  console.log(`  MultiSig Wallet:   ${multiSigAddress}`);
  console.log("");
  console.log("Token Stats:");
  console.log(`  Name:              MaxToken42`);
  console.log(`  Symbol:            MTK42`);
  console.log(`  Decimals:          18`);
  console.log(`  Initial Supply:    1,000,000 MTK42`);
  console.log(`  Max Supply:        10,000,000 MTK42`);
  console.log(`  Faucet Balance:    100,000 MTK42`);
  console.log("");
  console.log("Mining Config:");
  console.log(`  Base Reward:       100 MTK42`);
  console.log(`  Difficulty:        1000`);
  console.log(`  Block Time:        300s (5 min)`);
  console.log(`  Halving Interval:  210,000 blocks`);
  console.log("");
  console.log("Faucet Config:");
  console.log(`  Drip Amount:       100 MTK42`);
  console.log(`  Cooldown:          24 hours`);
  console.log(`  Daily Limit:       1000 claims`);
  console.log("");

  // Save deployment info to JSON
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      token: {
        address: tokenAddress,
        name: "MaxToken42Mining",
        symbol: "MTK42"
      },
      mining: {
        address: miningAddress,
        name: "MiningContract"
      },
      faucet: {
        address: faucetAddress,
        name: "Faucet"
      },
      multiSig: {
        address: multiSigAddress,
        name: "MultiSigWallet"
      }
    }
  };

  console.log("Deployment JSON for frontend config:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("");
  console.log("=".repeat(60));
  console.log("Deployment completed successfully!");
  console.log("=".repeat(60));

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
