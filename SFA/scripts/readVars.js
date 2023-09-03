require("dotenv").config();
const ethers = require("ethers");
// const abi = require("../artifacts/contracts/SFAStaking.sol/SFAStaking.json");

// uint256 maxSolarPass;
// uint256 maxSolarHead;
// address solarPass;
// uint8 solarPassPayout;
// address solarHead;
// uint8 solarHeadPayout;
// address sfaToken;
// uint32 payoutPeriod;
// mapping(address => uint256) solarPassStaked;
// mapping(address => uint256) solarHeadStaked;
// mapping(address => StakingData[5]) solarPassStakedData;
// mapping(address => StakingData[25]) solarHeadStakedData;


const address = "0x08c7c65a1B58bCEc9ea7590C2537d90619F3Dec3";
// const staking = new ethers.Contract(address, abi)
const provider = new ethers.providers.JsonRpcProvider(process.env.rpc);

const readMaxSolarPass = async() => {
    return ethers.BigNumber.from((await provider.getStorageAt(address, 0)).toString());
}

const readMaxSolarHead = async() => {
    return ethers.BigNumber.from((await provider.getStorageAt(address, 1)).toString());
}

const readSolarPass = async() => {
    const slot = (await provider.getStorageAt(address, 2)).toString();
    return ethers.utils.getAddress("0x" + slot.slice(26));
}

const readSolarPassPayout = async() => {
    const slot = (await provider.getStorageAt(address, 2)).toString();
    return ethers.BigNumber.from(slot.slice(0, 26));
}

const readSolarHead = async() => {
    const slot = (await provider.getStorageAt(address, 3)).toString();
    return ethers.utils.getAddress("0x" + slot.slice(26));
}

const readSolarHeadPayout = async() => {
    const slot = (await provider.getStorageAt(address, 3)).toString();
    return ethers.BigNumber.from(slot.slice(0, 26));
}

const readSolarToken = async() => {
    const slot = (await provider.getStorageAt(address, 4)).toString();
    return ethers.utils.getAddress("0x" + slot.slice(26));
}

const readPayoutPeriod = async() => {
    const slot = (await provider.getStorageAt(address, 4)).toString();
    return ethers.BigNumber.from(slot.slice(0, 26));
}


const init = async() => {
    // console.log(await readMaxSolarPass());
    // console.log(await readMaxSolarHead());
    // console.log(await readSolarPass());
    // console.log(await readSolarHead());
    // console.log(await readSolarToken());
    console.log(await readSolarPassPayout());
    console.log(await readSolarHeadPayout());
    console.log(await readPayoutPeriod());
}

init()