"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Alchemy, Network } from "alchemy-sdk";
import { formatUnits } from "viem";

// Initialize Alchemy SDK
const config = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    network: Network.ARB_SEPOLIA,
};
const alchemy = new Alchemy(config);

export default function TokenList() {
    const { address, isConnected } = useAccount();
    const [tokens, setTokens] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [displayCurrency, setDisplayCurrency] = useState('TOKEN');

    const RATES = {
        USDC_TO_KRW: 1350,
        ETH_TO_USDC: 3000,
    };

    const getConvertedBalance = (symbol: string, balanceStr: string) => {
        const numBalance = Number(balanceStr);
        if (isNaN(numBalance)) return "0";

        let priceInUsdc = 0.1;
        if (symbol.toUpperCase().includes('USDC')) priceInUsdc = 1;
        if (symbol.toUpperCase().includes('ETH')) priceInUsdc = RATES.ETH_TO_USDC;

        if (displayCurrency === 'TOKEN') return `${numBalance} ${symbol}`;
        if (displayCurrency === 'USDC') return `${(numBalance * priceInUsdc).toFixed(2)} USDC`;
        if (displayCurrency === 'ETH') return `${(numBalance * priceInUsdc / RATES.ETH_TO_USDC).toFixed(6)} ETH`;
        if (displayCurrency === 'KRW') return `${Math.floor(numBalance * priceInUsdc * RATES.USDC_TO_KRW).toLocaleString()} KRW`;

    }

    useEffect(() => {
        const fetchTokens = async () => {
            if (!address) return;
            setIsLoading(true);

            try {
                const balances = await alchemy.core.getTokenBalances(address);

                // Debugging: Check the raw response from Alchemy in browser console
                console.log("Alchemy Response:", balances);

                // Filter out zero balances using BigInt for hex strings
                const nonZeroBalances = balances.tokenBalances.filter((token) => {
                    if (!token.tokenBalance) return false;
                    return BigInt(token.tokenBalance) > 0n;
                });

                const tokenDataPromises = nonZeroBalances.map(async (token) => {
                    const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);

                    // Convert hex balance to decimal using BigInt to prevent overflow
                    const rawBalanceStr = token.tokenBalance ? BigInt(token.tokenBalance).toString() : "0";
                    const decimals = metadata.decimals || 18;
                    const exactBalance = formatUnits(BigInt(rawBalanceStr), decimals);

                    return {
                        name: metadata.name,
                        symbol: metadata.symbol,
                        logo: metadata.logo,
                        balance: exactBalance,
                    };
                });

                const completeTokenList = await Promise.all(tokenDataPromises);
                setTokens(completeTokenList);

            } catch (error) {
                console.error("Failed to fetch tokens:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isConnected) {
            fetchTokens();
        }
    }, [address, isConnected]);

    if (!isConnected) return null;

    return (
        <div className="p-6 bg-white shadow-lg rounded-2xl max-w-sm mx-auto mt-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tokens</h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                {['TOKEN', 'USDC', 'ETH', 'KRW'].map((currency) => (
                    <button
                        key={currency}
                        onClick={() => setDisplayCurrency(currency)}
                        style={{
                            padding: '5px 10px', fontSize: '12px', cursor: 'pointer', border: 'none', borderRadius: '4px',
                            backgroundColor: displayCurrency === currency ? '#0070f3' : '#e0e0e0',
                            color: displayCurrency === currency ? 'white' : 'black'
                        }}
                    >
                        {currency === 'TOKEN' ? '기본 수량' : `${currency} 환산`}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <p className="text-sm text-gray-500 text-center py-4">지갑 털어보는 중...</p>
            ) : tokens.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">보유한 잡코인이 없습니다.</p>
            ) : (
                <ul className="space-y-3">
                    {tokens.map((token, index) => (
                        <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                                {token.logo ? (
                                    <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" />
                                ) : (
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex justify-center items-center text-xs font-bold text-gray-500">
                                        {token.symbol?.substring(0, 1)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-gray-800">{token.symbol}</p>
                                    <p className="text-xs text-gray-500">{token.name}</p>
                                </div>
                            </div>
                            <div className="font-bold text-gray-800">
                                <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: 'bold' }}>
                                    {getConvertedBalance(token.symbol, token.balance)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}