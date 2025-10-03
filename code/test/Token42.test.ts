import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("Token42", function () {
  let token: Contract;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;
  let addrs: Signer[];

  const INITIAL_SUPPLY = 1_000_000;
  const DECIMALS = 18;

  beforeEach(async function () {
    // Récupérer les comptes de test
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Déployer le contrat
    const Token42 = await ethers.getContractFactory("MaxToken42");
    token = await Token42.deploy(INITIAL_SUPPLY);
    await token.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.balanceOf(owner.getAddress())).to.equal(
        ethers.utils.parseUnits(INITIAL_SUPPLY.toString(), DECIMALS)
      );
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await token.balanceOf(owner.getAddress());
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have correct name and symbol", async function () {
      expect(await token.name()).to.equal("MaxToken42");
      expect(await token.symbol()).to.equal("TK42");
    });

    it("Should have correct decimals", async function () {
      expect(await token.decimals()).to.equal(DECIMALS);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.utils.parseUnits("50", DECIMALS);

      // Transférer 50 tokens du owner vers addr1
      await token.transfer(addr1.getAddress(), transferAmount);
      const addr1Balance = await token.balanceOf(addr1.getAddress());
      expect(addr1Balance).to.equal(transferAmount);

      // Transférer 50 tokens de addr1 vers addr2
      await token.connect(addr1).transfer(addr2.getAddress(), transferAmount);
      const addr2Balance = await token.balanceOf(addr2.getAddress());
      expect(addr2Balance).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.getAddress());
      const transferAmount = initialOwnerBalance.add(1);

      // Essayer de transférer plus que le solde disponible
      await expect(
        token.connect(addr1).transfer(owner.getAddress(), transferAmount)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.getAddress());
      const transferAmount = ethers.utils.parseUnits("100", DECIMALS);

      // Transférer 100 tokens du owner vers addr1
      await token.transfer(addr1.getAddress(), transferAmount);

      // Vérifier les nouveaux soldes
      const finalOwnerBalance = await token.balanceOf(owner.getAddress());
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(transferAmount));

      const addr1Balance = await token.balanceOf(addr1.getAddress());
      expect(addr1Balance).to.equal(transferAmount);
    });
  });

  describe("Allowances", function () {
    it("Should approve tokens for delegated transfer", async function () {
      const approveAmount = ethers.utils.parseUnits("100", DECIMALS);

      // Owner approuve addr1 pour dépenser 100 tokens
      await token.approve(addr1.getAddress(), approveAmount);

      expect(await token.allowance(owner.getAddress(), addr1.getAddress()))
        .to.equal(approveAmount);
    });

    it("Should allow delegated transfer", async function () {
      const approveAmount = ethers.utils.parseUnits("100", DECIMALS);
      const transferAmount = ethers.utils.parseUnits("50", DECIMALS);

      // Owner approuve addr1
      await token.approve(addr1.getAddress(), approveAmount);

      // addr1 transfère des tokens du owner vers addr2
      await token.connect(addr1).transferFrom(
        owner.getAddress(),
        addr2.getAddress(),
        transferAmount
      );

      expect(await token.balanceOf(addr2.getAddress())).to.equal(transferAmount);
      expect(await token.allowance(owner.getAddress(), addr1.getAddress()))
        .to.equal(approveAmount.sub(transferAmount));
    });

    it("Should fail delegated transfer if allowance is insufficient", async function () {
      const approveAmount = ethers.utils.parseUnits("50", DECIMALS);
      const transferAmount = ethers.utils.parseUnits("100", DECIMALS);

      // Owner approuve seulement 50 tokens
      await token.approve(addr1.getAddress(), approveAmount);

      // Essayer de transférer 100 tokens (plus que l'allowance)
      await expect(
        token.connect(addr1).transferFrom(
          owner.getAddress(),
          addr2.getAddress(),
          transferAmount
        )
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero transfers", async function () {
      const initialBalance = await token.balanceOf(addr1.getAddress());

      await token.transfer(addr1.getAddress(), 0);

      expect(await token.balanceOf(addr1.getAddress())).to.equal(initialBalance);
    });

    it("Should not allow transfer to zero address", async function () {
      const transferAmount = ethers.utils.parseUnits("50", DECIMALS);

      await expect(
        token.transfer(ethers.constants.AddressZero, transferAmount)
      ).to.be.revertedWith("ERC20: transfer to the zero address");
    });

    it("Should emit Transfer event", async function () {
      const transferAmount = ethers.utils.parseUnits("50", DECIMALS);

      await expect(token.transfer(addr1.getAddress(), transferAmount))
        .to.emit(token, "Transfer")
        .withArgs(owner.getAddress(), addr1.getAddress(), transferAmount);
    });

    it("Should emit Approval event", async function () {
      const approveAmount = ethers.utils.parseUnits("100", DECIMALS);

      await expect(token.approve(addr1.getAddress(), approveAmount))
        .to.emit(token, "Approval")
        .withArgs(owner.getAddress(), addr1.getAddress(), approveAmount);
    });
  });
});