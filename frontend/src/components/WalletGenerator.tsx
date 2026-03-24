import { useState } from 'react';
import { ethers } from 'ethers';

interface WalletGeneratorProps {
    onConnect?: (address: string) => void;
    onBack?: () => void;
    onGoToImport?: () => void;
}

type Step = 'init' | 'password' | 'mnemonic' | 'encrypting' | 'done';

export const WalletGenerator = ({ onConnect, onBack, onGoToImport }: WalletGeneratorProps) => {
    const [step, setStep] = useState<Step>('init');
    const [password, setPassword] = useState("");

    // ethers v6 규격에 맞춘 HDNodeWallet 타입
    const [tempWallet, setTempWallet] = useState<ethers.HDNodeWallet | null>(null);

    const [isSaved, setIsSaved] = useState(false);

    // 최종 결과물
    const [address, setAddress] = useState("");
    const [keystoreJson, setKeystoreJson] = useState("");
    const [privateKey, setPrivateKey] = useState("");

    // 1단계: 비밀번호 입력창 열기
    const startCreation = () => {
        setStep('password');
    };

    // 2단계: 지갑 생성 및 니모닉 표시
    const generateWallet = () => {
        if (password.length < 8) {
            alert("비밀번호는 최소 8자리 이상이어야 합니다.");
            return;
        }
        const wallet = ethers.Wallet.createRandom();
        setTempWallet(wallet);
        setStep('mnemonic');
    };

    // 3단계: 니모닉 확인 완료 및 Keystore 암호화 시작
    const encryptWallet = async () => {
        if (!tempWallet || !isSaved) return;

        setStep('encrypting');

        try {
            const encryptedJson = await tempWallet.encrypt(password);
            const generatedAddress = tempWallet.address;
            const generatedPK = tempWallet.privateKey;

            setAddress(tempWallet.address);
            setKeystoreJson(encryptedJson);
            setPrivateKey(generatedPK);

            // 메모리에서 니모닉과 개인키 즉시 파기 (보안)
            setTempWallet(null);
            setPassword("");
            setIsSaved(false);

            setStep('done');


        } catch (error) {
            console.error("암호화 중 오류 발생:", error);
            alert("지갑 암호화에 실패했습니다.");
            setStep('init');
        }
    };

    // 4단계: 암호화된 Keystore 파일 다운로드 기능
    const downloadKeystore = () => {
        const blob = new Blob([keystoreJson], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `UTC--${new Date().toISOString().replace(/:/g, '-')}--${address}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // UI 초기화
    const resetGenerator = () => {
        setStep('init');
        setAddress("");
        setKeystoreJson("");
    };

    return (
        <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #ddd' }}>

            {onBack && step === 'init' && (
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '15px', padding: '0', fontSize: '14px', textAlign: 'left', display: 'block' }}>
                    ← 처음으로 돌아가기
                </button>
            )}

            {/* Step 0: 초기 화면 */}
            {step === 'init' && (
                <button
                    onClick={startCreation}
                    style={{ width: '100%', padding: '15px', backgroundColor: '#000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                >
                    + 안전한 새 지갑 생성하기
                </button>
            )}

            {/* Step 1: 비밀번호 설정 */}
            {step === 'password' && (
                <div>
                    <h3 style={{ marginTop: 0, fontSize: '16px' }}>🔐 1단계: 지갑 비밀번호 설정</h3>
                    <p style={{ fontSize: '12px', color: '#666' }}>지갑 파일을 안전하게 암호화하기 위한 비밀번호입니다. <strong>절대 잊어버리지 마세요!</strong></p>
                    <input
                        type="password"
                        placeholder="비밀번호 입력 (8자리 이상)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setStep('init')} style={{ flex: 1, padding: '10px', backgroundColor: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>취소</button>
                        <button onClick={generateWallet} style={{ flex: 2, padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>다음 단계</button>
                    </div>
                </div>
            )}

            {/* Step 2: 니모닉 확인 */}
            {step === 'mnemonic' && tempWallet && (
                <div>
                    <h3 style={{ marginTop: 0, fontSize: '16px' }}>📝 2단계: 복구 문구(Mnemonic) 백업</h3>
                    <div style={{ padding: '15px', backgroundColor: '#fff5f5', borderRadius: '8px', border: '1px solid #ffcccc', marginBottom: '15px' }}>
                        <strong style={{ fontSize: '12px', color: '#e53e3e' }}>⚠️ 경고: 아래 12개의 단어를 종이에 적어 안전한 곳에 보관하세요. 누구에게도 노출해선 안 됩니다.</strong>
                        <p style={{ fontSize: '16px', color: '#333', lineHeight: '1.6', marginTop: '10px', fontWeight: 'bold', wordSpacing: '5px' }}>
                            {tempWallet.mnemonic?.phrase}
                        </p>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', cursor: 'pointer', fontSize: '14px' }}>
                        <input type="checkbox" checked={isSaved} onChange={(e) => setIsSaved(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                        <span>이 복구 문구를 안전한 곳에 기록했습니다.</span>
                    </label>

                    <button
                        onClick={encryptWallet}
                        disabled={!isSaved}
                        style={{ width: '100%', padding: '12px', backgroundColor: isSaved ? '#0070f3' : '#ccc', color: 'white', border: 'none', borderRadius: '6px', cursor: isSaved ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}
                    >
                        지갑 암호화 및 생성 완료
                    </button>
                </div>
            )}

            {/* Step 3: 암호화 진행 중 로딩 화면 */}
            {step === 'encrypting' && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0070f3', marginBottom: '10px' }}>보안 암호화 진행 중...</div>
                    <p style={{ fontSize: '12px', color: '#666' }}>강력한 보안 알고리즘을 적용하고 있습니다. 잠시만 기다려주세요 (최대 10초 소요).</p>
                </div>
            )}

            {/* Step 4: 생성 완료 및 Keystore 파일 다운로드 */}
            {step === 'done' && (
                <div>
                    <h3 style={{ marginTop: 0, fontSize: '16px', color: '#00a854' }}>✅ 지갑 생성이 완료되었습니다!</h3>

                    <div style={{ marginBottom: '15px' }}>
                        <strong style={{ fontSize: '12px', color: '#666' }}>내 지갑 주소:</strong>
                        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '6px', fontSize: '13px', wordBreak: 'break-all', border: '1px solid #eee', marginTop: '5px', fontWeight: 'bold' }}>
                            {address}
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <strong style={{ fontSize: '12px', color: '#e53e3e' }}>내 개인키 (절대 노출 금지, 복사해서 로그인 테스트에 쓰세요):</strong>
                        <div style={{ backgroundColor: '#fff5f5', padding: '10px', borderRadius: '6px', fontSize: '13px', wordBreak: 'break-all', border: '1px solid #ffcccc', marginTop: '5px', color: '#c53030' }}>
                            {privateKey}
                        </div>
                    </div>

                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                        안전을 위해 암호화된 Keystore(JSON) 파일을 다운로드해 두세요. 향후 다른 지갑 앱(메타마스크 등)에서 비밀번호와 함께 이 파일로 지갑을 복구할 수 있습니다.
                    </p>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button onClick={downloadKeystore} style={{ flex: 1, padding: '12px', backgroundColor: '#f5a623', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Keystore 다운로드
                        </button>

                        {/* 🌟 '지갑 가져오기' 페이지로 넘어가는 새로운 버튼 */}
                        {onGoToImport && (
                            <button onClick={onGoToImport} style={{ flex: 1, padding: '12px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                로그인하러 가기
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};