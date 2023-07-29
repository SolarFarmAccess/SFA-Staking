const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
  
describe("SFA Token", function () {
  async function setUp() {
    
    // Contracts are deployed using the first signer/account by default
    const [owner, addy1, addy2] = await ethers.getSigners();


    const SFA = await ethers.getContractFactory("SFAToken");
    const sfa = await upgrades.deployProxy(SFA, [owner.address]);

    await sfa.deployed();
    console.log("SFA Token deployed to:", sfa.address);

    const solarHead = await ethers.deployContract("MockNFT", ["Solar Heads", "SH", 26]);
    await solarHead.deployed();
    console.log("Solar Head deployed to:", solarHead.address);

    const solarPass = await ethers.deployContract("MockNFT", ["Solar Pass", "SP", 6]);

    await solarPass.deployed();
    console.log("Solar Pass deployed to:", solarPass.address);

    const stake = await ethers.deployContract("SFAStaking", [5, 25, solarPass.address, 10, solarHead.address, 1, sfa.address, 604800]);

    console.log("SFA Staking deployed to:", stake.address);
    await stake.deployed();

    const sfaBal = await sfa.balanceOf(owner.address);
    await sfa.transfer(stake.address, sfaBal);

    return { sfa, stake, solarHead, solarPass, owner, addy1, addy2 };
  }

  describe("Deployment", function () {
    it("Can stake solar heads", async function () {
      const { sfa, stake, solarHead, solarPass, owner, addy1, addy2 } = await loadFixture(setUp);
      // stakes 1 succesffuly
      await solarHead.approve(stake.address, 0);
      await stake.stakeSolarHead(0);
      const stakeAmount = await stake.getStakedAmounts(owner.address);
      expect(stakeAmount[1]).to.equal(1);
      // does not allow over staking
      for (let i = 1; i < 25; i++) {
          await solarHead.approve(stake.address, i);
          await stake.stakeSolarHead(i);
      }
      await solarHead.approve(stake.address, 25);
      await expect(stake.stakeSolarHead(25)).to.be.revertedWith("SFA Staking: staked amount exceeds limit");
    });

    it("Can stake solar Pass", async function () {
      const { sfa, stake, solarHead, solarPass, owner, addy1, addy2 } = await loadFixture(setUp);
      // stakes 1 succesffuly
      await solarPass.approve(stake.address, 0);
      await stake.stakeSolarPass(0);
      const stakeAmount = await stake.getStakedAmounts(owner.address);
      expect(stakeAmount[0]).to.equal(1);
      // does not allow over staking
      for (let i = 1; i < 5; i++) {
          await solarPass.approve(stake.address, i);
          await stake.stakeSolarPass(i);
      }
      await solarPass.approve(stake.address, 5);
      await expect(stake.stakeSolarPass(5)).to.be.revertedWith("SFA Staking: staked amount exceeds limit");
    });

    it("Can batch stake solar heads", async function () {
      const { sfa, stake, solarHead, solarPass, owner, addy1, addy2 } = await loadFixture(setUp);
      for (let i = 0; i < 26; i++) {
          await solarHead.approve(stake.address, i);
      }
      await stake.batchStakeSolarHead(25, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]);
      const stakeAmount = await stake.getStakedAmounts(owner.address);
      expect(stakeAmount[1]).to.equal(25);
    });

    it("Can batch stake solar Pass", async function () {
      const { sfa, stake, solarHead, solarPass, owner, addy1, addy2 } = await loadFixture(setUp);
      for (let i = 0; i < 5; i++) {
          await solarPass.approve(stake.address, i);
      }
      await stake.batchStakeSolarPass(5, [0,1,2,3,4]);
      const stakeAmount = await stake.getStakedAmounts(owner.address);
      expect(stakeAmount[0]).to.equal(5);
    });

    it("Can claim rewards", async function () {
      const { sfa, stake, solarHead, solarPass, owner, addy1, addy2 } = await loadFixture(setUp);
      for (let i = 0; i < 5; i++) {
        await solarPass.approve(stake.address, i);
      }

      for (let i = 0; i < 26; i++) {
        await solarHead.approve(stake.address, i);
      }
      await stake.batchStakeSolarPass(5, [0,1,2,3,4]);
      await stake.batchStakeSolarHead(25, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]);
      await time.increase(1209600);

      await stake.claimRewards();


      var sfaBal = await sfa.balanceOf(owner.address);
      const expectedBal = ethers.utils.parseEther((((25 * 1) + (10 * 5)) * 2).toString());

      expect(sfaBal).to.equal(expectedBal);

      // verifies you cant claim again
      await stake.claimRewards();
      sfaBal = await sfa.balanceOf(owner.address);
      expect(sfaBal).to.equal(expectedBal);

      // waits again
      await time.increase(604800);
      await stake.claimRewards();
      sfaBal = await sfa.balanceOf(owner.address);
      expect(sfaBal).to.equal(expectedBal.add(ethers.utils.parseEther(((25 * 1) + (10 * 5)).toString())))
    });


    it("Can withdraw", async function () {
      const { sfa, stake, solarHead, solarPass, owner, addy1, addy2 } = await loadFixture(setUp);
      await solarPass.approve(stake.address, 0);
      await stake.stakeSolarPass(0);
      await solarHead.approve(stake.address, 0);
      await stake.stakeSolarHead(0);

      let stakeAmount = await stake.getStakedAmounts(owner.address);
      expect(stakeAmount[0]).to.equal(1);
      expect(stakeAmount[1]).to.equal(1);
      await time.increase(604800);

      await stake.withdraw();
      stakeAmount = await stake.getStakedAmounts(owner.address);

      expect(stakeAmount[0]).to.equal(0);
      expect(stakeAmount[1]).to.equal(0);

      const passBal = await solarPass.balanceOf(owner.address);
      const headBal = await solarHead.balanceOf(owner.address);
    
      expect(passBal).to.equal(6);
      expect(headBal).to.equal(26);

      var sfaBal = await sfa.balanceOf(owner.address);
      const expectedBal = ethers.utils.parseEther("11");

      expect(sfaBal).to.equal(expectedBal);
      await time.increase(604800);
      await stake.claimRewards();
      sfaBal = await sfa.balanceOf(owner.address);
      expect(sfaBal).to.equal(expectedBal);
    });

    
  });
});
