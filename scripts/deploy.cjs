const hre = require("hardhat");

async function main() {
  console.log("HRE Keys:", Object.keys(hre));
  if (!hre.ethers) {
    throw new Error("hre.ethers is undefined!");
  }
  console.log("Deploying MessageBoard...");

  const MessageBoard = await hre.ethers.getContractFactory("MessageBoard");
  const messageBoard = await MessageBoard.deploy();

  await messageBoard.waitForDeployment();

  const address = await messageBoard.getAddress();
  console.log(`MessageBoard deployed to: ${address}`);
}

main().catch((error) => {
  console.error("DEPLOYMENT ERROR:", error);
  process.exit(1);
});
