export const CONTRACT_ADDRESS = "0x357F2b6137f628074198d3BC71cae159D050768b";
export const USDC_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

export const TOKEN_ADDRESSES: Record<number, Record<string, `0x${string}`>> = {
    1: { eth: '0x0000...', usdt: '0xdAC1...', usdc: '0xA0b8...', steth: '0xae7a...', wbtc: '0x2260...', sol: '0xD316...', link: '0x5149...', uni: '0x1f98...' },
    10: { usdc: '0x0b2C...', op: '0x4200...', weth: '0x4200...' },
    56: { usdt: '0x55d3...', btcb: '0x7130...', eth: '0x2170...' },
    8453: { usdc: '0x8335...', cbeth: '0x2Ae3...' },
    42161: { usdc: '0xaf88...', arb: '0x912C...', link: '0xf97f...' },
    59144: { usdc: '0x1762...', weth: '0xe5D7...' },
    421614: { usdc: '0x75fa...' }
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

export const NETWORK_COIN_MAPPING: Record<number, string> = {
    1: 'ethereum', 137: 'matic-network', 42161: 'arbitrum', 10: 'optimism', 8453: 'base', 56: 'binancecoin', 59144: 'linea-build'
};