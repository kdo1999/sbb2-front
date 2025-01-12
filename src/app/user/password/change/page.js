"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Signup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        originalPassword: '',
        password: '',
        passwordCheck: ''
    });
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                router.push('/login');
            }
        e.preventDefault();
        setErrorMessage(''); // Clear previous error message

        if (formData.password !== formData.passwordCheck) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/password/change`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Authorization': accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                originalPassword: formData.originalPassword,
                password: formData.password,
                passwordCheck: formData.passwordCheck
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert('비밀번호가 변경되었습니다!');
            router.push('/');
        } else {
            if (result.code === 400 && result.errorDetail && result.errorDetail.errors) {
                const error = result.errorDetail.errors[0];
                if (error) {
                    setErrorMessage(error.reason);
                } else {
                    setErrorMessage(result.message);
                }
            } else {
                setErrorMessage('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Sign Up</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">원래 비밀번호</label>
                        <input
                            type="password"
                            name="originalPassword"
                            id="originalPassword"
                            placeholder="originalPassword"
                            value={formData.originalPassword}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">변경할 비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="passwordCheck" className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
                        <input
                            type="password"
                            name="passwordCheck"
                            id="passwordCheck"
                            placeholder="passwordCheck"
                            value={formData.passwordCheck}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <div>
                        <input
                            type="submit"
                            value="Sign Up"
                            className="w-full px-3 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                        />
                    </div>
                </form>
                {errorMessage && <p className="mt-4 text-sm text-red-500">{errorMessage}</p>}
            </div>
        </div>
    );
}