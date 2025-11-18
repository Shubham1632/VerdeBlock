// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PropertyToken.sol";
import "./PropertyVault.sol";

contract Property is Ownable {
    struct PropertyDetails {
        uint256 id;
        address owner;
        string location;
        uint256 price;
        string description;
        bool isActive;
        address tokenAddress;
        address vaultAddress;
    }

    mapping(uint256 => PropertyDetails) public properties;
    uint256 public propertyCount;

    address[] public whitelistRequests;
    mapping(address => bool) public hasRequested;
    mapping(address => bool) public isWhitelisted;

    event PropertyAdded(uint256 indexed id, address indexed owner, string location, uint256 price, address tokenAddress, address vaultAddress);
    event WhitelistRequested(address indexed investor);
    event Whitelisted(address indexed investor);

    constructor() Ownable(msg.sender) {}

    function addProperty(string memory _location, uint256 _price, string memory _description) public {
        require(_price % 5000 == 0, "Price must be a multiple of 5000");
        uint256 tokenAmount = _price / 5000;
        propertyCount++;
        string memory name = string(abi.encodePacked("Property ", Strings.toString(propertyCount)));
        string memory symbol = string(abi.encodePacked("PROP", Strings.toString(propertyCount)));
        PropertyToken token = new PropertyToken(msg.sender, tokenAmount, name, symbol, address(this));
        string memory vaultName = string(abi.encodePacked("Property Vault ", Strings.toString(propertyCount)));
        string memory vaultSymbol = string(abi.encodePacked("vPROP", Strings.toString(propertyCount)));
        PropertyVault vault = new PropertyVault(token, vaultName, vaultSymbol, address(this), propertyCount);
        properties[propertyCount] = PropertyDetails({
            id: propertyCount,
            owner: msg.sender,
            location: _location,
            price: _price,
            description: _description,
            isActive: true,
            tokenAddress: address(token),
            vaultAddress: address(vault)
        });
        emit PropertyAdded(propertyCount, msg.sender, _location, _price, address(token), address(vault));
    }

    function getProperty(uint256 _id) public view returns (PropertyDetails memory) {
        return properties[_id];
    }

    function requestWhitelist() external {
        require(!hasRequested[msg.sender], "Already requested");
        hasRequested[msg.sender] = true;
        whitelistRequests.push(msg.sender);
        emit WhitelistRequested(msg.sender);
    }

    function approveWhitelist(address investor) external onlyOwner {
        require(hasRequested[investor], "No request from this address");
        isWhitelisted[investor] = true;
        emit Whitelisted(investor);
    }

    function getWhitelistRequests() external view returns (address[] memory) {
        return whitelistRequests;
    }
}