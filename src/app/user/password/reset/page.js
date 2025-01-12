"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PasswordReset() {
    const [email, setEmail] = useState('');
    const [certificationCode, setCertificationCode] = useState('');
    const [showVerificationInput, setShowVerificationInput] = useState(false);
    const [message, setMessage] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const router = useRouter();

    const handleSendVerificationCode = async () => {
        setMessage(''); // Clear previous message

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, verifyType: "password_reset_verify" })
        });

        const result = await response.json();

        if (response.status === 200) {
            setMessage('메일함에 인증번호를 확인해주세요!');
            setShowVerificationInput(true);
            setIsEmailSent(true);
        } else {
            setMessage(result.message || '알 수 없는 오류입니다. 관리자에게 문의해주세요');
        }
    };

    const handleVerifyCode = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/password/reset`, {
            method: 'POST',
             headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, certificationCode: certificationCode, verifyType: "password_reset_verify" })
        });
        if (response.ok) {
            alert('임시 비밀번호가 이메일로 전송되었습니다. \n임시 비밀번호로 로그인 해주세요!');
            router.push('/login');
        }else {
            setMessage(result.message || '알 수 없는 오류입니다. 관리자에게 문의해주세요');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-3xl p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Password Reset</h2>
                <div className="space-y-4">
                    <div className="flex items-center">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-4/5 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="Enter your email"
                            disabled={isEmailSent}
                        />
                        <button
                            onClick={handleSendVerificationCode}
                            className="ml-2 w-1/5 px-3 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                            disabled={isEmailSent}
                        >
                            인증번호 전송
                        </button>
                    </div>
                    {showVerificationInput && (
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    id="verificationCode"
                                    name="verificationCode"
                                    value={certificationCode}
                                    onChange={(e) => setCertificationCode(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                                    placeholder="Enter verification code"
                                />
                            </div>
                            <div>
                                <button
                                    onClick={handleVerifyCode}
                                    className="w-full px-3 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                                >
                                    인증하기
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {message && <p className="mt-4 text-sm text-red-500">{message}</p>}
            </div>
        </div>
    );
}