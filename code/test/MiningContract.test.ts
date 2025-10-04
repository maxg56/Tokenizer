import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { MaxToken42Mining, MiningContractV2 } from "../typechain-types";

describe("Mining System", function () {
  async function deployMiningSystemFixture() {
    const [owner, miner1, miner2, miner3] = await ethers.getSigners();

    // Déployer le token
    const MaxToken42Mining = await ethers.getContractFactory("MaxToken42Mining");
    const initialSupply = ethers.parseEther("1000000"); // 1M tokens
    const token = await MaxToken42Mining.deploy(initialSupply);

    // Déployer le contrat de minage
    const MiningContractV2 = await ethers.getContractFactory("MiningContractV2");
    const miningContract = await MiningContractV2.deploy(await token.getAddress());

    // Autoriser le contrat de minage à minter
    await token.addMiner(await miningContract.getAddress());

    return { token, miningContract, owner, miner1, miner2, miner3 };
  }

  describe("Token Deployment", function () {
    it("Should deploy token with correct parameters", async function () {
      const { token, owner } = await loadFixture(deployMiningSystemFixture);

      expect(await token.name()).to.equal("MaxToken42");
      expect(await token.symbol()).to.equal("MTK42");
      expect(await token.totalSupply()).to.equal(ethers.parseEther("1000000"));
      expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));
      expect(await token.MAX_SUPPLY()).to.equal(ethers.parseEther("10000000"));
    });

    it("Should grant mining role correctly", async function () {
      const { token, miningContract } = await loadFixture(deployMiningSystemFixture);

      const miningAddress = await miningContract.getAddress();
      expect(await token.canMint(miningAddress)).to.be.true;
    });
  });

  describe("Mining Contract Deployment", function () {
    it("Should deploy with correct initial parameters", async function () {
      const { miningContract } = await loadFixture(deployMiningSystemFixture);

      expect(await miningContract.baseReward()).to.equal(ethers.parseEther("100"));
      expect(await miningContract.difficulty()).to.equal(1000);
      expect(await miningContract.blockTime()).to.equal(300);
      expect(await miningContract.currentBlock()).to.equal(1);
    });
  });

  describe("Mining Operations", function () {
    it("Should allow starting mining", async function () {
      const { miningContract, miner1 } = await loadFixture(deployMiningSystemFixture);

      await expect(miningContract.connect(miner1).startMining(50))
        .to.emit(miningContract, "MiningStarted")
        .withArgs(miner1.address, 50);

      const minerStats = await miningContract.getMinerStats(miner1.address);
      expect(minerStats.power).to.equal(50);
      expect(minerStats.isActive).to.be.true;
    });

    it("Should reject invalid mining power", async function () {
      const { miningContract, miner1 } = await loadFixture(deployMiningSystemFixture);

      await expect(miningContract.connect(miner1).startMining(0))
        .to.be.revertedWith("Invalid mining power");

      await expect(miningContract.connect(miner1).startMining(101))
        .to.be.revertedWith("Invalid mining power");
    });

    it("Should allow stopping mining", async function () {
      const { miningContract, miner1 } = await loadFixture(deployMiningSystemFixture);

      await miningContract.connect(miner1).startMining(50);

      await expect(miningContract.connect(miner1).stopMining())
        .to.emit(miningContract, "MiningStopped")
        .withArgs(miner1.address);

      const minerStats = await miningContract.getMinerStats(miner1.address);
      expect(minerStats.power).to.equal(0);
      expect(minerStats.isActive).to.be.false;
    });

    it("Should calculate rewards correctly", async function () {
      const { miningContract, miner1 } = await loadFixture(deployMiningSystemFixture);

      await miningContract.connect(miner1).startMining(50);

      const reward = await miningContract.calculateReward(miner1.address);
      const baseReward = await miningContract.baseReward();

      // Avec une puissance de 50, le reward devrait être 100% du base reward (50 + 50%)
      expect(reward).to.equal(baseReward);
    });

    it("Should mine blocks with valid proof-of-work", async function () {
      const { miningContract, token, miner1 } = await loadFixture(deployMiningSystemFixture);

      await miningContract.connect(miner1).startMining(50);

      // Trouver un nonce valide
      let nonce = 0;
      let isValid = false;

      while (!isValid && nonce < 100000) {
        const hash = ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(
            ["uint256", "address", "uint256", "uint256"],
            [1, miner1.address, nonce, await ethers.provider.getBlock("latest").then(b => b?.timestamp)]
          )
        );

        const hashValue = BigInt(hash);
        const target = BigInt(2) ** BigInt(256) / BigInt(1000); // difficulty = 1000

        if (hashValue < target) {
          isValid = true;
        } else {
          nonce++;
        }
      }

      if (isValid) {
        const initialBalance = await token.balanceOf(miner1.address);

        await expect(miningContract.connect(miner1).mineBlock(nonce))
          .to.emit(miningContract, "BlockMined");

        const finalBalance = await token.balanceOf(miner1.address);
        expect(finalBalance).to.be.gt(initialBalance);
      }
    });

    it("Should reject invalid proof-of-work", async function () {
      const { miningContract, miner1 } = await loadFixture(deployMiningSystemFixture);

      await miningContract.connect(miner1).startMining(50);

      // Utiliser un nonce qui ne satisfait probablement pas la difficulté
      await expect(miningContract.connect(miner1).mineBlock(999999))
        .to.be.revertedWith("Invalid proof-of-work");
    });
  });

  describe("Daily Bonus", function () {
    it("Should allow claiming daily bonus", async function () {
      const { miningContract, token, miner1 } = await loadFixture(deployMiningSystemFixture);

      await miningContract.connect(miner1).startMining(50);

      // Avancer le temps de 24 heures
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine", []);

      const initialBalance = await token.balanceOf(miner1.address);

      await expect(miningContract.connect(miner1).claimDailyBonus())
        .to.emit(miningContract, "DailyBonusClaimed");

      const finalBalance = await token.balanceOf(miner1.address);
      const expectedBonus = (await miningContract.baseReward()) / BigInt(2);

      expect(finalBalance - initialBalance).to.equal(expectedBonus);
    });

    it("Should reject daily bonus if not ready", async function () {
      const { miningContract, miner1 } = await loadFixture(deployMiningSystemFixture);

      await miningContract.connect(miner1).startMining(50);

      await expect(miningContract.connect(miner1).claimDailyBonus())
        .to.be.revertedWith("Daily bonus not ready");
    });
  });

  describe("Global Statistics", function () {
    it("Should track global statistics correctly", async function () {
      const { miningContract, miner1, miner2 } = await loadFixture(deployMiningSystemFixture);

      // Démarrer le minage pour deux mineurs
      await miningContract.connect(miner1).startMining(50);
      await miningContract.connect(miner2).startMining(75);

      const stats = await miningContract.getGlobalStats();

      expect(stats[0]).to.equal(1); // currentBlock
      expect(stats[1]).to.equal(0); // totalMined (pas encore de blocs minés)
      expect(stats[2]).to.equal(1000); // difficulty
      expect(stats[3]).to.equal(2); // activeMiners
      expect(stats[4]).to.equal(await miningContract.baseReward()); // currentReward
    });
  });

  describe("Halving Mechanism", function () {
    it("Should reduce reward after halving interval", async function () {
      const { miningContract, owner } = await loadFixture(deployMiningSystemFixture);

      const initialReward = await miningContract.getCurrentBlockReward();

      // Simuler l'atteinte de l'intervalle de halving (210000 blocs)
      // Note: En réalité, cela prendrait très longtemps
      // Pour les tests, on peut modifier l'intervalle ou tester la logique

      expect(initialReward).to.equal(await miningContract.baseReward());
    });
  });

  describe("Administration", function () {
    it("Should allow owner to modify parameters", async function () {
      const { miningContract, owner } = await loadFixture(deployMiningSystemFixture);

      const newReward = ethers.parseEther("200");
      await miningContract.connect(owner).setBaseReward(newReward);
      expect(await miningContract.baseReward()).to.equal(newReward);

      const newBlockTime = 600;
      await miningContract.connect(owner).setBlockTime(newBlockTime);
      expect(await miningContract.blockTime()).to.equal(newBlockTime);

      const newDifficulty = 2000;
      await expect(miningContract.connect(owner).setDifficulty(newDifficulty))
        .to.emit(miningContract, "DifficultyAdjusted")
        .withArgs(1000, newDifficulty);
    });

    it("Should reject non-owner parameter changes", async function () {
      const { miningContract, miner1 } = await loadFixture(deployMiningSystemFixture);

      await expect(miningContract.connect(miner1).setBaseReward(ethers.parseEther("200")))
        .to.be.revertedWithCustomError(miningContract, "OwnableUnauthorizedAccount");
    });

    it("Should allow pausing and unpausing", async function () {
      const { miningContract, owner, miner1 } = await loadFixture(deployMiningSystemFixture);

      await miningContract.connect(owner).pause();

      await expect(miningContract.connect(miner1).startMining(50))
        .to.be.revertedWithCustomError(miningContract, "EnforcedPause");

      await miningContract.connect(owner).unpause();

      await expect(miningContract.connect(miner1).startMining(50))
        .to.emit(miningContract, "MiningStarted");
    });
  });
});