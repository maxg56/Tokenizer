import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { MaxToken42 } from "../typechain-types";

describe("Token42", function () {
  let token: MaxToken42;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;
  let addrs: HardhatEthersSigner[];

  // Initial supply en wei (1 million de tokens avec 18 decimales)
  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const DECIMALS = 18;

  beforeEach(async function () {
    // Récupérer les comptes de test
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Déployer le contrat avec la supply en wei
    const Token42 = await ethers.getContractFactory("MaxToken42");
    token = await Token42.deploy(INITIAL_SUPPLY);
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have correct name and symbol", async function () {
      expect(await token.name()).to.equal("MaxToken42");
      expect(await token.symbol()).to.equal("MTK42");
    });

    it("Should have correct decimals", async function () {
      expect(await token.decimals()).to.equal(DECIMALS);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseUnits("50", DECIMALS);

      // Transférer 50 tokens du owner vers addr1
      await token.transfer(addr1.address, transferAmount);
      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);

      // Transférer 50 tokens de addr1 vers addr2
      await token.connect(addr1).transfer(addr2.address, transferAmount);
      const addr2Balance = await token.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.address);
      const transferAmount = initialOwnerBalance + 1n;

      // Essayer de transférer plus que le solde disponible (addr1 n'a pas de tokens)
      // OpenZeppelin v5 utilise des custom errors
      await expect(
        token.connect(addr1).transfer(owner.address, transferAmount)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.address);
      const transferAmount = ethers.parseUnits("100", DECIMALS);

      // Transférer 100 tokens du owner vers addr1
      await token.transfer(addr1.address, transferAmount);

      // Vérifier les nouveaux soldes (utiliser BigInt natif au lieu de .sub())
      const finalOwnerBalance = await token.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - transferAmount);

      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);
    });
  });

  describe("Allowances", function () {
    it("Should approve tokens for delegated transfer", async function () {
      const approveAmount = ethers.parseUnits("100", DECIMALS);

      // Owner approuve addr1 pour dépenser 100 tokens
      await token.approve(addr1.address, approveAmount);

      expect(await token.allowance(owner.address, addr1.address))
        .to.equal(approveAmount);
    });

    it("Should allow delegated transfer", async function () {
      const approveAmount = ethers.parseUnits("100", DECIMALS);
      const transferAmount = ethers.parseUnits("50", DECIMALS);

      // Owner approuve addr1
      await token.approve(addr1.address, approveAmount);

      // addr1 transfère des tokens du owner vers addr2
      await token.connect(addr1).transferFrom(
        owner.address,
        addr2.address,
        transferAmount
      );

      expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
      // Utiliser BigInt natif au lieu de .sub()
      expect(await token.allowance(owner.address, addr1.address))
        .to.equal(approveAmount - transferAmount);
    });

    it("Should fail delegated transfer if allowance is insufficient", async function () {
      const approveAmount = ethers.parseUnits("50", DECIMALS);
      const transferAmount = ethers.parseUnits("100", DECIMALS);

      // Owner approuve seulement 50 tokens
      await token.approve(addr1.address, approveAmount);

      // Essayer de transférer 100 tokens (plus que l'allowance)
      // OpenZeppelin v5 utilise des custom errors
      await expect(
        token.connect(addr1).transferFrom(
          owner.address,
          addr2.address,
          transferAmount
        )
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero transfers", async function () {
      const initialBalance = await token.balanceOf(addr1.address);

      await token.transfer(addr1.address, 0);

      expect(await token.balanceOf(addr1.address)).to.equal(initialBalance);
    });

    it("Should not allow transfer to zero address", async function () {
      const transferAmount = ethers.parseUnits("50", DECIMALS);

      // OpenZeppelin v5 utilise des custom errors
      await expect(
        token.transfer(ethers.ZeroAddress, transferAmount)
      ).to.be.revertedWithCustomError(token, "ERC20InvalidReceiver");
    });

    it("Should emit Transfer event", async function () {
      const transferAmount = ethers.parseUnits("50", DECIMALS);

      await expect(token.transfer(addr1.address, transferAmount))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, addr1.address, transferAmount);
    });

    it("Should emit Approval event", async function () {
      const approveAmount = ethers.parseUnits("100", DECIMALS);

      await expect(token.approve(addr1.address, approveAmount))
        .to.emit(token, "Approval")
        .withArgs(owner.address, addr1.address, approveAmount);
    });
  });
});
