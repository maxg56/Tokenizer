// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./MaxToken42Mining.sol";

/**
 * @title Faucet
 * @dev Faucet pour distribuer des tokens MTK42 aux utilisateurs
 * Utile pour les testnets et le onboarding de nouveaux utilisateurs
 */
contract Faucet is Ownable, ReentrancyGuard, Pausable {
    MaxToken42Mining public immutable token;

    // Configuration du faucet
    uint256 public dripAmount = 100 * 10**18; // 100 MTK42 par demande
    uint256 public cooldownTime = 24 hours; // Cooldown entre les demandes
    uint256 public maxDailyDrips = 1000; // Maximum de distributions par jour

    // Statistiques
    uint256 public totalDistributed;
    uint256 public totalClaims;
    uint256 public dailyDrips;
    uint256 public lastResetTime;

    // Mapping des dernières demandes par utilisateur
    mapping(address => uint256) public lastDripTime;
    mapping(address => uint256) public totalReceived;

    // Events
    event TokensDripped(address indexed recipient, uint256 amount);
    event DripAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event CooldownUpdated(uint256 oldCooldown, uint256 newCooldown);
    event FaucetFunded(address indexed funder, uint256 amount);
    event TokensWithdrawn(address indexed to, uint256 amount);

    constructor(address _token) Ownable(msg.sender) {
        token = MaxToken42Mining(_token);
        lastResetTime = block.timestamp;
    }

    /**
     * @dev Demander des tokens du faucet
     */
    function drip() external nonReentrant whenNotPaused {
        require(
            block.timestamp >= lastDripTime[msg.sender] + cooldownTime,
            "Cooldown not finished"
        );

        // Reset quotidien
        if (block.timestamp >= lastResetTime + 1 days) {
            dailyDrips = 0;
            lastResetTime = block.timestamp;
        }

        require(dailyDrips < maxDailyDrips, "Daily limit reached");

        uint256 balance = token.balanceOf(address(this));
        require(balance >= dripAmount, "Faucet empty");

        lastDripTime[msg.sender] = block.timestamp;
        totalReceived[msg.sender] += dripAmount;
        totalDistributed += dripAmount;
        totalClaims++;
        dailyDrips++;

        require(token.transfer(msg.sender, dripAmount), "Transfer failed");

        emit TokensDripped(msg.sender, dripAmount);
    }

    /**
     * @dev Vérifier si un utilisateur peut demander des tokens
     */
    function canDrip(address user) external view returns (bool, uint256) {
        if (block.timestamp < lastDripTime[user] + cooldownTime) {
            uint256 timeRemaining = (lastDripTime[user] + cooldownTime) - block.timestamp;
            return (false, timeRemaining);
        }
        return (true, 0);
    }

    /**
     * @dev Obtenir les statistiques du faucet
     */
    function getStats() external view returns (
        uint256 _balance,
        uint256 _dripAmount,
        uint256 _cooldownTime,
        uint256 _totalDistributed,
        uint256 _totalClaims,
        uint256 _dailyDripsRemaining
    ) {
        uint256 currentDailyDrips = dailyDrips;
        if (block.timestamp >= lastResetTime + 1 days) {
            currentDailyDrips = 0;
        }

        return (
            token.balanceOf(address(this)),
            dripAmount,
            cooldownTime,
            totalDistributed,
            totalClaims,
            maxDailyDrips - currentDailyDrips
        );
    }

    /**
     * @dev Obtenir les statistiques d'un utilisateur
     */
    function getUserStats(address user) external view returns (
        uint256 _totalReceived,
        uint256 _lastDripTime,
        bool _canDrip,
        uint256 _timeUntilNextDrip
    ) {
        bool canClaim = block.timestamp >= lastDripTime[user] + cooldownTime;
        uint256 timeRemaining = 0;
        if (!canClaim) {
            timeRemaining = (lastDripTime[user] + cooldownTime) - block.timestamp;
        }

        return (
            totalReceived[user],
            lastDripTime[user],
            canClaim,
            timeRemaining
        );
    }

    // === Fonctions Admin ===

    /**
     * @dev Modifier le montant distribué
     */
    function setDripAmount(uint256 _dripAmount) external onlyOwner {
        require(_dripAmount > 0, "Amount must be positive");
        require(_dripAmount <= 1000 * 10**18, "Amount too high");

        uint256 oldAmount = dripAmount;
        dripAmount = _dripAmount;

        emit DripAmountUpdated(oldAmount, _dripAmount);
    }

    /**
     * @dev Modifier le cooldown
     */
    function setCooldownTime(uint256 _cooldownTime) external onlyOwner {
        require(_cooldownTime >= 1 hours, "Cooldown too short");
        require(_cooldownTime <= 7 days, "Cooldown too long");

        uint256 oldCooldown = cooldownTime;
        cooldownTime = _cooldownTime;

        emit CooldownUpdated(oldCooldown, _cooldownTime);
    }

    /**
     * @dev Modifier la limite quotidienne
     */
    function setMaxDailyDrips(uint256 _maxDailyDrips) external onlyOwner {
        require(_maxDailyDrips > 0, "Must allow at least 1 drip");
        maxDailyDrips = _maxDailyDrips;
    }

    /**
     * @dev Retirer des tokens du faucet (urgence)
     */
    function withdrawTokens(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        require(token.transfer(to, amount), "Transfer failed");
        emit TokensWithdrawn(to, amount);
    }

    /**
     * @dev Pause/unpause le faucet
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Permettre de recevoir des tokens pour financer le faucet
     * Note: Il faut d'abord approve() les tokens avant d'appeler cette fonction
     */
    function fund(uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit FaucetFunded(msg.sender, amount);
    }
}
