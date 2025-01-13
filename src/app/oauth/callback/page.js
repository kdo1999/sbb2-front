"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/provider/UserProvider';

export default function OAuthCallback() {
    const router = useRouter();
    const { setUsername } = useUser();

    useEffect(() => {
        const fetchUserInfo = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/member/info`, {
                cache: 'no-store',
                credentials: 'include',
            });
            const result = await response.json();

            if (response.status === 200) {
                setUsername(result.data.username);
                router.push('/');
            } else {
                router.push('/login');
            }
        };

        fetchUserInfo();
    }, [router, setUsername]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Processing...</h2>
            </div>
        </div>
    );
}