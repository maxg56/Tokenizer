// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MaxToken42Mining.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol"; 

/**
 * @title MiningContract
 * @dev Contrat de minage amélioré avec mint direct des tokens
 */
contract MiningContract is Ownable, ReentrancyGuard, Pausable {
    MaxToken42Mining public immutable token;

    // Configuration du minage
    uint256 public baseReward = 100 * 10**18; // 100 MTK42 par défaut
    uint256 public difficulty = 1000; // Difficulté initiale
    uint256 public blockTime = 300; // 5 minutes en secondes
    uint256 public halvingInterval = 210000; // Réduction de récompense tous les 210k blocs

    // État du minage
    uint256 public currentBlock;
    uint256 public totalMined;
    uint256 public lastBlockTime;
    uint256 public lastDifficultyAdjustment;

    // Mapping des mineurs
    mapping(address => MinerData) public miners;
    mapping(uint256 => BlockData) public blocks;
    address[] public activeMinersList;

    struct MinerData {
        uint256 power; // Puissance de minage (1-100)
        uint256 totalMined; // Total miné par ce mineur
        uint256 blocksFound; // Nombre de blocs trouvés
        uint256 lastMiningTime; // Dernière activité
        uint256 joinedAt; // Date d'arrivée
        uint256 dailyBonusTime; // Dernier bonus quotidien
        bool isActive; // Statut actif
    }

    struct BlockData {
        address miner;
        uint256 timestamp;
        uint256 reward;
        uint256 difficulty;
        bytes32 hash;
    }

    // Événements
    event MiningStarted(address indexed miner, uint256 power);
    event MiningStopped(address indexed miner);
    event BlockMined(
        address indexed miner,
        uint256 indexed blockNumber,
        uint256 reward,
        uint256 difficulty,
        bytes32 hash
    );
    event DifficultyAdjusted(uint256 oldDifficulty, uint256 newDifficulty);
    event DailyBonusClaimed(address indexed miner, uint256 amount);
    event RewardHalved(uint256 newReward);

    constructor(address _token) Ownable(msg.sender) {
        token = MaxToken42Mining(_token);
        currentBlock = 1;
        lastBlockTime = block.timestamp;
        lastDifficultyAdjustment = block.timestamp;
    }

    /**
     * @dev Commencer le minage avec une puissance donnée
     */
    function startMining(uint256 power) external whenNotPaused {
        require(power >= 1 && power <= 100, "Invalid mining power");

        MinerData storage miner = miners[msg.sender];

        // Cooldown de 1 minute entre les changements
        require(
            block.timestamp >= miner.lastMiningTime + 60,
            "Mining cooldown active"
        );

        miner.power = power;
        miner.lastMiningTime = block.timestamp;

        // Initialiser nouveau mineur
        if (miner.joinedAt == 0) {
            miner.joinedAt = block.timestamp;
            miner.dailyBonusTime = block.timestamp;
            activeMinersList.push(msg.sender);
        }

        miner.isActive = true;

        emit MiningStarted(msg.sender, power);
    }

    /**
     * @dev Arrêter le minage
     */
    function stopMining() external {
        require(miners[msg.sender].isActive, "Not currently mining");

        miners[msg.sender].isActive = false;
        miners[msg.sender].power = 0;

        emit MiningStopped(msg.sender);
    }

    /**
     * @dev Miner un bloc avec proof-of-work
     */
    function mineBlock(uint256 nonce) external whenNotPaused nonReentrant {
        MinerData storage miner = miners[msg.sender];
        require(miner.isActive && miner.power > 0, "Must start mining first");

        // Vérifier le proof-of-work
        bytes32 hash = keccak256(abi.encodePacked(
            currentBlock,
            msg.sender,
            nonce,
            block.timestamp,
            blockhash(block.number - 1)
        ));

        require(isValidProofOfWork(hash), "Invalid proof-of-work");

        // Calculer la récompense
        uint256 reward = calculateReward(msg.sender);

        // Vérifier la supply restante
        require(token.remainingSupply() >= reward, "Insufficient token supply");

        // Minter les tokens directement
        token.mint(msg.sender, reward);

        // Mettre à jour les statistiques
        miner.totalMined += reward;
        miner.blocksFound++;
        totalMined += reward;

        // Enregistrer le bloc
        blocks[currentBlock] = BlockData({
            miner: msg.sender,
            timestamp: block.timestamp,
            reward: reward,
            difficulty: difficulty,
            hash: hash
        });

        emit BlockMined(msg.sender, currentBlock, reward, difficulty, hash);

        // Avancer au bloc suivant
        currentBlock++;
        lastBlockTime = block.timestamp;

        // Ajuster la difficulté
        adjustDifficulty();

        // Vérifier si halving nécessaire
        checkHalving();
    }

    /**
     * @dev Vérifier si le proof-of-work est valide
     */
    function isValidProofOfWork(bytes32 hash) public view returns (bool) {
        uint256 hashValue = uint256(hash);
        uint256 target = type(uint256).max / difficulty;
        return hashValue < target;
    }

    /**
     * @dev Calculer la récompense pour un mineur
     */
    function calculateReward(address minerAddr) public view returns (uint256) {
        MinerData memory miner = miners[minerAddr];
        uint256 currentReward = getCurrentBlockReward();

        // Bonus de puissance (50% à 150% de la récompense de base)
        uint256 powerMultiplier = 50 + miner.power;
        uint256 powerAdjustedReward = (currentReward * powerMultiplier) / 100;

        // Bonus de fidélité (jusqu'à 25% après 30 jours)
        uint256 loyaltyBonus = 0;
        if (miner.joinedAt > 0) {
            uint256 daysActive = (block.timestamp - miner.joinedAt) / 86400;
            loyaltyBonus = (powerAdjustedReward * min(daysActive, 30)) / 120; // Max 25%
        }

        // Bonus de performance (basé sur les blocs trouvés)
        uint256 performanceBonus = 0;
        if (miner.blocksFound > 10) {
            performanceBonus = (powerAdjustedReward * min(miner.blocksFound, 100)) / 1000; // Max 10%
        }

        uint256 totalReward = powerAdjustedReward + loyaltyBonus + performanceBonus;

        // Récompense minimum (10% de la récompense de base)
        return max(totalReward, currentReward / 10);
    }

    /**
     * @dev Obtenir la récompense de bloc actuelle (avec halving)
     */
    function getCurrentBlockReward() public view returns (uint256) {
        uint256 halvings = currentBlock / halvingInterval;
        if (halvings >= 10) return 0; // Arrêt après 10 halvings

        return baseReward >> halvings; // Division par 2^halvings
    }

    /**
     * @dev Ajuster la difficulté automatiquement
     */
    function adjustDifficulty() internal {
        if (currentBlock % 144 == 0 && currentBlock > 144) { // Ajuster tous les 144 blocs (~12h)
            uint256 actualTime = block.timestamp - lastDifficultyAdjustment;
            uint256 expectedTime = 144 * blockTime;

            uint256 oldDifficulty = difficulty;

            if (actualTime < expectedTime / 2) {
                // Blocs trop rapides, augmenter difficulté de 50%
                difficulty = (difficulty * 3) / 2;
            } else if (actualTime < expectedTime * 4 / 5) {
                // Blocs un peu rapides, augmenter difficulté de 20%
                difficulty = (difficulty * 6) / 5;
            } else if (actualTime > expectedTime * 2) {
                // Blocs trop lents, diminuer difficulté de 50%
                difficulty = difficulty / 2;
            } else if (actualTime > expectedTime * 5 / 4) {
                // Blocs un peu lents, diminuer difficulté de 20%
                difficulty = (difficulty * 4) / 5;
            }

            // Limites de difficulté
            difficulty = max(difficulty, 100);
            difficulty = min(difficulty, 1000000);

            if (difficulty != oldDifficulty) {
                emit DifficultyAdjusted(oldDifficulty, difficulty);
                lastDifficultyAdjustment = block.timestamp;
            }
        }
    }

    /**
     * @dev Vérifier et effectuer le halving si nécessaire
     */
    function checkHalving() internal {
        if (currentBlock % halvingInterval == 0 && currentBlock > 0) {
            uint256 newReward = getCurrentBlockReward();
            emit RewardHalved(newReward);
        }
    }

    /**
     * @dev Réclamer le bonus quotidien
     */
    function claimDailyBonus() external whenNotPaused {
        MinerData storage miner = miners[msg.sender];
        require(miner.isActive, "Must be an active miner");
        require(
            block.timestamp >= miner.dailyBonusTime + 86400,
            "Daily bonus not ready"
        );

        uint256 bonus = baseReward / 2; // 50 MTK42
        require(token.remainingSupply() >= bonus, "Insufficient token supply");

        token.mint(msg.sender, bonus);
        miner.dailyBonusTime = block.timestamp;
        miner.totalMined += bonus;

        emit DailyBonusClaimed(msg.sender, bonus);
    }

    /**
     * @dev Obtenir les statistiques d'un mineur
     */
    function getMinerStats(address minerAddr) external view returns (
        uint256 power,
        uint256 totalMinedAmount,
        uint256 blocksFound,
        uint256 joinedAt,
        uint256 estimatedReward,
        bool isActive,
        bool canClaimDaily
    ) {
        MinerData memory miner = miners[minerAddr];
        return (
            miner.power,
            miner.totalMined,
            miner.blocksFound,
            miner.joinedAt,
            miner.isActive ? calculateReward(minerAddr) : 0,
            miner.isActive,
            block.timestamp >= miner.dailyBonusTime + 86400
        );
    }

    /**
     * @dev Obtenir les statistiques globales
     */
    function getGlobalStats() external view returns (
        uint256 _currentBlock,
        uint256 _totalMined,
        uint256 _difficulty,
        uint256 _activeMiners,
        uint256 _currentReward,
        uint256 _nextDifficultyAdjustment
    ) {
        uint256 activeCount = 0;
        for (uint i = 0; i < activeMinersList.length; i++) {
            if (miners[activeMinersList[i]].isActive) {
                activeCount++;
            }
        }

        uint256 blocksUntilAdjustment = 144 - (currentBlock % 144);

        return (
            currentBlock,
            totalMined,
            difficulty,
            activeCount,
            getCurrentBlockReward(),
            blocksUntilAdjustment
        );
    }

    /**
     * @dev Obtenir les détails d'un bloc
     */
    function getBlockDetails(uint256 blockNumber) external view returns (
        address miner,
        uint256 timestamp,
        uint256 reward,
        uint256 blockDifficulty,
        bytes32 hash
    ) {
        BlockData memory blockData = blocks[blockNumber];
        return (
            blockData.miner,
            blockData.timestamp,
            blockData.reward,
            blockData.difficulty,
            blockData.hash
        );
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
        require(_blockTime >= 60 && _blockTime <= 3600, "Invalid block time");
        blockTime = _blockTime;
    }

    function setDifficulty(uint256 _difficulty) external onlyOwner {
        require(_difficulty >= 100 && _difficulty <= 1000000, "Invalid difficulty");
        uint256 oldDifficulty = difficulty;
        difficulty = _difficulty;
        emit DifficultyAdjusted(oldDifficulty, _difficulty);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}