// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Property.sol";

contract VerdeBlock is Ownable {
    Property[] public properties;

    event PropertyCreated(address indexed propertyAddress, uint256 indexed propertyId);

    constructor() Ownable(msg.sender) {}

    function createProperty(string memory _location, uint256 _price, string memory _description) external onlyOwner {
        Property newProperty = new Property();
        newProperty.addProperty(_location, _price, _description);
        properties.push(newProperty);
        emit PropertyCreated(address(newProperty), properties.length - 1);
    }

    function getProperties() external view returns (Property[] memory) {
        return properties;
    }

    function whitelistInvestor(uint256 propertyIndex, address investor) external onlyOwner {
        require(propertyIndex < properties.length, "Invalid property index");
        properties[propertyIndex].approveWhitelist(investor);
    }

    function getProperty(uint256 index) external view returns (Property) {
        require(index < properties.length, "Invalid property index");
        return properties[index];
    }
}