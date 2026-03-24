import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSwitchChain, useReadContracts, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { useState, useEffect } from 'react';

const CONTRACT_ADDRESS = "0x357F2b6137f628074198d3BC71cae159D050768b";
const USDC_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

const TOKEN_ADDRESSES: Record<number, Record<string, `0x${string}`>> = {
    // 1. Ethereum Mainnet
    1: {
        eth: '0x0000000000000000000000000000000000000000', // 네이티브
        usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        steth: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        wbtc: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        sol: '0xD31695Ad3Ec77E7AC521223527B3F182853B44D5', // Wrapped
        link: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
        uni: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    },
    // 10. Optimism
    10: {
        usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        op: '0x4200000000000000000000000000000000000042',
        weth: '0x4200000000000000000000000000000000000006',
    },
    // 56. BNB Smart Chain
    56: {
        usdt: '0x55d398326f99059fF775485246999027B3197955',
        btcb: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
        eth: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    },
    // 8453. Base
    8453: {
        usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        cbeth: '0x2Ae3F1Ec7F1F58411d959E01E62Cc2326f9B4844',
    },
    // 42161. Arbitrum One
    42161: {
        usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        arb: '0x912CE59144191C1204E64559FE8253a0e49E6548',
        link: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
    },
    // 59144. Linea
    59144: {
        usdc: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
        weth: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
    },
    // 421614. Arbitrum Sepolia (테스트용)
    421614: {
        usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    }
};

