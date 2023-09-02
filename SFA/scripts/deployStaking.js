// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const sp = "0x24853F71e1d2176f97953658B41348435f0C06E3"
  const sh = "0xfeaedcdF79302ac1a4d857cF2DaE68Bb18DCECF3"
  const sfa = "0xBa843708b372F8fAD20Cc45b82abF87F2B1A679A"

  const staking = await hre.ethers.deployContract("SFAStaking", [5, 25, sp, 10, sh, 1, sfa, 604800]);

  await staking.deployed();
  console.log("SFA Token deployed to:", staking.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});