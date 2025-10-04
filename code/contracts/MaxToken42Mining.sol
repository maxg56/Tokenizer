// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MaxToken42Mining
 * @dev Version améliorée du token MaxToken42 avec support du minage
 */
contract MaxToken42Mining is ERC20, Ownable, AccessControl {
    bytes32 public constant MINER_ROLE = keccak256("MINER_ROLE");

    uint256 public constant MAX_SUPPLY = 10000000 * 10**18; // 10M MTK42 max
    uint256 public initialSupply;

    // Événements
    event MinerAdded(address indexed miner);
    event MinerRemoved(address indexed miner);
    event TokensMinted(address indexed to, uint256 amount);

    constructor(uint256 _initialSupply) ERC20("MaxToken42", "MTK42") Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINER_ROLE, msg.sender);

        initialSupply = _initialSupply;
        _mint(msg.sender, _initialSupply);
    }

    /**
     * @dev Mint des tokens pour le minage (seulement les contrats autorisés)
     * @param to Adresse de destination
     * @param amount Montant à minter
     */
    function mint(address to, uint256 amount) external onlyRole(MINER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Ajouter un contrat de minage autorisé
     * @param miner Adresse du contrat de minage
     */
    function addMiner(address miner) external onlyOwner {
        _grantRole(MINER_ROLE, miner);
        emit MinerAdded(miner);
    }

    /**
     * @dev Retirer l'autorisation de minage
     * @param miner Adresse du contrat de minage
     */
    function removeMiner(address miner) external onlyOwner {
        _revokeRole(MINER_ROLE, miner);
        emit MinerRemoved(miner);
    }

    /**
     * @dev Vérifier si une adresse peut minter
     */
    function canMint(address account) external view returns (bool) {
        return hasRole(MINER_ROLE, account);
    }

    /**
     * @dev Obtenir l'approvisionnement restant
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    /**
     * @dev Support des interfaces (AccessControl + ERC20)
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