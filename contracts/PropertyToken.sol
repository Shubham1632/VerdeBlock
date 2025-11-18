// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IProperty {
    function isWhitelisted(address) external view returns (bool);
}

contract PropertyToken is ERC20, Ownable {
    address public propertyContract;

    constructor(address owner, uint256 initialSupply, string memory name, string memory symbol, address _propertyContract) ERC20(name, symbol) Ownable(owner) {
        _mint(owner, initialSupply);
        propertyContract = _propertyContract;
    }

    function isInvestorWhitelisted(address investor) public view returns (bool) {
        return IProperty(propertyContract).isWhitelisted(investor);
    }
}