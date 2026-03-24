import React, { useState } from 'react';
import { ethers } from 'ethers';

// 상위 컴포넌트(index.tsx)에서 받아올 함수(props) 정의
interface WalletImporterProps {
    onConnect: (address: string) => void;
    onBack: () => void;
}

export default function WalletImporter({ onConnect, onBack }: WalletImporterProps) {
    const [privateKey, setPrivateKey] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 개인키 형식 검사 및 지갑 복구 로직
    const handleImport = async () => {
        setErrorMsg('');
        const trimmedKey = privateKey.trim();

        // 1. 기초적인 유효성 검사
        if (!trimmedKey) {
            setErrorMsg('개인키를 입력해주세요.');
            return;
        }

        // 0x 포함 여부에 상관없이 64자리 헥스 문자열인지 확인 (0x 포함시 66자리)
        const isHex = /^(0x)?[0-9a-fA-F]{64}$/.test(trimmedKey);
        if (!isHex) {
            setErrorMsg('올바른 개인키 형식이 아닙니다. (64자리 16진수 또는 0x로 시작하는 66자리)');
            return;
        }

        setIsLoading(true);

        try {
            // 2. 입력된 키가 0x로 시작하지 않으면 붙여줌 (ethers.js 호환성)
            const formattedKey = trimmedKey.startsWith('0x') ? trimmedKey : `0x${trimmedKey}`;

            // 3. ethers를 사용하여 개인키로부터 지갑 객체 생성 (주소 추출)
            // 이 과정은 로컬(브라우저)에서만 이루어지므로 서버로 전송되지 않습니다.
            const wallet = new ethers.Wallet(formattedKey);

            // 4. 성공 시 처리
            // 🚨 중요: 보안을 위해 메모리에 남은 개인키 상태를 즉시 지워줍니다.
            setPrivateKey('');

            // 추출된 지갑 주소를 상위 컴포넌트로 전달
            onConnect(wallet.address);

        } catch (error: any) {
            console.error("Wallet import error:", error);
            setErrorMsg('지갑을 가져오는 중 오류가 발생했습니다. 키를 다시 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={onBack} style={styles.backButton}>
                    ← 돌아가기
                </button>
                <h2 style={styles.title}>지갑 가져오기</h2>
            </div>

            <p style={styles.description}>
                기존 지갑의 비공개 개인키(Private Key)를 입력하여 연결하세요.
            </p>

            <div style={styles.inputGroup}>
                <input
                    type="password" // 🛡️ 보안: 화면에 노출되지 않도록 password 타입 사용
                    placeholder="0x로 시작하는 66자리 영문/숫자"
                    value={privateKey}
                    onChange={(e) => {
                        setPrivateKey(e.target.value);
                        if (errorMsg) setErrorMsg(''); // 입력 시작하면 에러 메시지 초기화
                    }}
                    autoComplete="off" // 🛡️ 보안: 브라우저 자동완성 방지
                    spellCheck="false"
                    style={styles.input}
                />
                {errorMsg && <p style={styles.errorText}>{errorMsg}</p>}
            </div>

            <button
                onClick={handleImport}
                disabled={isLoading || !privateKey}
                style={{
                    ...styles.submitButton,
                    opacity: (isLoading || !privateKey) ? 0.6 : 1,
                    cursor: (isLoading || !privateKey) ? 'not-allowed' : 'pointer',
                }}
            >
                {isLoading ? '지갑 연결 중...' : '지갑 가져오기'}
            </button>

            <div style={styles.warningBox}>
                <span style={styles.warningIcon}>⚠️</span>
                <p style={styles.warningText}>
                    <strong>보안 주의:</strong> 개인키는 절대 타인에게 공유하거나 인터넷에 저장하지 마세요.
                    이 앱은 사용자의 개인키를 서버에 저장하거나 전송하지 않습니다. 모든 처리는 현재 브라우저 내에서만 안전하게 이루어집니다.
                </p>
            </div>
        </div>
    );
}

// 간단한 인라인 스타일 (필요에 따라 tailwindcss 나 외부 css로 분리하세요)
const styles = {
    container: {
        maxWidth: '480px',
        margin: '40px auto',
        padding: '30px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        fontFamily: 'sans-serif',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
        position: 'relative' as const,
    },
    backButton: {
        background: 'none',
        border: 'none',
        color: '#6b7280',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '8px 0',
        position: 'absolute' as const,
        left: 0,
    },
    title: {
        margin: '0 auto',
        fontSize: '20px',
        fontWeight: '600',
        color: '#111827',
    },
    description: {
        color: '#4b5563',
        fontSize: '15px',
        marginBottom: '24px',
        lineHeight: '1.5',
    },
    inputGroup: {
        marginBottom: '24px',
    },
    input: {
        width: '100%',
        padding: '16px',
        fontSize: '14px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        boxSizing: 'border-box' as const,
        backgroundColor: '#f9fafb',
        color: '#111827',
    },
    errorText: {
        color: '#ef4444',
        fontSize: '13px',
        marginTop: '8px',
        marginBottom: 0,
    },
    submitButton: {
        width: '100%',
        padding: '16px',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '24px',
        transition: 'background-color 0.2s',
    },
    warningBox: {
        display: 'flex',
        padding: '16px',
        backgroundColor: '#fffbeb',
        border: '1px solid #fef3c7',
        borderRadius: '8px',
        alignItems: 'flex-start',
    },
    warningIcon: {
        marginRight: '12px',
        fontSize: '16px',
    },
    warningText: {
        margin: 0,
        fontSize: '13px',
        color: '#92400e',
        lineHeight: '1.5',
    },
};