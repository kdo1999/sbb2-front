// src/provider/UserProvider.js
"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUsername = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/member/info`, {
                cache: 'no-store',
                credentials: 'include',
            });
            const result = await response.json();

            if (response.status === 200) {
                setUsername(result.data.username);
            }
        };

        fetchUsername();
    }, []);

    return (
        <UserContext.Provider value={{ username, setUsername }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}