import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState } from 'react';
import TokenList from "../components/TokenList";

const CONTRACT_ADDRESS = "0x357F2b6137f628074198d3BC71cae159D050768b";
const USDC_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

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
  }
] as const;

export default function Home() {
  const { address, isConnected, chain } = useAccount();

  const [activeTab, setActiveTab] = useState("main");


  const [addressInput, setAddressInput] = useState("0x2205AC6063F32f4857fd65d24700fB5591Ea1Dc7, 0x0f845e28fa26DcDF8e21Dd52a895f8300Fc90dc8");
  const [amountInput, setAmountInput] = useState("1, 2");

  // 1. 내 지갑의 잔고 읽어오기
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'getUsdcBalance',
    args: [address as `0x${string}`],
    query: {
      refetchInterval: 3000,
    }
  });

  // 2. 내가 스마트 컨트랙트에 승인(Approve)해준 금액 읽어오기
  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESS as `0x${string}`] : undefined,
    query: {
      refetchInterval: 3000,
    }
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

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

          {/* 💡 탭 1: Main Page (네트워크, 토큰 목록 출력) */}
          {activeTab === 'main' && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' }}>
                <p style={{ margin: '0 0 10px 0' }}><strong>네트워크:</strong> {chain?.name || 'Unknown Network'}</p>
                {/* 지갑 총액(Total Balance)은 RainbowKit ConnectButton에 기본 표시되므로, 여기서는 네트워크 정보만 강조했습니다. */}
              </div>

              <h3>내 토큰 목록</h3>
              <TokenList />
            </div>
          )}

          {/* 💡 탭 2: Transfer Page (기존 송금 폼) */}
          {activeTab === 'transfer' && (
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
        </>
      )}
    </div>
  );
}