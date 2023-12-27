import { isTest } from './address';

// ISupportChains
export interface ISupportChains {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const supportedChains: ISupportChains[] = [
  // Ethereum
  {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.ankr.com/eth'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  // Binance
  {
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed1.ninicoin.io'],
    blockExplorerUrls: ['https://bscscan.com/'],
  },
  // Binance test
  {
    chainId: '0x61',
    chainName: 'Binance Smart Chain TEST',
    nativeCurrency: {
      name: 'TBNB',
      symbol: 'tBNB',
      decimals: 18,
    },
    rpcUrls: ['https://data-seed-prebsc-2-s2.binance.org:8545'],
    blockExplorerUrls: ['https://testnet.bscscan.com/'],
  },
  // Polygon 
  {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com'], // https://rpc-mainnet.matic.network
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
  // Polygon test
  {
    chainId: '0x13881',
    chainName: 'Mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://polygon-mumbai.blockpi.network/v1/rpc/public'], // https://rpc-mainnet.matic.network
    blockExplorerUrls: ['https://mumbai.polygonscan.com/']
  },
  // Arbitrum Test
  {
    chainId: '0x66eed',
    chainName: 'Arbitrum Goerli Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://goerli-rollup.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://goerli.arbiscan.io/'],
  },
  // Arbitrum
  {
    chainId: '0xa4b1',
    chainName: 'Arbitrum One',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.ankr.com/arbitrum'],
    blockExplorerUrls: ['https://arbiscan.io/'],
  },
  // VIC main
  {
    chainId: '0x58',
    chainName: 'TomoChain',
    nativeCurrency: {
      name: 'TOMO',
      symbol: 'TOMO',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.tomochain.com'],
    blockExplorerUrls: ['https://www.vicscan.xyz'],
  },
  // tomo test
  {
    chainId: '0x59',
    chainName: 'TomoChain Testnet',
    nativeCurrency: {
      name: 'TOMO',
      symbol: 'TOMO',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.testnet.tomochain.com'],
    blockExplorerUrls: ['https://testnet.tomoscan.io'],
  },
];

/**
 * curNeedChain
 * @param chain 
 * @returns
 */
type IChain = 'bsc' | 'matic' | 'eth' | 'vic';

export function curNeedChain(chain: IChain[] = ['bsc']): string[] {
  const arr = [];
  // bsc
  if (chain.includes('bsc')) {
    if (isTest) {
      arr.push('0x61');
    } else {
      arr.push('0x38');
    }
  }

  // vic
  if (chain.includes('vic')) {
    if (isTest) {
      arr.push('0x13881');
    } else {
      arr.push('0x58');
    }
  }

  // polygon
  if (chain.includes('matic')) {
    if (isTest) {
      arr.push('0x13881');
    } else {
      arr.push('0x89');
    }
  }

  // eth
  if (chain.includes('eth')) {
    arr.push('0x1');
  }
  return arr;
}
