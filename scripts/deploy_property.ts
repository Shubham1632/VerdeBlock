import { ethers } from "hardhat";

async function main() {
  const Property = await ethers.getContractFactory("Property");
  const property = await Property.deploy();

  await property.deployed();

  console.log("Property contract deployed to:", property.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
