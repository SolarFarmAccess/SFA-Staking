require("dotenv").config();

module.exports = {
    solidity: "0.8.18",
    networks: {
        mainnet: {
        url: process.env.rpc,
        accounts: [process.env.pk]
        }
    },
    etherscan: {
        apiKey: process.env.etherscan_key
    },
    gasReporter: {
        enabled: true
    }
};