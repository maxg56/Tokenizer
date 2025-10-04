// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MaxToken42Mining
 * @dev Version améliorée du token MaxToken42 avec support du minage et burn optionnel
 */
contract MaxToken42Mining is ERC20, Ownable, AccessControl {
    bytes32 public constant MINER_ROLE = keccak256("MINER_ROLE");

    uint256 public constant MAX_SUPPLY = 10_000_000 * 10**18; // 10M MTK42 max
    uint256 public immutable initialSupply;

    // Événements
    event MinerAdded(address indexed miner);
    event MinerRemoved(address indexed miner);
    event TokensMinted(address indexed to, uint256 amount);
    event TokenDeployed(address indexed owner, uint256 initialSupply, uint256 maxSupply);
    event TokensBurned(address indexed from, uint256 amount);

    constructor(uint256 _initialSupply)
        ERC20("MaxToken42", "MTK42")
        Ownable(msg.sender)
    {
        require(_initialSupply <= MAX_SUPPLY, "Initial supply exceeds max supply");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINER_ROLE, msg.sender);

        initialSupply = _initialSupply;
        _mint(msg.sender, _initialSupply);

        emit TokenDeployed(msg.sender, _initialSupply, MAX_SUPPLY);
    }

    /**
     * @dev Mint des tokens (réservé aux mineurs autorisés)
     * @param to Adresse de destination
     * @param amount Montant à minter
     */
    function mint(address to, uint256 amount) external onlyRole(MINER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Ajouter un mineur autorisé
     * @param miner Adresse du contrat de minage
     */
    function addMiner(address miner) external onlyOwner {
        _grantRole(MINER_ROLE, miner);
        emit MinerAdded(miner);
    }

    /**
     * @dev Retirer un mineur autorisé
     * @param miner Adresse du contrat de minage
     */
    function removeMiner(address miner) external onlyOwner {
        _revokeRole(MINER_ROLE, miner);
        emit MinerRemoved(miner);
    }

    /**
     * @dev Brûler ses propres tokens
     * @param amount Montant à brûler
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Vérifier si une adresse peut minter
     */
    function canMint(address account) external view returns (bool) {
        return hasRole(MINER_ROLE, account);
    }

    /**
     * @dev Obtenir l’approvisionnement restant possible
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
