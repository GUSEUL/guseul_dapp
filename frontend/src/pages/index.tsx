import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState } from 'react';

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
  }
] as const;

export default function Home() {
  const { address, isConnected } = useAccount();

  const [addressInput, setAddressInput] = useState("0x2205AC6063F32f4857fd65d24700fB5591Ea1Dc7, 0x0f845e28fa26DcDF8e21Dd52a895f8300Fc90dc8");
  const [amountInput, setAmountInput] = useState("1, 2");

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: 'getUsdcBalance',
    args: [address as `0x${string}`],
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const handleApprove = () => {
    writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [
        CONTRACT_ADDRESS as '0x${string}',
        BigInt(1000000 * 1000000)
      ],
    });
  };

  const handleBatchTransfer = () => {
    const recipientsArray = addressInput.split(',').map(addr => addr.trim());

    // 3. 금액도 배열로 만들고, 각각 1000000을 곱해서 USDC 단위(BigInt)로 맞춰줍니다.
    const amountsArray = amountInput.split(',').map(amt => BigInt(Number(amt.trim()) * 1000000));

    // 4. 변환된 배열들을 컨트랙트로 쏩니다!
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: abi,
      functionName: 'batchTransferUsdc',
      args: [recipientsArray as `0x${string}`[], amountsArray],
    });
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', maxWidth: '600px' }}>
      <h1>GUSEUL</h1>
      <ConnectButton />

      {isConnected && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
          <h2>Wallet Successfully Connected!</h2>
          <p><strong>My Balance:</strong> {balance ? Number(balance) / 1000000 : 0} USDC</p>

          <hr style={{ margin: '20px 0' }} />

          <h2>Transfer</h2>

          {/* 받을 주소 입력창 */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>받을 지갑 주소 (쉼표로 구분)</label>
            <textarea
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              style={{ width: '100%', height: '60px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              placeholder="0x123..., 0x456..."
            />
          </div>

          {/* 보낼 금액 입력창 */}
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
              backgroundColor: (isPending || isConfirming) ? '#ccc' : '#f5a623', // 송금 버튼과 헷갈리지 않게 주황색으로!
              color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold'
            }}
          >
            {isPending ? 'Wait for Approval...' : isConfirming ? 'writing..' : 'Step 1: Approve USDC'}
          </button>



          <button
            onClick={handleBatchTransfer}
            disabled={isPending || isConfirming}
            style={{
              padding: '12px 20px', fontSize: '16px', cursor: 'pointer', width: '100%',
              backgroundColor: (isPending || isConfirming) ? '#ccc' : '#0070f3',
              color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold'
            }}
          >
            {isPending ? '지갑 승인 대기중...' : isConfirming ? '블록체인 기록 중...' : '다중 송금 실행하기'}
          </button>

          {error && (
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#ffe6e6', color: '#d00000', borderRadius: '5px', fontSize: '14px', wordBreak: 'break-all' }}>
              <strong>에러 원인:</strong> {error.message}
            </div>
          )}

          {hash && <p style={{ marginTop: '15px', fontSize: '14px' }}>트랜잭션 해시: {hash}</p>}
          {isConfirmed && <p style={{ color: 'green', fontWeight: 'bold', marginTop: '10px' }}>Transaction Complete!</p>}
        </div>
      )}
    </div>
  );
}