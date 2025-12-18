import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { AuditLogger } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("AuditLogger", function () {
  let auditLogger: AuditLogger;
  let owner: HardhatEthersSigner;
  let logger1: HardhatEthersSigner;
  let logger2: HardhatEthersSigner;
  let actor1: HardhatEthersSigner;
  let actor2: HardhatEthersSigner;
  let contract1: HardhatEthersSigner;
  let contract2: HardhatEthersSigner;

  // Enum values for AuditEventType
  const AuditEventType = {
    TOKEN_MINTED: 0,
    TOKEN_BURNED: 1,
    TOKEN_TRANSFERRED: 2,
    MINING_STARTED: 3,
    MINING_STOPPED: 4,
    BLOCK_MINED: 5,
    DAILY_BONUS_CLAIMED: 6,
    FAUCET_DRIP: 7,
    MULTISIG_TRANSACTION_SUBMITTED: 8,
    MULTISIG_TRANSACTION_CONFIRMED: 9,
    MULTISIG_TRANSACTION_EXECUTED: 10,
    MULTISIG_TRANSACTION_REVOKED: 11,
    ROLE_GRANTED: 12,
    ROLE_REVOKED: 13,
    OWNERSHIP_TRANSFERRED: 14,
    CONTRACT_PAUSED: 15,
    CONTRACT_UNPAUSED: 16,
    CONFIGURATION_CHANGED: 17,
  };

  beforeEach(async function () {
    [owner, logger1, logger2, actor1, actor2, contract1, contract2] = await ethers.getSigners();

    const AuditLoggerFactory = await ethers.getContractFactory("AuditLogger");
    auditLogger = await AuditLoggerFactory.deploy();
    await auditLogger.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner with admin role", async function () {
      const DEFAULT_ADMIN_ROLE = await auditLogger.DEFAULT_ADMIN_ROLE();
      expect(await auditLogger.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should grant AUDITOR_ROLE to owner", async function () {
      const AUDITOR_ROLE = await auditLogger.AUDITOR_ROLE();
      expect(await auditLogger.hasRole(AUDITOR_ROLE, owner.address)).to.be.true;
    });

    it("Should grant LOGGER_ROLE to owner", async function () {
      const LOGGER_ROLE = await auditLogger.LOGGER_ROLE();
      expect(await auditLogger.hasRole(LOGGER_ROLE, owner.address)).to.be.true;
    });

    it("Should start with zero logs", async function () {
      expect(await auditLogger.getLogCount()).to.equal(0);
    });

    it("Should emit AuditSystemDeployed event", async function () {
      const AuditLoggerFactory = await ethers.getContractFactory("AuditLogger");
      await expect(AuditLoggerFactory.deploy())
        .to.emit(AuditLoggerFactory, "AuditSystemDeployed");
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to add logger", async function () {
      await auditLogger.addLogger(logger1.address);
      expect(await auditLogger.canLog(logger1.address)).to.be.true;
    });

    it("Should emit LoggerAdded event", async function () {
      await expect(auditLogger.addLogger(logger1.address))
        .to.emit(auditLogger, "LoggerAdded")
        .withArgs(logger1.address, owner.address);
    });

    it("Should allow admin to remove logger", async function () {
      await auditLogger.addLogger(logger1.address);
      await auditLogger.removeLogger(logger1.address);
      expect(await auditLogger.canLog(logger1.address)).to.be.false;
    });

    it("Should emit LoggerRemoved event", async function () {
      await auditLogger.addLogger(logger1.address);
      await expect(auditLogger.removeLogger(logger1.address))
        .to.emit(auditLogger, "LoggerRemoved")
        .withArgs(logger1.address, owner.address);
    });

    it("Should prevent non-admin from adding logger", async function () {
      await expect(
        auditLogger.connect(logger1).addLogger(logger2.address)
      ).to.be.reverted;
    });

    it("Should reject zero address as logger", async function () {
      await expect(
        auditLogger.addLogger(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid logger address");
    });
  });

  describe("Logging Events", function () {
    beforeEach(async function () {
      // Grant logger role for testing
      await auditLogger.addLogger(logger1.address);
    });

    it("Should allow logger to log event", async function () {
      const data = ethers.toUtf8Bytes("Test data");
      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_MINTED,
        actor1.address,
        contract1.address,
        data
      );

      expect(await auditLogger.getLogCount()).to.equal(1);
    });

    it("Should emit AuditLog event with correct parameters", async function () {
      const data = ethers.toUtf8Bytes("Test data");
      const tx = await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_MINTED,
        actor1.address,
        contract1.address,
        data
      );

      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      await expect(tx)
        .to.emit(auditLogger, "AuditLog")
        .withArgs(
          0, // logId
          AuditEventType.TOKEN_MINTED,
          actor1.address,
          contract1.address,
          block!.timestamp,
          ethers.AnyValue // dataHash
        );
    });

    it("Should prevent non-logger from logging", async function () {
      const data = ethers.toUtf8Bytes("Test data");
      await expect(
        auditLogger.connect(actor1).logEvent(
          AuditEventType.TOKEN_MINTED,
          actor1.address,
          contract1.address,
          data
        )
      ).to.be.reverted;
    });

    it("Should reject zero address as actor", async function () {
      const data = ethers.toUtf8Bytes("Test data");
      await expect(
        auditLogger.connect(logger1).logEvent(
          AuditEventType.TOKEN_MINTED,
          ethers.ZeroAddress,
          contract1.address,
          data
        )
      ).to.be.revertedWith("Invalid actor address");
    });

    it("Should reject zero address as target contract", async function () {
      const data = ethers.toUtf8Bytes("Test data");
      await expect(
        auditLogger.connect(logger1).logEvent(
          AuditEventType.TOKEN_MINTED,
          actor1.address,
          ethers.ZeroAddress,
          data
        )
      ).to.be.revertedWith("Invalid target contract");
    });

    it("Should increment log counter correctly", async function () {
      const data = ethers.toUtf8Bytes("Test data");

      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_MINTED,
        actor1.address,
        contract1.address,
        data
      );
      expect(await auditLogger.getLogCount()).to.equal(1);

      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_BURNED,
        actor2.address,
        contract1.address,
        data
      );
      expect(await auditLogger.getLogCount()).to.equal(2);
    });

    it("Should update event type count", async function () {
      const data = ethers.toUtf8Bytes("Test data");

      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_MINTED,
        actor1.address,
        contract1.address,
        data
      );
      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_MINTED,
        actor2.address,
        contract1.address,
        data
      );

      expect(await auditLogger.eventTypeCount(AuditEventType.TOKEN_MINTED)).to.equal(2);
    });

    it("Should update actor activity count", async function () {
      const data = ethers.toUtf8Bytes("Test data");

      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_MINTED,
        actor1.address,
        contract1.address,
        data
      );
      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_BURNED,
        actor1.address,
        contract1.address,
        data
      );

      expect(await auditLogger.actorActivityCount(actor1.address)).to.equal(2);
    });
  });

  describe("Retrieving Logs", function () {
    beforeEach(async function () {
      await auditLogger.addLogger(logger1.address);

      // Create some test logs
      const data = ethers.toUtf8Bytes("Test data");
      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_MINTED,
        actor1.address,
        contract1.address,
        data
      );
      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_BURNED,
        actor2.address,
        contract1.address,
        data
      );
      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_TRANSFERRED,
        actor1.address,
        contract2.address,
        data
      );
    });

    it("Should retrieve log by ID", async function () {
      const log = await auditLogger.getLog(0);
      expect(log.eventType).to.equal(AuditEventType.TOKEN_MINTED);
      expect(log.actor).to.equal(actor1.address);
      expect(log.targetContract).to.equal(contract1.address);
    });

    it("Should revert when retrieving non-existent log", async function () {
      await expect(auditLogger.getLog(999)).to.be.revertedWith("Log ID does not exist");
    });

    it("Should retrieve logs by actor", async function () {
      const logs = await auditLogger.getLogsByActor(actor1.address, 0, 10);
      expect(logs.length).to.equal(2);
      expect(logs[0]).to.equal(0);
      expect(logs[1]).to.equal(2);
    });

    it("Should retrieve logs by type", async function () {
      const logs = await auditLogger.getLogsByType(AuditEventType.TOKEN_MINTED, 0, 10);
      expect(logs.length).to.equal(1);
      expect(logs[0]).to.equal(0);
    });

    it("Should retrieve logs by contract", async function () {
      const logs = await auditLogger.getLogsByContract(contract1.address, 0, 10);
      expect(logs.length).to.equal(2);
    });

    it("Should paginate results correctly", async function () {
      const logs = await auditLogger.getLogsByActor(actor1.address, 0, 1);
      expect(logs.length).to.equal(1);
      expect(logs[0]).to.equal(0);

      const logs2 = await auditLogger.getLogsByActor(actor1.address, 1, 1);
      expect(logs2.length).to.equal(1);
      expect(logs2[0]).to.equal(2);
    });

    it("Should handle offset beyond array length", async function () {
      const logs = await auditLogger.getLogsByActor(actor1.address, 999, 10);
      expect(logs.length).to.equal(0);
    });
  });

  describe("Time Range Queries", function () {
    let startTime: number;
    let midTime: number;
    let endTime: number;

    beforeEach(async function () {
      await auditLogger.addLogger(logger1.address);
      const data = ethers.toUtf8Bytes("Test data");

      // Log at start
      startTime = await time.latest();
      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_MINTED,
        actor1.address,
        contract1.address,
        data
      );

      // Advance time and log again
      await time.increase(3600); // 1 hour
      midTime = await time.latest();
      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_BURNED,
        actor2.address,
        contract1.address,
        data
      );

      // Advance time and log again
      await time.increase(3600); // 1 hour
      endTime = await time.latest();
      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_TRANSFERRED,
        actor1.address,
        contract1.address,
        data
      );
    });

    it("Should retrieve logs in time range", async function () {
      const logs = await auditLogger.getLogsByTimeRange(startTime, endTime, 0, 10);
      expect(logs.length).to.equal(3);
    });

    it("Should retrieve logs in partial time range", async function () {
      const logs = await auditLogger.getLogsByTimeRange(startTime, midTime, 0, 10);
      expect(logs.length).to.equal(2);
    });

    it("Should revert for invalid time range", async function () {
      await expect(
        auditLogger.getLogsByTimeRange(endTime, startTime, 0, 10)
      ).to.be.revertedWith("Invalid time range");
    });

    it("Should revert for future end time", async function () {
      const futureTime = (await time.latest()) + 86400;
      await expect(
        auditLogger.getLogsByTimeRange(startTime, futureTime, 0, 10)
      ).to.be.revertedWith("End time cannot be in the future");
    });
  });

  describe("Log Integrity Verification", function () {
    beforeEach(async function () {
      await auditLogger.addLogger(logger1.address);
      const data = ethers.toUtf8Bytes("Test data");
      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_MINTED,
        actor1.address,
        contract1.address,
        data
      );
    });

    it("Should verify log integrity", async function () {
      expect(await auditLogger.verifyLogIntegrity(0)).to.be.true;
    });

    it("Should revert for non-existent log", async function () {
      await expect(auditLogger.verifyLogIntegrity(999))
        .to.be.revertedWith("Log ID does not exist");
    });
  });

  describe("Statistics", function () {
    beforeEach(async function () {
      await auditLogger.addLogger(logger1.address);
      const data = ethers.toUtf8Bytes("Test data");

      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_MINTED,
        actor1.address,
        contract1.address,
        data
      );
      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_BURNED,
        actor1.address,
        contract1.address,
        data
      );
      await auditLogger.connect(logger1).logEvent(
        AuditEventType.BLOCK_MINED,
        actor2.address,
        contract1.address,
        data
      );
      await auditLogger.connect(logger1).logEvent(
        AuditEventType.TOKEN_TRANSFERRED,
        actor1.address,
        contract1.address,
        data
      );
    });

    it("Should return global stats", async function () {
      const stats = await auditLogger.getGlobalStats();
      expect(stats.totalLogs).to.equal(4);
      expect(stats.mintEvents).to.equal(1);
      expect(stats.burnEvents).to.equal(1);
      expect(stats.miningEvents).to.equal(1);
    });

    it("Should return actor stats", async function () {
      const stats = await auditLogger.getActorStats(actor1.address);
      expect(stats.totalActions).to.equal(3);
      expect(stats.mintActions).to.equal(1);
      expect(stats.burnActions).to.equal(1);
      expect(stats.transferActions).to.equal(1);
      expect(stats.lastActivityTime).to.be.gt(0);
    });

    it("Should reject zero address for actor stats", async function () {
      await expect(
        auditLogger.getActorStats(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid actor address");
    });
  });

  describe("Pause Functionality", function () {
    beforeEach(async function () {
      await auditLogger.addLogger(logger1.address);
    });

    it("Should allow admin to pause", async function () {
      await auditLogger.pause();
      expect(await auditLogger.paused()).to.be.true;
    });

    it("Should emit AuditSystemPaused event", async function () {
      const tx = await auditLogger.pause();
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      await expect(tx)
        .to.emit(auditLogger, "AuditSystemPaused")
        .withArgs(owner.address, block!.timestamp);
    });

    it("Should prevent logging when paused", async function () {
      await auditLogger.pause();
      const data = ethers.toUtf8Bytes("Test data");

      await expect(
        auditLogger.connect(logger1).logEvent(
          AuditEventType.TOKEN_MINTED,
          actor1.address,
          contract1.address,
          data
        )
      ).to.be.revertedWithCustomError(auditLogger, "EnforcedPause");
    });

    it("Should allow admin to unpause", async function () {
      await auditLogger.pause();
      await auditLogger.unpause();
      expect(await auditLogger.paused()).to.be.false;
    });

    it("Should emit AuditSystemUnpaused event", async function () {
      await auditLogger.pause();
      const tx = await auditLogger.unpause();
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      await expect(tx)
        .to.emit(auditLogger, "AuditSystemUnpaused")
        .withArgs(owner.address, block!.timestamp);
    });

    it("Should allow logging after unpause", async function () {
      await auditLogger.pause();
      await auditLogger.unpause();

      const data = ethers.toUtf8Bytes("Test data");
      await expect(
        auditLogger.connect(logger1).logEvent(
          AuditEventType.TOKEN_MINTED,
          actor1.address,
          contract1.address,
          data
        )
      ).to.not.be.reverted;
    });

    it("Should prevent non-admin from pausing", async function () {
      await expect(auditLogger.connect(actor1).pause()).to.be.reverted;
    });
  });
});
