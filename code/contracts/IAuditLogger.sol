// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IAuditLogger
 * @dev Interface pour le système d'audit centralisé
 */
interface IAuditLogger {
    // Types d'événements d'audit
    enum AuditEventType {
        TOKEN_MINTED,
        TOKEN_BURNED,
        TOKEN_TRANSFERRED,
        MINING_STARTED,
        MINING_STOPPED,
        BLOCK_MINED,
        DAILY_BONUS_CLAIMED,
        FAUCET_DRIP,
        MULTISIG_TRANSACTION_SUBMITTED,
        MULTISIG_TRANSACTION_CONFIRMED,
        MULTISIG_TRANSACTION_EXECUTED,
        MULTISIG_TRANSACTION_REVOKED,
        ROLE_GRANTED,
        ROLE_REVOKED,
        OWNERSHIP_TRANSFERRED,
        CONTRACT_PAUSED,
        CONTRACT_UNPAUSED,
        CONFIGURATION_CHANGED
    }

    // Événement principal d'audit
    event AuditLog(
        uint256 indexed logId,
        AuditEventType indexed eventType,
        address indexed actor,
        address targetContract,
        uint256 timestamp,
        bytes32 dataHash
    );

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
    ) external;

    /**
     * @dev Obtenir le nombre total d'événements d'audit
     */
    function getLogCount() external view returns (uint256);

    /**
     * @dev Obtenir les détails d'un événement d'audit
     */
    function getLog(uint256 logId) external view returns (
        AuditEventType eventType,
        address actor,
        address targetContract,
        uint256 timestamp,
        bytes memory data
    );

    /**
     * @dev Obtenir les événements d'audit d'un acteur spécifique
     */
    function getLogsByActor(address actor, uint256 offset, uint256 limit)
        external view returns (uint256[] memory);

    /**
     * @dev Obtenir les événements d'audit d'un type spécifique
     */
    function getLogsByType(AuditEventType eventType, uint256 offset, uint256 limit)
        external view returns (uint256[] memory);
}