const abi = [
    {
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "getUsdcBalance",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address[]", "name": "recipients", "type": "address[]" },
            { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
        ],
        "name": "batchTransferUsdc",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

const erc20Abi = [
    {
        "inputs": [
            { "internalType": "address", "name": "spender", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // Allowance (승인된 금액 확인용) ABI 추가
    {
        "inputs": [
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "address", "name": "spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },

    {
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },

    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },

    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export default function Home() {
    //State
    const { address, isConnected, chain } = useAccount();

    const { switchChain } = useSwitchChain();

    const [activeTab, setActiveTab] = useState("main");
    const [searchQuery, setSearchQuery] = useState("")

    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const [coinList, setCoinList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [addressInput, setAddressInput] = useState("0x2205AC6063F32f4857fd65d24700fB5591Ea1Dc7, 0x0f845e28fa26DcDF8e21Dd52a895f8300Fc90dc8");
    const [amountInput, setAmountInput] = useState("1, 2");

    const [customTokenInput, setCustomTokenInput] = useState("");
    const [customTokens, setCustomTokens] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('my_custom_tokens');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [isNetworkOpen, setIsNetworkOpen] = useState(false);

    const NETWORK_COIN_MAPPING: Record<number, string> = {
        1: 'ethereum',         // Ethereum
        137: 'matic-network',  // Polygon
        42161: 'arbitrum',     // Arbitrum
        10: 'optimism',        // Optimism
        8453: 'base',          // Base
        56: 'binancecoin',     // BNB Chain
        59144: 'linea-build',  // Linea
    };
    const [prices, setPrices] = useState<Record<string, {
        price: number;
        image: string;
        symbol: string;
        name: string;
    }>>({});

    const networkOptions = [
        { id: 1, name: 'Ethereum Mainnet', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
        { id: 42161, name: 'Arbitrum', image: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png' },
        { id: 8453, name: 'Base', image: 'https://cryptologos.cc/logos/base-logo.png' },
        { id: 59144, name: 'Linea', image: 'https://images.mirror-media.xyz/publication-images/7905-S3Y7oO_D_NlS7H13.png' },
        { id: 56, name: 'BNB Chain', image: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
        { id: 10, name: 'Optimism', image: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png' },
        { id: 137, name: 'Polygon', image: 'https://cryptologos.cc/logos/polygon-matic-logo.png' },
        { id: 421614, name: 'Arbitrum Sepolia', image: 'https://assets.coingecko.com/coins/images/16547/small/arbitrum.png' },
    ];

    const fetchPrices = async () => {
        try {
            const coinIds = 'ethereum,chainlink,matic-network,arbitrum, base, binancecoin, linea-build, optimism, usd-coin,tether,pax-gold,uniswap,polkadot';

            const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false'

            const response = await fetch(url);
            if (!response.ok) throw new Error('Gecko is resting...');

            const data = await response.json();

            const priceMap: Record<string, { price: number; image: string; symbol: string; name: string }> = {};

            data.forEach((coin: any) => {
                priceMap[coin.id] = {
                    price: coin.current_price,
                    image: coin.image,
                    symbol: coin.symbol.toUpperCase(),
                    name: coin.name
                };
            });
            setPrices(priceMap);
        } catch (error) {
            console.error("가격 정보를 가져오는데 실패했습니다:", error);
        }
    };

    const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);


    const validTokens = coinList.filter(coin =>
        chain?.id && TOKEN_ADDRESSES[chain.id]?.[coin.symbol.toLowerCase()]
    )

    const { data: nativeBalance } = useBalance({
        address: address as '0x${string}',
        chainId: chain?.id
    });

    const [customTokensMap, setCustomTokensMap] = useState<Record<number, string[]>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('my_custom_tokens_v2');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("로딩 에러:", e);
                    return {};
                }
            }
        }
        return {};
    });

    const currentChainId = chain?.id || 0;
    const currentCustomTokens = customTokensMap[currentChainId] || [];

    const coingeckoId = NETWORK_COIN_MAPPING[selectedNetwork.id];
    const apiImage = prices[coingeckoId]?.image;

    const selectedNetworkImage = apiImage || selectedNetwork.image;


    // useEffect
    useEffect(() => {
        if (typeof window !== 'undefined' && currentChainId !== 0) {
            console.log("저장 중...", customTokensMap); // 디버깅용 로그
            localStorage.setItem('my_custom_tokens_v2', JSON.stringify(customTokensMap));
        }
    }, [customTokensMap, currentChainId]); // 두 변수가 바뀔 때마다 저장

    useEffect(() => {
        if (chain?.id) {
            const currentNet = networkOptions.find(n => n.id === chain.id);
            if (currentNet) {
                setSelectedNetwork(currentNet);
            }
        }
    }, [chain?.id]);

    useEffect(() => {
        const fetchCoins = async () => {
            try {
                const response = await fetch(
                    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
                );
                const data = await response.json();
                setCoinList(data);
            } catch (error) {
                console.error("코인 데이터를 불러오는데 실패했습니다:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCoins();
    }, []);

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 120000); // 2분마다 업데이트
        return () => clearInterval(interval);
    }, []);

    const balanceQueries = validTokens.map(coin => ({
        address: TOKEN_ADDRESSES[chain!.id][coin.symbol.toLowerCase()],
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
        chainId: chain?.id,
    }));

    // 3. Wagmi 멀티콜! 한 번의 요청으로 여러 컨트랙트의 잔고를 동시에 가져옵니다.
    const { data: balancesData } = useReadContracts({
        contracts: address ? balanceQueries : [],
    });

    const customTokenQueries = currentCustomTokens.flatMap((tokenAddr) => [
        { address: tokenAddr as `0x${string}`, abi: erc20Abi, functionName: 'symbol', chainId: currentChainId },
        { address: tokenAddr as `0x${string}`, abi: erc20Abi, functionName: 'decimals', chainId: currentChainId },
        { address: tokenAddr as `0x${string}`, abi: erc20Abi, functionName: 'balanceOf', args: [address as `0x${string}`], chainId: currentChainId }
    ]);

    const { data: customTokensData, refetch: refetchCustom } = useReadContracts({
        contracts: customTokenQueries,
        query: {
            refetchInterval: 10000, // 10,000ms = 10초마다 실행
            staleTime: 5000,
        }
    });

    // 2. 화면용 데이터 가공 (여기도 currentCustomTokens 사용!)
    const myCustomTokens = currentCustomTokens.map((tokenAddr, index) => {
        const baseIdx = index * 3;
        const symbol = customTokensData?.[baseIdx]?.result as string || '???';
        const decimals = customTokensData?.[baseIdx + 1]?.result as number || 18;
        const rawBalance = customTokensData?.[baseIdx + 2]?.result as bigint | undefined;

        const balanceNum = rawBalance ? Number(rawBalance) / (10 ** decimals) : 0;

        return {
            address: tokenAddr,
            symbol: symbol.toUpperCase(),
            balance: balanceNum > 0 ? balanceNum.toFixed(4) : '0'
        };
    });
    const isInputValidAddress = customTokenInput.trim().length === 42 && customTokenInput.trim().startsWith('0x');

    // B. Wagmi 단수형 도구 사용! 한 놈만 팹니다.
    const { data: previewSymbolData, error: previewError } = useReadContract({
        address: isInputValidAddress ? customTokenInput.trim() as `0x${string}` : undefined,
        abi: erc20Abi,
        functionName: 'symbol',
        chainId: chain?.id,
    });

    // C. 화면에 띄울 문구 정리
    let previewMessage = "";
    let isPreviewError = false;

    if (isInputValidAddress) {
        if (previewSymbolData) {
            previewMessage = ` (${previewSymbolData.toString().toUpperCase()})`; // 💰 정상: (USDC)
        } else if (previewError) {
            previewMessage = " (토큰 정보를 가져올 수 없는 주소)"; // ❌ 에러: 주소가 아님
            isPreviewError = true;
        } else {
            previewMessage = " (정보 불러오는 중...)"; // ⏳ 로딩
        }
    } else if (customTokenInput.trim().length > 0) {
        previewMessage = " (올바른 주소 형식이 아닙니다)"; // ❌ 에러: 형식 틀림
        isPreviewError = true;
    }



    // 4. 화면에 그리기 쉽게 { "usdt": "100", "usdc": "50" } 형태의 깔끔한 데이터로 정리합니다.
    const myBalances = validTokens.reduce((acc, coin, index) => {
        const rawBalance = balancesData?.[index]?.result as bigint | undefined;
        const balanceNum = rawBalance ? Number(rawBalance) : 0;
        // 임시로 토큰 소수점을 6자리(USDC 기준)로 계산합니다. (추후 토큰별 디테일 적용 가능)
        acc[coin.symbol.toLowerCase()] = balanceNum > 0 ? (balanceNum / 1000000).toString() : '0';
        return acc;
    }, {} as Record<string, string>);

    if (nativeBalance) {
        const balanceNum = Number(nativeBalance.value) / 10 ** nativeBalance.decimals;

        if (balanceNum > 0) {
            // 이더리움 메인넷(1) 또는 아비트럼 세포리아(421614)일 때는 심볼이 'eth'
            if (chain?.id === 1 || chain?.id === 421614) {
                myBalances['eth'] = balanceNum.toFixed(4); // 소수점 4자리까지만 깔끔하게 표시
            }
            // 폴리곤(137)일 때는 심볼이 'matic' (또는 'pol')
            else if (chain?.id === 137) {
                myBalances['matic'] = balanceNum.toFixed(4);
            }
        }
    }

    const top20Portfolio = Object.keys(prices).map((id, index) => {
        const coinData = prices[id]; // fetchPrices에서 저장한 데이터

        const symbol = coinData?.symbol || '';
        const name = coinData?.name || 'Loading...';
        const price = coinData?.price || 0;
        const image = coinData?.image || '';

        // 1. 내 잔고 가져오기 (기존 myBalances 로직 유지)
        let balanceStr = myBalances[coinData.symbol.toLowerCase()] || '0';

        return {
            id: id,
            name: coinData.name,
            symbol: coinData.symbol, // 이미 상단에서 .toUpperCase() 처리를 했다면 그대로 사용
            image: coinData.image,   // 코인게코 API에서 가져온 실시간 로고
            current_price: coinData.price,
            balance: balanceStr,
            isCustom: false,
            sortIndex: index         // 시총 순서 유지용
        };
    });

    const customPortfolio = myCustomTokens.map((token, index) => ({
        id: token.address, // 고유 ID로 주소 사용
        name: '커스텀 토큰', // 이름은 통일
        symbol: token.symbol,
        image: null, // 아이콘 이미지가 없으니 나중에 기본 로고로 처리
        current_price: 0, // 💸 커스텀 토큰은 현재 가격을 알 수 없습니다.
        balance: token.balance,
        isCustom: true,
        sortIndex: 10 + index // Top 10 뒤에 붙이기 위해 index를 조정
    }));

    const finalPortfolio = [...top20Portfolio, ...customPortfolio];

    const totalValue = finalPortfolio.reduce((acc, coin) => {
        const price = coin.current_price || 0;
        const balance = parseFloat(coin.balance) || 0;
        return acc + (price * balance);
    }, 0);

    const filteredPortfolio = finalPortfolio.filter((coin) => {
        const query = searchQuery.toLowerCase();
        return (
            coin.name.toLowerCase().includes(query) ||
            coin.symbol.toLowerCase().includes(query)
        );
    });




    //functions
    const handleApprove = () => {
        writeContract({
            address: USDC_ADDRESS,
            abi: erc20Abi,
            functionName: 'approve',
            args: [
                CONTRACT_ADDRESS as `0x${string}`,
                BigInt(10000 * 1000000) // 100만 USDC 넉넉하게 승인
            ],
        });
    };

    const handleAddCustomToken = () => {
        const trimmed = customTokenInput.trim().toLowerCase();

        // 1. 형식 체크
        if (trimmed.length !== 42 || !trimmed.startsWith('0x')) {
            alert("올바른 컨트랙트 주소 형식이 아닙니다.");
            return;
        }

        // 2. 네트워크 연결 확인
        if (!currentChainId) {
            alert("네트워크를 먼저 연결해 주세요.");
            return;
        }

        // 3. 현재 네트워크의 '기본 등록 토큰' 주소들과 비교 (중복 방지)
        if (TOKEN_ADDRESSES[currentChainId]) {
            const existingAddresses = Object.values(TOKEN_ADDRESSES[currentChainId]).map(addr => addr.toLowerCase());
            if (existingAddresses.includes(trimmed)) {
                alert("이미 기본 리스트에 있는 토큰입니다!");
                return;
            }
        }

        // 4. 현재 네트워크의 '이미 추가된 커스텀 토큰'과 비교 (중복 방지)
        // 💡 여기서 currentCustomTokens 변수를 사용합니다.
        if (currentCustomTokens.includes(trimmed)) {
            alert("이미 추가하신 커스텀 토큰입니다.");
            return;
        }

        // 5. 모든 검사 통과 시: 해당 네트워크(chainId) 박스에만 저장
        setCustomTokensMap(prev => ({
            ...prev,
            [currentChainId]: [...(prev[currentChainId] || []), customTokenInput.trim()]
        }));

        setCustomTokenInput(""); // 입력창 초기화
        alert("현재 네트워크에 토큰이 추가되었습니다!");
    };

    const handleRemoveToken = (tokenAddr: string) => {
        if (confirm("이 토큰을 리스트에서 삭제하시겠습니까?")) {
            setCustomTokens(prev => prev.filter(addr => addr.toLowerCase() !== tokenAddr.toLowerCase()));
        }
    };
    /*
      const handleBatchTransfer = () => {
        const recipientsArray = addressInput.split(',').map(addr => addr.trim());
        const amountsArray = amountInput.split(',').map(amt => BigInt(Number(amt.trim()) * 1000000));
    
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: abi,
          functionName: 'batchTransferUsdc',
          args: [recipientsArray as `0x${string}`[], amountsArray],
        });
      };
    
      // --- 💡 안전장치 로직 (버튼 무력화용 계산) ---
      let totalSendAmount = 0n;
      let isAmountValid = true;
      let addressCount = 0;
      let amountCount = 0;
    
      try {
        const addrs = addressInput.split(',').map(a => a.trim()).filter(a => a !== '');
        const amts = amountInput.split(',').map(a => a.trim()).filter(a => a !== '');
    
        addressCount = addrs.length;
        amountCount = amts.length;
    
        amts.forEach(amt => {
          const num = Number(amt);
          if (isNaN(num) || num <= 0) throw new Error("유효하지 않은 숫자");
          totalSendAmount += BigInt(Math.floor(num * 1000000));
        });
      } catch (e) {
        isAmountValid = false;
      }
    
      const currentBalance = balance ? (balance as bigint) : 0n;
      const currentAllowance = allowance ? (allowance as bigint) : 0n;
    
      // 상태 판별
      const isLengthMatch = addressCount > 0 && addressCount === amountCount;
      const isBalanceSufficient = currentBalance >= totalSendAmount;
      const isAllowanceSufficient = currentAllowance >= totalSendAmount;
      const hasNoAllowance = currentAllowance === 0n;
    
      // 버튼 텍스트 및 활성화 여부 결정
      let transferBtnText = "다중 송금 실행하기";
      let isTransferDisabled = isPending || isConfirming || !isAmountValid || !isLengthMatch || !isBalanceSufficient || !isAllowanceSufficient;
    
      if (!isLengthMatch) {
        transferBtnText = "주소와 금액의 개수가 다릅니다";
      } else if (!isAmountValid) {
        transferBtnText = "금액을 올바르게 입력하세요";
      } else if (!isBalanceSufficient) {
        transferBtnText = "잔고에 돈이 부족합니다";
      } else if (hasNoAllowance) {
        transferBtnText = "approve를 먼저 진행하세요";
      } else if (!isAllowanceSufficient) {
        transferBtnText = "approve한 금액보다 더 많은 금액을 보낼 수 없습니다";
      } else if (isPending || isConfirming) {
        transferBtnText = "처리 중...";
      }
      */

    return (

        <div style={{ padding: '50px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            <h1>GUSEUL</h1>
            <ConnectButton />

            {isConnected && (
                <>
                    {/* 💡 새로 추가된 탭 네비게이션 버튼 */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                        <button
                            onClick={() => setActiveTab('main')}
                            style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold', border: 'none', background: activeTab === 'main' ? '#0070f3' : '#eee', color: activeTab === 'main' ? 'white' : 'black', borderRadius: '5px' }}
                        >
                            Main Page
                        </button>
                        <button
                            onClick={() => setActiveTab('transfer')}
                            style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold', border: 'none', background: activeTab === 'transfer' ? '#0070f3' : '#eee', color: activeTab === 'transfer' ? 'white' : 'black', borderRadius: '5px' }}
                        >
                            Transfer
                        </button>
                    </div>

                    {activeTab === 'main' && (
                        <div style={{ marginTop: '20px' }}>
                            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                                {/* 💰 총자산 카드 섹션 */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #0070f3 0%, #00a4ff 100%)',
                                    padding: '30px',
                                    borderRadius: '16px',
                                    color: 'white',
                                    marginBottom: '25px',
                                    boxShadow: '0 4px 12px rgba(0, 112, 243, 0.2)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Estimated Total Balance</div>
                                    <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                                        ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>


                                {/* ... 이후 토큰 추가 입력창 및 리스트 UI ... */}
                            </div>
                            {/*
              <div style={{ position: 'relative', marginBottom: '25px', zIndex: 10 }}>

                <button
                  onClick={() => setIsNetworkOpen(!isNetworkOpen)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '15px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '12px',
                    cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '16px', fontWeight: 'bold'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#888', marginRight: '10px', fontSize: '14px', fontWeight: 'normal' }}>네트워크:</span>
                    <img
                      src={selectedNetworkImage}
                      alt={selectedNetwork.name}
                      style={{ width: '24px', height: '24px', marginRight: '8px', borderRadius: '50%' }}
                    />
                    {selectedNetwork.name}
                  </div>
                  <span>{isNetworkOpen ? '▲' : '▼'}</span>
                </button>

                {isNetworkOpen && (
                  <ul style={{
                    position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: '5px',
                    backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '12px',
                    listStyle: 'none', padding: 0, overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }}>
                    {networkOptions.map((net) => {
                      // 1. API에서 가져온 이미지가 있으면 쓰고, 없으면 기본 net.image 사용
                      const netApiImage = prices[NETWORK_COIN_MAPPING[net.id]]?.image || net.image;

                      return (
                        <li key={net.name}>
                          <button
                            onClick={() => {
                              setIsNetworkOpen(false); // 드롭다운 닫기
                              if (switchChain) {
                                switchChain({ chainId: net.id }); // 네트워크 전환 요청
                              }
                            }}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '15px',
                              backgroundColor: selectedNetwork.name === net.name ? '#f0f7ff' : 'white',
                              border: 'none',
                              borderBottom: '1px solid #eee',
                              cursor: 'pointer',
                              fontSize: '16px',
                              transition: '0.2s',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                            onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              selectedNetwork.name === net.name ? '#f0f7ff' : 'white')
                            }
                          >
                            <img
                              src={netApiImage}
                              alt={net.name}
                              style={{
                                width: '24px',
                                height: '24px',
                                marginRight: '10px',
                                borderRadius: '50%',
                              }}
                            />
                            {net.name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              */}

                            <h3>Tokens</h3>

                            <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '12px', padding: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                {isLoading ? (
                                    <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>데이터를 불러오는 중입니다...</p>
                                ) : (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {/* 🔥 2단계: 합쳐진 finalPortfolio 리스트를 그립니다! */}
                                        {finalPortfolio.map((coin, index) => {
                                            const hasBalance = coin.balance !== '0' && coin.balance !== '0.0000';

                                            return (
                                                <li key={coin.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                    {/* 💡 button 대신 div를 사용하고, 클릭 이벤트는 여기에 겁니다. */}
                                                    <div
                                                        onClick={() => alert(`${coin.name} 정보 페이지!`)}
                                                        style={{
                                                            width: '100%',
                                                            display: 'flex',
                                                            justifyContent: 'space-between', // 양 끝으로 밀어주기
                                                            alignItems: 'center',
                                                            padding: '15px 10px',
                                                            cursor: 'pointer',
                                                            transition: 'background-color 0.2s',
                                                        }}
                                                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                                                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                                    >
                                                        {/* --- 왼쪽 영역 (순번 + 아이콘 + 이름) --- */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <span style={{ color: '#aaa', fontWeight: 'bold', width: '20px' }}>{index + 1}</span>

                                                            {coin.image ? (
                                                                <img src={coin.image} alt={coin.name} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                                                            ) : (
                                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#888' }}>?</div>
                                                            )}

                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ fontWeight: '600', color: '#333' }}>
                                                                    {coin.name} <span style={{ fontSize: '12px', color: '#888', fontWeight: '400' }}>({coin.symbol})</span>
                                                                </span>
                                                                {coin.isCustom && <span style={{ fontSize: '10px', color: '#aaa' }}>{coin.id.slice(0, 10)}...</span>}
                                                            </div>
                                                        </div>

                                                        {/* --- 오른쪽 영역 (가격 + 잔고 + 삭제버튼) --- */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ textAlign: 'right' }}>
                                                                {coin.current_price > 0 && (
                                                                    <div style={{ fontSize: '13px', color: '#666' }}>${coin.current_price.toLocaleString()}</div>
                                                                )}
                                                                <div style={{ fontSize: '15px', color: hasBalance ? '#0070f3' : '#999', fontWeight: 'bold' }}>
                                                                    {coin.balance} {coin.symbol}
                                                                </div>
                                                            </div>

                                                            {/* 🔥 삭제 버튼: 스타일을 더 깔끔하게 다듬었습니다. */}
                                                            {coin.isCustom && (
                                                                <div
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); // 부모 div의 클릭 이벤트 방지
                                                                        handleRemoveToken(coin.id);
                                                                    }}
                                                                    style={{
                                                                        padding: '5px 10px',
                                                                        backgroundColor: '#fff1f0',
                                                                        color: '#ff4d4f',
                                                                        borderRadius: '6px',
                                                                        fontSize: '11px',
                                                                        fontWeight: '600',
                                                                        border: '1px solid #ffa39e',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    삭제
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>


                            {/* 🔥 새로 추가 5: 커스텀 토큰 입력창 및 리스트 UI */}
                            <div style={{ marginTop: '30px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '12px', padding: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '18px' }}>✨ 내 커스텀 토큰</h3>

                                {/* 주소 입력창과 추가 버튼 */}
                                <div style={{ position: 'relative', marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            value={customTokenInput}
                                            onChange={(e) => setCustomTokenInput(e.target.value)}
                                            placeholder="토큰 컨트랙트 주소 입력 (0x...)"
                                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' }}
                                        />
                                        <button
                                            onClick={handleAddCustomToken}
                                            style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            추가
                                        </button>
                                    </div>

                                    {/* 🌟 4단계: 입력창 바로 아래에 빨간색 미리보기 문구 표시 */}
                                    {previewMessage && (
                                        <div style={{
                                            position: 'absolute', top: '100%', left: '10px', marginTop: '3px',
                                            fontSize: '12px', color: isPreviewError ? '#d00000' : '#888', fontWeight: 'bold'
                                        }}>
                                            {previewMessage}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 💡 탭 2: Transfer Page (기존 송금 폼) */}
                    {/*{activeTab === 'transfer' && (
            <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
              <h2>Transfer USDC</h2>
              <p><strong>My Balance:</strong> {balance ? Number(balance) / 1000000 : 0} USDC</p>
              <p style={{ color: '#0070f3' }}>
                <strong>Approved Allowance:</strong> {allowance ? Number(allowance) / 1000000 : 0} USDC
              </p>

              <hr style={{ margin: '20px 0' }} />

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>받을 지갑 주소 (쉼표로 구분)</label>
                <textarea
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  style={{ width: '100%', height: '60px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                  placeholder="0x123..., 0x456..."
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>보낼 금액 (USDC, 쉼표로 구분)</label>
                <input
                  type="text"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                  placeholder="1, 2"
                />
              </div>

              <button
                onClick={handleApprove}
                disabled={isPending || isConfirming}
                style={{
                  padding: '12px 20px', fontSize: '16px', cursor: 'pointer', width: '100%', marginBottom: '10px',
                  backgroundColor: (isPending || isConfirming) ? '#ccc' : '#f5a623',
                  color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold'
                }}
              >
                {isPending ? 'Wait for Approval...' : isConfirming ? 'writing..' : 'Step 1: Approve USDC'}
              </button>

              <button
                onClick={handleBatchTransfer}
                disabled={isTransferDisabled}
                style={{
                  padding: '12px 20px', fontSize: '16px', cursor: isTransferDisabled ? 'not-allowed' : 'pointer', width: '100%',
                  backgroundColor: isTransferDisabled ? '#ccc' : '#0070f3',
                  color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', transition: '0.2s'
                }}
              >
                {transferBtnText}
              </button>

              {error && (
                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#ffe6e6', color: '#d00000', borderRadius: '5px', fontSize: '14px', wordBreak: 'break-all' }}>
                  <strong>에러 원인:</strong> {error.message}
                </div>
              )}

              {hash && <p style={{ marginTop: '15px', fontSize: '14px', wordBreak: 'break-all' }}>트랜잭션 해시: {hash}</p>}
              {isConfirmed && <p style={{ color: 'green', fontWeight: 'bold', marginTop: '10px' }}>Transaction Complete!</p>}
            </div>
          )}
            */}
                </>
            )}
        </div>
    );
}