// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MiningContract
 * @dev Contrat de minage pour MaxToken42 avec système de proof-of-work simplifié
 */
contract MiningContract is Ownable, ReentrancyGuard, Pausable {
    IERC20 public immutable token;

    // Configuration du minage
    uint256 public baseReward = 100 * 10**18; // 100 MTK42 par défaut
    uint256 public difficulty = 1000; // Difficulté initiale
    uint256 public blockTime = 300; // 5 minutes en secondes
    uint256 public maxSupply = 1000000 * 10**18; // 1M MTK42 max

    // État du minage
    uint256 public currentBlock;
    uint256 public totalMined;
    uint256 public lastBlockTime;
    mapping(address => uint256) public minerRewards;
    mapping(address => uint256) public lastMiningTime;
    mapping(address => uint256) public minerPower;

    // Statistiques
    mapping(address => MinerStats) public miners;
    address[] public activeMinersList;

    struct MinerStats {
        uint256 totalMined;
        uint256 blocksFound;
        uint256 joinedAt;
        bool isActive;
    }

    // Events
    event BlockMined(address indexed miner, uint256 blockNumber, uint256 reward, uint256 difficulty);
    event MiningStarted(address indexed miner, uint256 power);
    event MiningStopped(address indexed miner);
    event RewardClaimed(address indexed miner, uint256 amount);
    event DifficultyAdjusted(uint256 oldDifficulty, uint256 newDifficulty);

    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
        currentBlock = 1;
        lastBlockTime = block.timestamp;
    }

    /**
     * @dev Commencer le minage avec une puissance donnée
     * @param power Puissance de minage (1-100)
     */
    function startMining(uint256 power) external whenNotPaused {
        require(power >= 1 && power <= 100, "Invalid mining power");
        require(block.timestamp >= lastMiningTime[msg.sender] + 60, "Mining cooldown active");

        minerPower[msg.sender] = power;
        lastMiningTime[msg.sender] = block.timestamp;

        // Ajouter à la liste des mineurs actifs si nouveau
        if (!miners[msg.sender].isActive) {
            miners[msg.sender] = MinerStats({
                totalMined: miners[msg.sender].totalMined,
                blocksFound: miners[msg.sender].blocksFound,
                joinedAt: block.timestamp,
                isActive: true
            });
            activeMinersList.push(msg.sender);
        }

        emit MiningStarted(msg.sender, power);
    }

    /**
     * @dev Arrêter le minage
     */
    function stopMining() external {
        require(minerPower[msg.sender] > 0, "Not currently mining");

        minerPower[msg.sender] = 0;
        miners[msg.sender].isActive = false;

        emit MiningStopped(msg.sender);
    }

    /**
     * @dev Tenter de miner un bloc avec un nonce
     * @param nonce Valeur nonce pour le proof-of-work
     */
    function mineBlock(uint256 nonce) external whenNotPaused nonReentrant {
        require(minerPower[msg.sender] > 0, "Must start mining first");
        require(totalMined < maxSupply, "Max supply reached");

        // Vérifier le proof-of-work simplifié
        bytes32 hash = keccak256(abi.encodePacked(
            currentBlock,
            msg.sender,
            nonce,
            block.timestamp
        ));

        uint256 hashValue = uint256(hash);
        uint256 target = type(uint256).max / difficulty;

        require(hashValue < target, "Invalid proof-of-work");

        // Calculer la récompense basée sur la puissance et la difficulté
        uint256 reward = calculateReward(msg.sender);

        // Vérifier qu'on ne dépasse pas la max supply
        if (totalMined + reward > maxSupply) {
            reward = maxSupply - totalMined;
        }

        // Mettre à jour les statistiques
        minerRewards[msg.sender] += reward;
        totalMined += reward;
        miners[msg.sender].totalMined += reward;
        miners[msg.sender].blocksFound++;

        // Avancer au bloc suivant
        currentBlock++;
        lastBlockTime = block.timestamp;

        // Ajuster la difficulté si nécessaire
        adjustDifficulty();

        emit BlockMined(msg.sender, currentBlock - 1, reward, difficulty);
    }

    /**
     * @dev Calculer la récompense pour un mineur
     */
    function calculateReward(address miner) public view returns (uint256) {
        uint256 power = minerPower[miner];
        uint256 baseAmount = baseReward;

        // Bonus basé sur la puissance (1-100%)
        uint256 powerBonus = (baseAmount * power) / 100;

        // Bonus de fidélité (jusqu'à 20% après 30 jours)
        uint256 loyaltyBonus = 0;
        if (miners[miner].joinedAt > 0) {
            uint256 daysActive = (block.timestamp - miners[miner].joinedAt) / 86400;
            loyaltyBonus = (baseAmount * min(daysActive * 2, 20)) / 100;
        }

        // Réduction selon la difficulté (plus c'est difficile, plus la récompense diminue)
        uint256 difficultyFactor = 1000;
        uint256 adjustedReward = (powerBonus + loyaltyBonus) * difficultyFactor / difficulty;

        return max(adjustedReward, baseAmount / 10); // Min 10% de la récompense de base
    }

    /**
     * @dev Ajuster la difficulté selon le temps de bloc
     */
    function adjustDifficulty() internal {
        if (currentBlock % 10 == 0 && currentBlock > 10) { // Ajuster tous les 10 blocs
            uint256 actualTime = block.timestamp - (lastBlockTime - (9 * blockTime));
            uint256 expectedTime = 10 * blockTime;

            uint256 oldDifficulty = difficulty;

            if (actualTime < expectedTime) {
                // Blocs trop rapides, augmenter la difficulté
                difficulty = (difficulty * 11) / 10; // +10%
            } else if (actualTime > expectedTime * 2) {
                // Blocs trop lents, diminuer la difficulté
                difficulty = (difficulty * 9) / 10; // -10%
            }

            // Limites de difficulté
            if (difficulty < 100) difficulty = 100;
            if (difficulty > 100000) difficulty = 100000;

            if (difficulty != oldDifficulty) {
                emit DifficultyAdjusted(oldDifficulty, difficulty);
            }
        }
    }

    /**
     * @dev Réclamer les récompenses accumulées
     */
    function claimRewards() external nonReentrant {
        uint256 reward = minerRewards[msg.sender];
        require(reward > 0, "No rewards to claim");

        minerRewards[msg.sender] = 0;
        require(token.transfer(msg.sender, reward), "Transfer failed");

        emit RewardClaimed(msg.sender, reward);
    }

    /**
     * @dev Obtenir le bonus quotidien (une fois par 24h)
     */
    function claimDailyBonus() external whenNotPaused {
        require(miners[msg.sender].isActive, "Must be an active miner");
        require(
            block.timestamp >= lastMiningTime[msg.sender] + 86400,
            "Daily bonus not ready"
        );

        uint256 bonus = baseReward / 2; // 50 MTK42

        if (totalMined + bonus <= maxSupply) {
            minerRewards[msg.sender] += bonus;
            totalMined += bonus;
            lastMiningTime[msg.sender] = block.timestamp;

            emit RewardClaimed(msg.sender, bonus);
        }
    }

    /**
     * @dev Obtenir les statistiques d'un mineur
     */
    function getMinerStats(address miner) external view returns (
        uint256 totalMinedAmount,
        uint256 blocksFound,
        uint256 joinedAt,
        uint256 currentPower,
        uint256 pendingRewards,
        bool isActive
    ) {
        MinerStats memory stats = miners[miner];
        return (
            stats.totalMined,
            stats.blocksFound,
            stats.joinedAt,
            minerPower[miner],
            minerRewards[miner],
            stats.isActive
        );
    }

    /**
     * @dev Obtenir les statistiques globales du minage
     */
    function getGlobalStats() external view returns (
        uint256 _currentBlock,
        uint256 _totalMined,
        uint256 _difficulty,
        uint256 _activeMiners,
        uint256 _lastBlockTime
    ) {
        uint256 activeCount = 0;
        for (uint i = 0; i < activeMinersList.length; i++) {
            if (miners[activeMinersList[i]].isActive) {
                activeCount++;
            }
        }

        return (
            currentBlock,
            totalMined,
            difficulty,
            activeCount,
            lastBlockTime
        );
    }

    /**
     * @dev Vérifier si un hash est valide pour la difficulté actuelle
     */
    function isValidHash(uint256 blockNum, address miner, uint256 nonce) external view returns (bool) {
        bytes32 hash = keccak256(abi.encodePacked(blockNum, miner, nonce, block.timestamp));
        uint256 hashValue = uint256(hash);
        uint256 target = type(uint256).max / difficulty;
        return hashValue < target;
    }

    // Fonctions utilitaires
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    // Fonctions d'administration
    function setBaseReward(uint256 _baseReward) external onlyOwner {
        baseReward = _baseReward;
    }

    function setBlockTime(uint256 _blockTime) external onlyOwner {
        blockTime = _blockTime;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Fonction d'urgence pour retirer les tokens (owner seulement)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(token.transfer(owner(), amount), "Transfer failed");
    }
}