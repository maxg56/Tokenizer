// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MultiSigWallet
 * @dev Portefeuille multi-signatures pour la gestion sécurisée des actifs
 * Nécessite plusieurs confirmations avant d'exécuter une transaction
 */
contract MultiSigWallet is ReentrancyGuard {
    // Events
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    event RequirementChanged(uint256 required);

    // State
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public numConfirmationsRequired;

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
        uint256 submitTime;
    }

    // mapping from tx index => owner => bool
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    Transaction[] public transactions;

    // Modifiers
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }

    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactions.length, "Tx does not exist");
        _;
    }

    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "Tx already executed");
        _;
    }

    modifier notConfirmed(uint256 _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "Tx already confirmed");
        _;
    }

    /**
     * @dev Constructeur
     * @param _owners Liste des propriétaires initiaux
     * @param _numConfirmationsRequired Nombre de confirmations requises
     */
    constructor(address[] memory _owners, uint256 _numConfirmationsRequired) {
        require(_owners.length > 0, "Owners required");
        require(
            _numConfirmationsRequired > 0 &&
                _numConfirmationsRequired <= _owners.length,
            "Invalid number of required confirmations"
        );

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }

        numConfirmationsRequired = _numConfirmationsRequired;
    }

    /**
     * @dev Recevoir des ETH
     */
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    /**
     * @dev Soumettre une nouvelle transaction
     * @param _to Adresse de destination
     * @param _value Montant en wei
     * @param _data Données de la transaction (pour appeler des contrats)
     */
    function submitTransaction(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner returns (uint256) {
        uint256 txIndex = transactions.length;

        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0,
                submitTime: block.timestamp
            })
        );

        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);

        return txIndex;
    }

    /**
     * @dev Confirmer une transaction
     * @param _txIndex Index de la transaction
     */
    function confirmTransaction(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    /**
     * @dev Exécuter une transaction confirmée
     * @param _txIndex Index de la transaction
     */
    function executeTransaction(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        nonReentrant
    {
        Transaction storage transaction = transactions[_txIndex];

        require(
            transaction.numConfirmations >= numConfirmationsRequired,
            "Not enough confirmations"
        );

        transaction.executed = true;

        (bool success, ) = transaction.to.call{value: transaction.value}(
            transaction.data
        );
        require(success, "Tx failed");

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    /**
     * @dev Révoquer une confirmation
     * @param _txIndex Index de la transaction
     */
    function revokeConfirmation(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        require(isConfirmed[_txIndex][msg.sender], "Tx not confirmed");

        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    // === View Functions ===

    /**
     * @dev Obtenir la liste des propriétaires
     */
    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    /**
     * @dev Obtenir le nombre de transactions
     */
    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }

    /**
     * @dev Obtenir les détails d'une transaction
     */
    function getTransaction(uint256 _txIndex)
        public
        view
        returns (
            address to,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 numConfirmations,
            uint256 submitTime
        )
    {
        Transaction storage transaction = transactions[_txIndex];

        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations,
            transaction.submitTime
        );
    }

    /**
     * @dev Obtenir les transactions en attente
     */
    function getPendingTransactions() public view returns (uint256[] memory) {
        uint256 pendingCount = 0;

        // Compter les transactions en attente
        for (uint256 i = 0; i < transactions.length; i++) {
            if (!transactions[i].executed) {
                pendingCount++;
            }
        }

        // Créer le tableau des indices
        uint256[] memory pendingTxs = new uint256[](pendingCount);
        uint256 index = 0;

        for (uint256 i = 0; i < transactions.length; i++) {
            if (!transactions[i].executed) {
                pendingTxs[index] = i;
                index++;
            }
        }

        return pendingTxs;
    }

    /**
     * @dev Vérifier si une transaction peut être exécutée
     */
    function canExecute(uint256 _txIndex) public view returns (bool) {
        if (_txIndex >= transactions.length) return false;
        Transaction storage transaction = transactions[_txIndex];
        return !transaction.executed &&
               transaction.numConfirmations >= numConfirmationsRequired;
    }

    /**
     * @dev Obtenir les confirmations d'une transaction
     */
    function getConfirmations(uint256 _txIndex)
        public
        view
        returns (address[] memory)
    {
        uint256 count = 0;

        // Compter les confirmations
        for (uint256 i = 0; i < owners.length; i++) {
            if (isConfirmed[_txIndex][owners[i]]) {
                count++;
            }
        }

        // Créer le tableau
        address[] memory confirmations = new address[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < owners.length; i++) {
            if (isConfirmed[_txIndex][owners[i]]) {
                confirmations[index] = owners[i];
                index++;
            }
        }

        return confirmations;
    }

    // === Fonctions de gouvernance (nécessitent une transaction multisig) ===

    /**
     * @dev Ajouter un propriétaire (doit être appelé via executeTransaction)
     */
    function addOwner(address _owner) public {
        require(msg.sender == address(this), "Must be called via multisig");
        require(_owner != address(0), "Invalid owner");
        require(!isOwner[_owner], "Owner exists");

        isOwner[_owner] = true;
        owners.push(_owner);

        emit OwnerAdded(_owner);
    }

    /**
     * @dev Retirer un propriétaire (doit être appelé via executeTransaction)
     */
    function removeOwner(address _owner) public {
        require(msg.sender == address(this), "Must be called via multisig");
        require(isOwner[_owner], "Not owner");
        require(owners.length > numConfirmationsRequired, "Cannot remove: would break quorum");

        isOwner[_owner] = false;

        // Retirer de la liste
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == _owner) {
                owners[i] = owners[owners.length - 1];
                owners.pop();
                break;
            }
        }

        emit OwnerRemoved(_owner);
    }

    /**
     * @dev Changer le nombre de confirmations requises
     */
    function changeRequirement(uint256 _required) public {
        require(msg.sender == address(this), "Must be called via multisig");
        require(_required > 0 && _required <= owners.length, "Invalid requirement");

        numConfirmationsRequired = _required;

        emit RequirementChanged(_required);
    }
}
