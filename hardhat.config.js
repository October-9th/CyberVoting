require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      accounts: [
        `dc0680cb98e798056901556d04e9b10626ac40248f3f116b4bf22e13ad3c8826`,
      ],
    },
  },
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
