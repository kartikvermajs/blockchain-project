const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with:", deployer.address);

  const KeyManager = await hre.ethers.getContractFactory("KeyManager");
  const keyManager = await KeyManager.deploy();
  await keyManager.deployed();

  console.log("KeyManager deployed to:", keyManager.address);

  const key = "myKey123";
  const keyHash = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes(key));

  // Create a key
  const tx1 = await keyManager.createKey(key);
  await tx1.wait();
  console.log("✅ Key created");

  // Activate the key
  const tx2 = await keyManager.activateKey(key);
  await tx2.wait();
  console.log("✅ Key activated");

  // Set expiry (e.g., 7 days from now)
  const expiry = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const tx3 = await keyManager.setExpiryDate(key, expiry);
  await tx3.wait();
  console.log("✅ Expiry set");

  // Fetch key info
  const keyInfo = await keyManager.getKeyInfo(key);
  console.log("🔎 Key Info:");
  console.log(`   Status:        ${keyInfo[0] === 0 ? "Inactive" : "Active"}`);
  console.log(`   Activated At:  ${new Date(keyInfo[1] * 1000).toISOString()}`);
  console.log(`   Expires At:    ${new Date(keyInfo[2] * 1000).toISOString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

