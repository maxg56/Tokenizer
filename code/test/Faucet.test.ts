import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { MaxToken42Mining, Faucet } from "../typechain-types";

describe("Faucet", function () {
  async function deployFaucetFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy token
    const MaxToken42Mining = await ethers.getContractFactory("MaxToken42Mining");
    const initialSupply = ethers.parseEther("1000000");
    const token = await MaxToken42Mining.deploy(initialSupply);

    // Deploy faucet
    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy(await token.getAddress());

    // Fund the faucet
    const faucetFunding = ethers.parseEther("10000");
    await token.approve(await faucet.getAddress(), faucetFunding);
    await faucet.fund(faucetFunding);

    return { token, faucet, owner, user1, user2, faucetFunding };
  }

  describe("Deployment", function () {
    it("Should deploy with correct parameters", async function () {
      const { faucet, token, faucetFunding } = await loadFixture(deployFaucetFixture);

      expect(await faucet.token()).to.equal(await token.getAddress());
      expect(await faucet.dripAmount()).to.equal(ethers.parseEther("100"));
      expect(await faucet.cooldownTime()).to.equal(24 * 60 * 60); // 24 hours
    });

    it("Should have correct initial balance", async function () {
      const { faucet, token, faucetFunding } = await loadFixture(deployFaucetFixture);

      const balance = await token.balanceOf(await faucet.getAddress());
      expect(balance).to.equal(faucetFunding);
    });
  });

  describe("Drip", function () {
    it("Should allow users to drip tokens", async function () {
      const { faucet, token, user1 } = await loadFixture(deployFaucetFixture);

      const initialBalance = await token.balanceOf(user1.address);

      await expect(faucet.connect(user1).drip())
        .to.emit(faucet, "TokensDripped")
        .withArgs(user1.address, ethers.parseEther("100"));

      const finalBalance = await token.balanceOf(user1.address);
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("100"));
    });

    it("Should enforce cooldown", async function () {
      const { faucet, user1 } = await loadFixture(deployFaucetFixture);

      await faucet.connect(user1).drip();

      await expect(faucet.connect(user1).drip())
        .to.be.revertedWith("Cooldown not finished");
    });

    it("Should allow drip after cooldown", async function () {
      const { faucet, user1 } = await loadFixture(deployFaucetFixture);

      await faucet.connect(user1).drip();

      // Advance time by 24 hours
      await time.increase(24 * 60 * 60);

      await expect(faucet.connect(user1).drip()).to.not.be.reverted;
    });

    it("Should track user statistics", async function () {
      const { faucet, user1 } = await loadFixture(deployFaucetFixture);

      await faucet.connect(user1).drip();

      const stats = await faucet.getUserStats(user1.address);
      expect(stats._totalReceived).to.equal(ethers.parseEther("100"));
      expect(stats._canDrip).to.be.false;
    });
  });

  describe("Stats", function () {
    it("Should track global statistics", async function () {
      const { faucet, user1, user2 } = await loadFixture(deployFaucetFixture);

      await faucet.connect(user1).drip();

      // Advance time for user2
      await time.increase(1);

      await faucet.connect(user2).drip();

      const stats = await faucet.getStats();
      expect(stats._totalDistributed).to.equal(ethers.parseEther("200"));
      expect(stats._totalClaims).to.equal(2);
    });

    it("Should report canDrip correctly", async function () {
      const { faucet, user1 } = await loadFixture(deployFaucetFixture);

      let [canDrip, timeRemaining] = await faucet.canDrip(user1.address);
      expect(canDrip).to.be.true;
      expect(timeRemaining).to.equal(0);

      await faucet.connect(user1).drip();

      [canDrip, timeRemaining] = await faucet.canDrip(user1.address);
      expect(canDrip).to.be.false;
      expect(timeRemaining).to.be.gt(0);
    });
  });

  describe("Admin", function () {
    it("Should allow owner to change drip amount", async function () {
      const { faucet, owner } = await loadFixture(deployFaucetFixture);

      const newAmount = ethers.parseEther("50");
      await expect(faucet.connect(owner).setDripAmount(newAmount))
        .to.emit(faucet, "DripAmountUpdated");

      expect(await faucet.dripAmount()).to.equal(newAmount);
    });

    it("Should allow owner to change cooldown", async function () {
      const { faucet, owner } = await loadFixture(deployFaucetFixture);

      const newCooldown = 12 * 60 * 60; // 12 hours
      await expect(faucet.connect(owner).setCooldownTime(newCooldown))
        .to.emit(faucet, "CooldownUpdated");

      expect(await faucet.cooldownTime()).to.equal(newCooldown);
    });

    it("Should allow owner to pause/unpause", async function () {
      const { faucet, owner, user1 } = await loadFixture(deployFaucetFixture);

      await faucet.connect(owner).pause();

      await expect(faucet.connect(user1).drip())
        .to.be.revertedWithCustomError(faucet, "EnforcedPause");

      await faucet.connect(owner).unpause();

      await expect(faucet.connect(user1).drip()).to.not.be.reverted;
    });

    it("Should reject non-owner admin calls", async function () {
      const { faucet, user1 } = await loadFixture(deployFaucetFixture);

      await expect(faucet.connect(user1).setDripAmount(ethers.parseEther("50")))
        .to.be.revertedWithCustomError(faucet, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to withdraw tokens", async function () {
      const { faucet, token, owner } = await loadFixture(deployFaucetFixture);

      const withdrawAmount = ethers.parseEther("1000");
      const initialOwnerBalance = await token.balanceOf(owner.address);

      await faucet.connect(owner).withdrawTokens(owner.address, withdrawAmount);

      const finalOwnerBalance = await token.balanceOf(owner.address);
      expect(finalOwnerBalance - initialOwnerBalance).to.equal(withdrawAmount);
    });
  });
});
