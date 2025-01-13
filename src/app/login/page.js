"use client";
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useUser} from '@/provider/UserProvider';
import Link from 'next/link';

export default function Login() {
    const router = useRouter();
    const {setUsername} = useUser();
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear previous error message

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: e.target.email.value,
                password: e.target.password.value
            })
        });

        const result = await response.json();

        if (response.ok) {
            const {username} = result.data;
            setUsername(username); // Update context state
            router.push('/');
            router.refresh();
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

    const handleNaverLogin = async () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/naver"
    }

    const handleKakaoLogin = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/kakao"
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="text" name="email" id="email" placeholder="email"
                               className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"/>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" id="password" placeholder="password"
                               className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"/>
                    </div>
                    <div>
                        <input type="submit" value="Login"
                               className="w-full px-3 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"/>
                    </div>
                </form>
                {errorMessage && <p className="mt-4 text-sm text-red-500">{errorMessage}</p>}
                <div className="text-center mt-4 ">
                    <Link href="/user/password/reset" className="text-gray-500">
                        Forgot Password?
                    </Link>
                </div>
                <div>
                    <button onClick={handleNaverLogin}>네이버 로그인</button>
                </div>
                <div>
                    <button onClick={handleKakaoLogin}>카카오 로그인</button>
                </div>
            </div>
        </div>
    );
}