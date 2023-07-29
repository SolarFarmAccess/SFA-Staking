// const {
//   time,
//   loadFixture,
// } = require("@nomicfoundation/hardhat-network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
// const { expect } = require("chai");
// const { ethers, upgrades } = require("hardhat");

// describe("SFA Token", function () {
//   async function deployInitialContract() {
    
//     // Contracts are deployed using the first signer/account by default
//     const [owner, addy1, addy2] = await ethers.getSigners();


//     const SFA = await ethers.getContractFactory("SFAToken");
//     const sfa = await upgrades.deployProxy(SFA, [owner.address]);

//     await sfa.deployed();
//     console.log("SFA Token deployed to:", sfa.address);

//     return { sfa, owner, addy1, addy2 };
//   }

//   describe("Deployment", function () {
//     it("Should deploy and mint", async function () {
//       const { sfa, owner } = await loadFixture(deployInitialContract);
//       const mintTotal = ethers.BigNumber.from("150000000").mul("1000000000000000000");
//       expect(await sfa.balanceOf(owner.address)).to.equal(mintTotal);
//     });

//     it("Should not initialize after deployment", async function () {
//       const { sfa, owner } = await loadFixture(deployInitialContract);
//       await expect(sfa.initialize(owner.address)).to.be.revertedWith("Initializable: contract is already initialized");
//     });

//     it("Should be upgradable", async function () {
//       const { sfa } = await loadFixture(deployInitialContract);
//       const SFAV2 = await ethers.getContractFactory("SFATokenV2");
//       const sfav2 = await upgrades.upgradeProxy(sfa.address, SFAV2);
//       const resp = await sfav2.a();
//       expect(resp).to.be.equal(1);
//     });


//     it("Tokens are transferable", async function () {
//       const { sfa, owner, addy1 } = await loadFixture(deployInitialContract);
//       await sfa.transfer(addy1.address, 100);
//       const bal = await sfa.balanceOf(addy1.address);
//       expect(bal).to.equal(100);
//     });
    
//   });
// });
