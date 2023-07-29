require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    mainnet: {
      url: "https://mainnet.infura.io/v3/dd5aebf576e648d4a49eb2bfc014bef3",
      accounts: ["0xfcac25395029b35fc8090d7aa431dede3463569536901d15d94e5f8c744a85c4"]
    }
  },
  etherscan: {
    apiKey: "EZ64D3E2883DS6S95K6U8HT2QHHQUXNZZM"
  },
  gasReporter: {
    enabled: true
  }
};
