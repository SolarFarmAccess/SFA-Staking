// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();
  
  const SFA = await ethers.getContractFactory("SFAToken");
  const sfa = await upgrades.deployProxy(SFA, ["0x3607714c059a49B23695a784D7e6AC86fC0DC355"]);

  await sfa.deployed();
  console.log("SFA Token deployed to:", sfa.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
