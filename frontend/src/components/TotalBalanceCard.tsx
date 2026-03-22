export const CONTRACT_ADDRESS = "0x357F2b6137f628074198d3BC71cae159D050768b";
export const USDC_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

export const TOKEN_ADDRESSES: Record<number, Record<string, `0x${string}`>> = {
    1: {
        eth: '0x0000000000000000000000000000000000000000',
        usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        steth: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        wbtc: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        sol: '0xD31695Ad3Ec77E7AC521223527B3F182853B44D5',
        link: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
        uni: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    },
    10: {
        usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        op: '0x4200000000000000000000000000000000000042',
        weth: '0x4200000000000000000000000000000000000006',
    },
    56: {
        usdt: '0x55d398326f99059fF775485246999027B3197955',
        btcb: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
        eth: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    },
    8453: {
        usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        cbeth: '0x2Ae3F1Ec7F1F58411d959E01E62Cc2326f9B4844',
    },
    42161: {
        usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        arb: '0x912CE59144191C1204E64559FE8253a0e49E6548',
        link: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
    },
    59144: {
        usdc: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
        weth: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
    },
    421614: {
        usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    }
};

export const abi = [
    { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "getUsdcBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address[]", "name": "recipients", "type": "address[]" }, { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "name": "batchTransferUsdc", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
] as const;

export const erc20Abi = [
    { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }
] as const;

export const NETWORK_COIN_MAPPING: Record<number, string> = {
    1: 'ethereum',
    137: 'matic-network',
    42161: 'arbitrum',
    10: 'optimism',
    8453: 'base',
    56: 'binancecoin',
    59144: 'linea-build',
};

export const networkOptions = [
    { id: 1, name: 'Ethereum Mainnet', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
    { id: 42161, name: 'Arbitrum', image: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png' },
    { id: 8453, name: 'Base', image: 'https://cryptologos.cc/logos/base-logo.png' },
    { id: 59144, name: 'Linea', image: 'https://images.mirror-media.xyz/publication-images/7905-S3Y7oO_D_NlS7H13.png' },
    { id: 56, name: 'BNB Chain', image: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
    { id: 10, name: 'Optimism', image: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png' },
    { id: 137, name: 'Polygon', image: 'https://cryptologos.cc/logos/polygon-matic-logo.png' },
    { id: 421614, name: 'Arbitrum Sepolia', image: 'https://assets.coingecko.com/coins/images/16547/small/arbitrum.png' },
];