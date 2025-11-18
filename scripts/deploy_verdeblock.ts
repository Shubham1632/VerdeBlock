import { ethers } from "hardhat";

async function main() {
  // Deploy VerdeBlock contract
  const VerdeBlock = await ethers.getContractFactory("VerdeBlock");
  const verdeBlock = await VerdeBlock.deploy();

  await verdeBlock.deployed();

  console.log("VerdeBlock contract deployed to:", verdeBlock.address);

  // Optionally, create a sample property
  const tx = await verdeBlock.createProperty(
    "Sample Location",
    100000,
    "Sample Description"
  );
  await tx.wait();

  console.log("Sample property created");

  const properties = await verdeBlock.getProperties();
  console.log("Total properties:", properties.length);
  console.log("Property address:", properties[0]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
