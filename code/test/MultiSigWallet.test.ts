import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { MultiSigWallet } from "../typechain-types";

describe("MultiSigWallet", function () {
  async function deployMultiSigFixture() {
    const [owner1, owner2, owner3, nonOwner] = await ethers.getSigners();

    const owners = [owner1.address, owner2.address, owner3.address];
    const requiredConfirmations = 2;

    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const multiSig = await MultiSigWallet.deploy(owners, requiredConfirmations);

    // Fund the wallet
    await owner1.sendTransaction({
      to: await multiSig.getAddress(),
      value: ethers.parseEther("10")
    });

    return { multiSig, owner1, owner2, owner3, nonOwner, owners, requiredConfirmations };
  }

  describe("Deployment", function () {
    it("Should deploy with correct owners", async function () {
      const { multiSig, owners } = await loadFixture(deployMultiSigFixture);

      const walletOwners = await multiSig.getOwners();
      expect(walletOwners).to.deep.equal(owners);
    });

    it("Should set correct required confirmations", async function () {
      const { multiSig, requiredConfirmations } = await loadFixture(deployMultiSigFixture);

      expect(await multiSig.numConfirmationsRequired()).to.equal(requiredConfirmations);
    });

    it("Should reject empty owners list", async function () {
      const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");

      await expect(MultiSigWallet.deploy([], 1))
        .to.be.revertedWith("Owners required");
    });

    it("Should reject invalid confirmation count", async function () {
      const [owner1] = await ethers.getSigners();
      const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");

      await expect(MultiSigWallet.deploy([owner1.address], 2))
        .to.be.revertedWith("Invalid number of required confirmations");
    });
  });

  describe("Receive ETH", function () {
    it("Should receive ETH and emit event", async function () {
      const { multiSig, nonOwner } = await loadFixture(deployMultiSigFixture);

      await expect(
        nonOwner.sendTransaction({
          to: await multiSig.getAddress(),
          value: ethers.parseEther("1")
        })
      ).to.emit(multiSig, "Deposit");
    });

    it("Should have correct balance", async function () {
      const { multiSig } = await loadFixture(deployMultiSigFixture);

      const balance = await ethers.provider.getBalance(await multiSig.getAddress());
      expect(balance).to.equal(ethers.parseEther("10"));
    });
  });

  describe("Submit Transaction", function () {
    it("Should allow owner to submit transaction", async function () {
      const { multiSig, owner1, nonOwner } = await loadFixture(deployMultiSigFixture);

      await expect(
        multiSig.connect(owner1).submitTransaction(
          nonOwner.address,
          ethers.parseEther("1"),
          "0x"
        )
      ).to.emit(multiSig, "SubmitTransaction");

      expect(await multiSig.getTransactionCount()).to.equal(1);
    });

    it("Should reject non-owner submission", async function () {
      const { multiSig, nonOwner } = await loadFixture(deployMultiSigFixture);

      await expect(
        multiSig.connect(nonOwner).submitTransaction(
          nonOwner.address,
          ethers.parseEther("1"),
          "0x"
        )
      ).to.be.revertedWith("Not owner");
    });
  });

  describe("Confirm Transaction", function () {
    it("Should allow owner to confirm", async function () {
      const { multiSig, owner1, owner2, nonOwner } = await loadFixture(deployMultiSigFixture);

      await multiSig.connect(owner1).submitTransaction(
        nonOwner.address,
        ethers.parseEther("1"),
        "0x"
      );

      await expect(multiSig.connect(owner2).confirmTransaction(0))
        .to.emit(multiSig, "ConfirmTransaction")
        .withArgs(owner2.address, 0);

      const tx = await multiSig.getTransaction(0);
      expect(tx.numConfirmations).to.equal(1);
    });

    it("Should reject double confirmation", async function () {
      const { multiSig, owner1, nonOwner } = await loadFixture(deployMultiSigFixture);

      await multiSig.connect(owner1).submitTransaction(
        nonOwner.address,
        ethers.parseEther("1"),
        "0x"
      );

      await multiSig.connect(owner1).confirmTransaction(0);

      await expect(multiSig.connect(owner1).confirmTransaction(0))
        .to.be.revertedWith("Tx already confirmed");
    });

    it("Should reject non-owner confirmation", async function () {
      const { multiSig, owner1, nonOwner } = await loadFixture(deployMultiSigFixture);

      await multiSig.connect(owner1).submitTransaction(
        nonOwner.address,
        ethers.parseEther("1"),
        "0x"
      );

      await expect(multiSig.connect(nonOwner).confirmTransaction(0))
        .to.be.revertedWith("Not owner");
    });
  });

  describe("Execute Transaction", function () {
    it("Should execute with enough confirmations", async function () {
      const { multiSig, owner1, owner2, nonOwner } = await loadFixture(deployMultiSigFixture);

      const transferAmount = ethers.parseEther("1");
      const initialBalance = await ethers.provider.getBalance(nonOwner.address);

      await multiSig.connect(owner1).submitTransaction(
        nonOwner.address,
        transferAmount,
        "0x"
      );

      await multiSig.connect(owner1).confirmTransaction(0);
      await multiSig.connect(owner2).confirmTransaction(0);

      await expect(multiSig.connect(owner1).executeTransaction(0))
        .to.emit(multiSig, "ExecuteTransaction");

      const finalBalance = await ethers.provider.getBalance(nonOwner.address);
      expect(finalBalance - initialBalance).to.equal(transferAmount);
    });

    it("Should reject with insufficient confirmations", async function () {
      const { multiSig, owner1, nonOwner } = await loadFixture(deployMultiSigFixture);

      await multiSig.connect(owner1).submitTransaction(
        nonOwner.address,
        ethers.parseEther("1"),
        "0x"
      );

      await multiSig.connect(owner1).confirmTransaction(0);

      await expect(multiSig.connect(owner1).executeTransaction(0))
        .to.be.revertedWith("Not enough confirmations");
    });

    it("Should reject double execution", async function () {
      const { multiSig, owner1, owner2, nonOwner } = await loadFixture(deployMultiSigFixture);

      await multiSig.connect(owner1).submitTransaction(
        nonOwner.address,
        ethers.parseEther("1"),
        "0x"
      );

      await multiSig.connect(owner1).confirmTransaction(0);
      await multiSig.connect(owner2).confirmTransaction(0);

      await multiSig.connect(owner1).executeTransaction(0);

      await expect(multiSig.connect(owner1).executeTransaction(0))
        .to.be.revertedWith("Tx already executed");
    });
  });

  describe("Revoke Confirmation", function () {
    it("Should allow revoking confirmation", async function () {
      const { multiSig, owner1, nonOwner } = await loadFixture(deployMultiSigFixture);

      await multiSig.connect(owner1).submitTransaction(
        nonOwner.address,
        ethers.parseEther("1"),
        "0x"
      );

      await multiSig.connect(owner1).confirmTransaction(0);

      await expect(multiSig.connect(owner1).revokeConfirmation(0))
        .to.emit(multiSig, "RevokeConfirmation");

      const tx = await multiSig.getTransaction(0);
      expect(tx.numConfirmations).to.equal(0);
    });

    it("Should reject revoking non-confirmed tx", async function () {
      const { multiSig, owner1, owner2, nonOwner } = await loadFixture(deployMultiSigFixture);

      await multiSig.connect(owner1).submitTransaction(
        nonOwner.address,
        ethers.parseEther("1"),
        "0x"
      );

      await expect(multiSig.connect(owner2).revokeConfirmation(0))
        .to.be.revertedWith("Tx not confirmed");
    });
  });

  describe("View Functions", function () {
    it("Should return pending transactions", async function () {
      const { multiSig, owner1, owner2, nonOwner } = await loadFixture(deployMultiSigFixture);

      // Submit 3 transactions
      await multiSig.connect(owner1).submitTransaction(nonOwner.address, ethers.parseEther("1"), "0x");
      await multiSig.connect(owner1).submitTransaction(nonOwner.address, ethers.parseEther("2"), "0x");
      await multiSig.connect(owner1).submitTransaction(nonOwner.address, ethers.parseEther("3"), "0x");

      // Execute first one
      await multiSig.connect(owner1).confirmTransaction(0);
      await multiSig.connect(owner2).confirmTransaction(0);
      await multiSig.connect(owner1).executeTransaction(0);

      const pending = await multiSig.getPendingTransactions();
      expect(pending.length).to.equal(2);
      expect(pending[0]).to.equal(1);
      expect(pending[1]).to.equal(2);
    });

    it("Should report canExecute correctly", async function () {
      const { multiSig, owner1, owner2, nonOwner } = await loadFixture(deployMultiSigFixture);

      await multiSig.connect(owner1).submitTransaction(nonOwner.address, ethers.parseEther("1"), "0x");

      expect(await multiSig.canExecute(0)).to.be.false;

      await multiSig.connect(owner1).confirmTransaction(0);
      expect(await multiSig.canExecute(0)).to.be.false;

      await multiSig.connect(owner2).confirmTransaction(0);
      expect(await multiSig.canExecute(0)).to.be.true;
    });

    it("Should return confirmations", async function () {
      const { multiSig, owner1, owner2, nonOwner } = await loadFixture(deployMultiSigFixture);

      await multiSig.connect(owner1).submitTransaction(nonOwner.address, ethers.parseEther("1"), "0x");

      await multiSig.connect(owner1).confirmTransaction(0);
      await multiSig.connect(owner2).confirmTransaction(0);

      const confirmations = await multiSig.getConfirmations(0);
      expect(confirmations).to.include(owner1.address);
      expect(confirmations).to.include(owner2.address);
      expect(confirmations.length).to.equal(2);
    });
  });

  describe("Governance", function () {
    it("Should add owner via multisig", async function () {
      const { multiSig, owner1, owner2, nonOwner } = await loadFixture(deployMultiSigFixture);

      // Encode the addOwner call
      const addOwnerData = multiSig.interface.encodeFunctionData("addOwner", [nonOwner.address]);

      // Submit transaction to add owner
      await multiSig.connect(owner1).submitTransaction(
        await multiSig.getAddress(),
        0,
        addOwnerData
      );

      await multiSig.connect(owner1).confirmTransaction(0);
      await multiSig.connect(owner2).confirmTransaction(0);

      await multiSig.connect(owner1).executeTransaction(0);

      expect(await multiSig.isOwner(nonOwner.address)).to.be.true;
      const owners = await multiSig.getOwners();
      expect(owners.length).to.equal(4);
    });

    it("Should change requirement via multisig", async function () {
      const { multiSig, owner1, owner2 } = await loadFixture(deployMultiSigFixture);

      const changeData = multiSig.interface.encodeFunctionData("changeRequirement", [3]);

      await multiSig.connect(owner1).submitTransaction(
        await multiSig.getAddress(),
        0,
        changeData
      );

      await multiSig.connect(owner1).confirmTransaction(0);
      await multiSig.connect(owner2).confirmTransaction(0);

      await multiSig.connect(owner1).executeTransaction(0);

      expect(await multiSig.numConfirmationsRequired()).to.equal(3);
    });
  });
});
