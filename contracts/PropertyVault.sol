// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyVault is ERC4626, Ownable {
    address public propertyContract;
    uint256 public propertyId;

    constructor(
        ERC20 _underlying,
        string memory name,
        string memory symbol,
        address _propertyContract,
        uint256 _propertyId
    ) ERC4626(_underlying) ERC20(name, symbol) Ownable(msg.sender) {
        propertyContract = _propertyContract;
        propertyId = _propertyId;
    }

    // Override to add custom logic if needed, e.g., whitelist checks
    function deposit(uint256 assets, address receiver) public override returns (uint256) {
        // Add any custom logic here, like checking if receiver is whitelisted
        return super.deposit(assets, receiver);
    }

    function mint(uint256 shares, address receiver) public override returns (uint256) {
        // Add any custom logic here
        return super.mint(shares, receiver);
    }

    function withdraw(uint256 assets, address receiver, address owner) public override returns (uint256) {
        // Add any custom logic here
        return super.withdraw(assets, receiver, owner);
    }

    function redeem(uint256 shares, address receiver, address owner) public override returns (uint256) {
        // Add any custom logic here
        return super.redeem(shares, receiver, owner);
    }
}