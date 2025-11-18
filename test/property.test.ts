import { expect } from "chai";
import { ethers } from "hardhat";
import { Property, PropertyToken } from "../typechain-types";

describe("Property", function () {
  let property: Property;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    const PropertyFactory = await ethers.getContractFactory("Property");
    property = await PropertyFactory.deploy();
    await property.deployed();

    [owner, addr1, addr2] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await property.owner()).to.equal(owner.address);
      expect(await property.propertyCount()).to.equal(0);
    });
  });

  describe("Adding Property", function () {
    it("Should add a property and mint tokens", async function () {
      await property.addProperty("New York", 1000000, "A nice house");
      expect(await property.propertyCount()).to.equal(1);

      const prop = await property.getProperty(1);
      expect(prop.owner).to.equal(owner.address);
      expect(prop.location).to.equal("New York");
      expect(prop.price).to.equal(1000000);
      expect(prop.description).to.equal("A nice house");
      expect(prop.isActive).to.equal(true);
      expect(prop.tokenAddress).to.not.equal(ethers.constants.AddressZero);

      // Check token
      const token = (await ethers.getContractAt(
        "PropertyToken",
        prop.tokenAddress
      )) as PropertyToken;
      expect(await token.name()).to.equal("Property 1");
      expect(await token.symbol()).to.equal("PROP1");
      expect(await token.totalSupply()).to.equal(200); // 1000000 / 5000
      expect(await token.balanceOf(owner.address)).to.equal(200);
    });

    it("Should emit PropertyAdded event", async function () {
      const tx = await property.addProperty(
        "Los Angeles",
        2000000,
        "Another house"
      );
      const receipt = await tx.wait();
      const event = receipt.events?.find((e) => e.event === "PropertyAdded");
      expect(event).to.not.be.undefined;
      expect(event?.args?.id).to.equal(1);
      expect(event?.args?.owner).to.equal(owner.address);
      expect(event?.args?.location).to.equal("Los Angeles");
      expect(event?.args?.price).to.equal(2000000);
      expect(event?.args?.tokenAddress).to.not.equal(
        ethers.constants.AddressZero
      );
    });

    it("Should revert if price not multiple of 5000", async function () {
      await expect(
        property.addProperty("Paris", 1000001, "Invalid price")
      ).to.be.revertedWith("Price must be a multiple of 5000");
    });
  });

  describe("Whitelisting", function () {
    it("Should allow investor to request whitelist", async function () {
      await property.connect(addr1).requestWhitelist();
      expect(await property.hasRequested(addr1.address)).to.equal(true);
      const requests = await property.getWhitelistRequests();
      expect(requests).to.include(addr1.address);
    });

    it("Should emit WhitelistRequested event", async function () {
      const tx = await property.connect(addr1).requestWhitelist();
      const receipt = await tx.wait();
      const event = receipt.events?.find(
        (e) => e.event === "WhitelistRequested"
      );
      expect(event).to.not.be.undefined;
      expect(event?.args?.investor).to.equal(addr1.address);
    });

    it("Should not allow duplicate requests", async function () {
      await property.connect(addr1).requestWhitelist();
      await expect(
        property.connect(addr1).requestWhitelist()
      ).to.be.revertedWith("Already requested");
    });

    it("Should allow owner to approve whitelist", async function () {
      await property.connect(addr1).requestWhitelist();
      await property.approveWhitelist(addr1.address);
      expect(await property.isWhitelisted(addr1.address)).to.equal(true);
    });

    it("Should emit Whitelisted event", async function () {
      await property.connect(addr1).requestWhitelist();
      const tx = await property.approveWhitelist(addr1.address);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e) => e.event === "Whitelisted");
      expect(event).to.not.be.undefined;
      expect(event?.args?.investor).to.equal(addr1.address);
    });

    it("Should not allow approve without request", async function () {
      await expect(property.approveWhitelist(addr1.address)).to.be.revertedWith(
        "No request from this address"
      );
    });

    it("Should not allow non-owner to approve", async function () {
      await property.connect(addr1).requestWhitelist();
      await expect(property.connect(addr1).approveWhitelist(addr1.address))
        .to.be.revertedWithCustomError(property, "OwnableUnauthorizedAccount")
        .withArgs(addr1.address);
    });
  });
});
