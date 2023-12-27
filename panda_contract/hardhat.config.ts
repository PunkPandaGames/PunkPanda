import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
dotenv.config();
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    tomo_testnet: {
      url: "https://rpc.testnet.tomochain.com/",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    tomo: {
      url: "https://tomo.blockpi.network/v1/rpc/public",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    zkscroll: {
      url: "https://rpc.scroll.io",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    scrollAlpha: {
      url: process.env.SCROLL_TESTNET_URL || "https://alpha-rpc.scroll.io/l2",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    goerli: {
      url: process.env.GOERLI_TESTNET_URL || "https://rpc.ankr.com/eth_goerli",
      accounts:
        // process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
        // process.env.PRIVATE_JSON_FILE_PATH !== undefined ? parsePrivateKeysFiles(process.env.PRIVATE_JSON_FILE_PATH) : [],
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    polygon_mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    sepolia: {
      url: "https://rpc-sepolia.rockx.com",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    sepolia_scroll: {
      url: "https://sepolia-rpc.scroll.io",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    mainnet: {
      url: "https://ethereum.publicnode.com",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      tomo_testnet: "ABC",
      zkscroll: "XPUNDJJ8VDRAP2HGX35G1SXG6PV476CTJX",
      sepolia_scroll: "XPUNDJJ8VDRAP2HGX35G1SXG6PV476CTJX",
      scrollAlpha: "abc",
      polygon_mumbai:
        process.env.MUMBAISCAN_API_KEY !== undefined
          ? process.env.MUMBAISCAN_API_KEY
          : "",
      sepolia:
        process.env.SEPOLIASCAN_API_KEY !== undefined
          ? process.env.SEPOLIASCAN_API_KEY
          : "",
      goerli:
        process.env.GOERLISCAN_API_KEY !== undefined
          ? process.env.GOERLISCAN_API_KEY
          : "",
    },
    customChains: [
      {
        network: "tomo_testnet",
        chainId: 89,
        urls: {
          apiURL: "https://scan-ui-testnet.viction.xyz/api",
          browserURL: "https://scan-ui-testnet.viction.xyz/",
        },
      },
      {
        network: "tomo",
        chainId: 88,
        urls: {
          apiURL: "https://tomo.blockpi.network/v1/rpc/public",
          browserURL: "https://tomoscan.io/",
        },
      },
      {
        network: "mainnet",
        chainId: 1,
        urls: {
          apiURL: "https://ethereum.publicnode.com",
          browserURL: "https://etherscan.io/",
        },
      },
      {
        network: "goerli",
        chainId: 5,
        urls: {
          apiURL: "https://api-goerli.etherscan.io/api",
          browserURL: "https://goerli.etherscan.io/",
        },
      },
      {
        network: "scrollAlpha",
        chainId: 534353,
        urls: {
          apiURL: "https://alpha-blockscout.scroll.io/api",
          browserURL: "https://alpha-blockscout.scroll.io/",
        },
      },
      {
        network: "zkscroll",
        chainId: 534352,
        urls: {
          // apiURL: "https://blockscout.scroll.io/api",
          // browserURL: "https://blockscout.scroll.io/",
          // apiURL: "https://scroll.l2scan.co/api/contract",
          // browserURL: "https://scroll.l2scan.co/",
          apiURL: "https://api.scrollscan.com/api",
          browserURL: "https://scrollscan.com/",
        },
      },
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io/",
        },
      },
      {
        network: "sepolia_scroll",
        chainId: 534351,
        urls: {
          // apiURL: "https://sepolia-blockscout.scroll.io/api",
          // browserURL: 'https://sepolia-blockscout.scroll.io/'
          // apiURL: "https://scroll-sepolia.l2scan.co/api/contract",
          // browserURL: "https://scroll-sepolia.l2scan.co/",
          apiURL: "https://api-sepolia.scrollscan.com/api",
          browserURL: "https://sepolia.scrollscan.dev/",
        },
      },
      {
        network: "polygon_mumbai",
        chainId: 80001,
        urls: {
          apiURL: "https://api-testnet.polygonscan.com/api",
          browserURL: "https://mumbai.polygonscan.com/",
        },
      },
    ],
  },
};

export default config;
