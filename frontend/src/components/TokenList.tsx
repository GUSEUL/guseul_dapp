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
                                {token.balance}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}