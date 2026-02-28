const { ethers } = require("hardhat");

async function main() {
  const KeyStore = await ethers.getContractFactory("KeyManager");
  const keystore = await KeyStore.deploy();

  await keystore.deployed();
  console.log("Contract deployed to:", keystore.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

