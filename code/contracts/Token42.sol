// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MaxToken42 is ERC20 {
    constructor(uint256 initialSupply) ERC20("MaxToken42", "MTK42") {
        _mint(msg.sender, initialSupply);
    }
}
