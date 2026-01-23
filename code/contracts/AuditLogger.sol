// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./IAuditLogger.sol";

/**
 * @title AuditLogger
 * @dev Système d'audit centralisé pour tracer toutes les actions importantes
 * @notice Ce contrat enregistre un historique complet des événements du système
 */
contract AuditLogger is IAuditLogger, AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant LOGGER_ROLE = keccak256("LOGGER_ROLE");

    // Structure pour stocker les logs d'audit
    struct AuditLogEntry {
        AuditEventType eventType;
        address actor;
        address targetContract;
        uint256 timestamp;
        bytes data;
        bytes32 dataHash;
    }

    // Stockage des logs
    mapping(uint256 => AuditLogEntry) private logs;
    uint256 private logCounter;

    // Index pour recherche rapide
    mapping(address => uint256[]) private logsByActor;
    mapping(AuditEventType => uint256[]) private logsByType;
    mapping(address => uint256[]) private logsByContract;

    // Statistiques
    mapping(AuditEventType => uint256) public eventTypeCount;
    mapping(address => uint256) public actorActivityCount;

    // Événements supplémentaires
    event AuditSystemDeployed(address indexed deployer, uint256 timestamp);
    event AuditSystemPaused(address indexed by, uint256 timestamp);
    event AuditSystemUnpaused(address indexed by, uint256 timestamp);
    event LoggerAdded(address indexed logger, address indexed by);
    event LoggerRemoved(address indexed logger, address indexed by);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
        _grantRole(LOGGER_ROLE, msg.sender);

        emit AuditSystemDeployed(msg.sender, block.timestamp);
    }

    /**
     * @dev Enregistrer un événement d'audit
     * @param eventType Type d'événement
     * @param actor Adresse qui effectue l'action
     * @param targetContract Contrat ciblé par l'action
     * @param data Données associées à l'événement
     */
    function logEvent(
        AuditEventType eventType,
        address actor,
        address targetContract,
        bytes memory data
    ) external override onlyRole(LOGGER_ROLE) whenNotPaused nonReentrant {
        require(actor != address(0), "Invalid actor address");
        require(targetContract != address(0), "Invalid target contract");

        uint256 logId = logCounter++;
        bytes32 dataHash = keccak256(abi.encodePacked(
            logId,
            eventType,
            actor,
            targetContract,
            block.timestamp,
            data
        ));

        // Créer l'entrée de log
        logs[logId] = AuditLogEntry({
            eventType: eventType,
            actor: actor,
            targetContract: targetContract,
            timestamp: block.timestamp,
            data: data,
            dataHash: dataHash
        });

        // Indexer pour recherche rapide
        logsByActor[actor].push(logId);
        logsByType[eventType].push(logId);
        logsByContract[targetContract].push(logId);

        // Mettre à jour les statistiques
        eventTypeCount[eventType]++;
        actorActivityCount[actor]++;

        emit AuditLog(logId, eventType, actor, targetContract, block.timestamp, dataHash);
    }

    /**
     * @dev Obtenir le nombre total d'événements d'audit
     */
    function getLogCount() external view override returns (uint256) {
        return logCounter;
    }

    /**
     * @dev Obtenir les détails d'un événement d'audit
     */
    function getLog(uint256 logId) external view override returns (
        AuditEventType eventType,
        address actor,
        address targetContract,
        uint256 timestamp,
        bytes memory data
    ) {
        require(logId < logCounter, "Log ID does not exist");

        AuditLogEntry memory entry = logs[logId];
        return (
            entry.eventType,
            entry.actor,
            entry.targetContract,
            entry.timestamp,
            entry.data
        );
    }

    /**
     * @dev Obtenir les événements d'audit d'un acteur spécifique
     * @param actor Adresse de l'acteur
     * @param offset Décalage pour la pagination
     * @param limit Nombre maximum de résultats
     */
    function getLogsByActor(address actor, uint256 offset, uint256 limit)
        external view override returns (uint256[] memory)
    {
        require(actor != address(0), "Invalid actor address");

        uint256[] memory actorLogs = logsByActor[actor];
        return _paginateResults(actorLogs, offset, limit);
    }

    /**
     * @dev Obtenir les événements d'audit d'un type spécifique
     * @param eventType Type d'événement
     * @param offset Décalage pour la pagination
     * @param limit Nombre maximum de résultats
     */
    function getLogsByType(AuditEventType eventType, uint256 offset, uint256 limit)
        external view override returns (uint256[] memory)
    {
        uint256[] memory typeLogs = logsByType[eventType];
        return _paginateResults(typeLogs, offset, limit);
    }

    /**
     * @dev Obtenir les événements d'audit d'un contrat spécifique
     * @param targetContract Adresse du contrat
     * @param offset Décalage pour la pagination
     * @param limit Nombre maximum de résultats
     */
    function getLogsByContract(address targetContract, uint256 offset, uint256 limit)
        external view returns (uint256[] memory)
    {
        require(targetContract != address(0), "Invalid contract address");

        uint256[] memory contractLogs = logsByContract[targetContract];
        return _paginateResults(contractLogs, offset, limit);
    }

    /**
     * @dev Obtenir les logs dans une plage de temps
     * @param startTime Timestamp de début
     * @param endTime Timestamp de fin
     * @param offset Décalage pour la pagination
     * @param limit Nombre maximum de résultats
     */
    function getLogsByTimeRange(
        uint256 startTime,
        uint256 endTime,
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory) {
        require(startTime <= endTime, "Invalid time range");
        require(endTime <= block.timestamp, "End time cannot be in the future");

        // Collecter tous les logs dans la plage de temps
        uint256[] memory matchingLogs = new uint256[](logCounter);
        uint256 matchCount = 0;

        for (uint256 i = 0; i < logCounter; i++) {
            if (logs[i].timestamp >= startTime && logs[i].timestamp <= endTime) {
                matchingLogs[matchCount++] = i;
            }
        }

        // Créer un tableau de la taille exacte
        uint256[] memory result = new uint256[](matchCount);
        for (uint256 i = 0; i < matchCount; i++) {
            result[i] = matchingLogs[i];
        }

        return _paginateResults(result, offset, limit);
    }

    /**
     * @dev Vérifier l'intégrité d'un log
     * @param logId ID du log à vérifier
     */
    function verifyLogIntegrity(uint256 logId) external view returns (bool) {
        require(logId < logCounter, "Log ID does not exist");

        AuditLogEntry memory entry = logs[logId];
        bytes32 computedHash = keccak256(abi.encodePacked(
            logId,
            entry.eventType,
            entry.actor,
            entry.targetContract,
            entry.timestamp,
            entry.data
        ));

        return computedHash == entry.dataHash;
    }

    /**
     * @dev Obtenir des statistiques globales
     */
    function getGlobalStats() external view returns (
        uint256 totalLogs,
        uint256 uniqueActors,
        uint256 uniqueContracts,
        uint256 mintEvents,
        uint256 burnEvents,
        uint256 miningEvents
    ) {
        // Compter les acteurs uniques (approximation)
        uint256 actorCount = 0;
        // Note: Dans une implémentation réelle, vous voudriez suivre cela plus efficacement

        return (
            logCounter,
            actorCount,
            0, // Implémentation simplifiée
            eventTypeCount[AuditEventType.TOKEN_MINTED],
            eventTypeCount[AuditEventType.TOKEN_BURNED],
            eventTypeCount[AuditEventType.BLOCK_MINED]
        );
    }

    /**
     * @dev Obtenir les statistiques d'un acteur
     */
    function getActorStats(address actor) external view returns (
        uint256 totalActions,
        uint256 mintActions,
        uint256 burnActions,
        uint256 transferActions,
        uint256 lastActivityTime
    ) {
        require(actor != address(0), "Invalid actor address");

        uint256[] memory actorLogs = logsByActor[actor];
        uint256 mints = 0;
        uint256 burns = 0;
        uint256 transfers = 0;
        uint256 lastTime = 0;

        for (uint256 i = 0; i < actorLogs.length; i++) {
            AuditLogEntry memory entry = logs[actorLogs[i]];

            if (entry.eventType == AuditEventType.TOKEN_MINTED) mints++;
            else if (entry.eventType == AuditEventType.TOKEN_BURNED) burns++;
            else if (entry.eventType == AuditEventType.TOKEN_TRANSFERRED) transfers++;

            if (entry.timestamp > lastTime) lastTime = entry.timestamp;
        }

        return (
            actorActivityCount[actor],
            mints,
            burns,
            transfers,
            lastTime
        );
    }

    /**
     * @dev Fonction utilitaire pour paginer les résultats
     */
    function _paginateResults(
        uint256[] memory data,
        uint256 offset,
        uint256 limit
    ) private pure returns (uint256[] memory) {
        if (offset >= data.length) {
            return new uint256[](0);
        }

        uint256 end = offset + limit;
        if (end > data.length) {
            end = data.length;
        }

        uint256 resultLength = end - offset;
        uint256[] memory result = new uint256[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = data[offset + i];
        }

        return result;
    }

    // Fonctions d'administration

    /**
     * @dev Ajouter un nouveau logger autorisé
     */
    function addLogger(address logger) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(logger != address(0), "Invalid logger address");
        _grantRole(LOGGER_ROLE, logger);
        emit LoggerAdded(logger, msg.sender);
    }

    /**
     * @dev Retirer un logger autorisé
     */
    function removeLogger(address logger) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(logger != address(0), "Invalid logger address");
        _revokeRole(LOGGER_ROLE, logger);
        emit LoggerRemoved(logger, msg.sender);
    }

    /**
     * @dev Mettre en pause le système d'audit
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
        emit AuditSystemPaused(msg.sender, block.timestamp);
    }

    /**
     * @dev Reprendre le système d'audit
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
        emit AuditSystemUnpaused(msg.sender, block.timestamp);
    }

    /**
     * @dev Vérifier si une adresse peut logger
     */
    function canLog(address account) external view returns (bool) {
        return hasRole(LOGGER_ROLE, account);
    }

    /**
     * @dev Support des interfaces (AccessControl)
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
