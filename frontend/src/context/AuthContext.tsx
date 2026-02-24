"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    role: 'CUSTOMER' | 'MECHANIC' | 'ADMIN';
}

interface AuthContextType {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => { },
    logout: () => { },
    isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    if (res.data.success) {
                        setUser(res.data.user);
                    }
                } catch (e) {
                    console.error("Auth check failed", e);
                    localStorage.removeItem('token');
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        // Also set cookie so Next.js middleware can detect auth
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`;
        setUser(userData);

        // Redirect based on role
        if (userData.role === 'ADMIN') router.push('/dashboard/admin');
        else if (userData.role === 'MECHANIC') router.push('/dashboard/mechanic');
        else router.push('/dashboard/customer');
    };

    const logout = () => {
        localStorage.removeItem('token');
        // Clear the cookie too
        document.cookie = 'token=; path=/; max-age=0; SameSite=Strict';
        setUser(null);
        router.push('/auth');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
