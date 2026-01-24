'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authApi, api } from '@/lib/api';
import { useToast } from './ToastContext';

interface User {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
    refreshToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { showToast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user and token from localStorage on mount
    useEffect(() => {
        const loadStoredAuth = () => {
            try {
                const storedUser = localStorage.getItem('studycollab_user');
                const storedToken = localStorage.getItem('studycollab_token');
                const storedRefreshToken = localStorage.getItem('studycollab_refresh_token');

                if (storedUser && storedToken) {
                    setUser(JSON.parse(storedUser));
                    api.setToken(storedToken);
                    if (storedRefreshToken) {
                        setRefreshToken(storedRefreshToken);
                    }
                }
            } catch (error) {
                console.error('Error loading stored auth:', error);
                localStorage.removeItem('studycollab_user');
                localStorage.removeItem('studycollab_token');
                localStorage.removeItem('studycollab_refresh_token');
            } finally {
                setIsLoading(false);
            }
        };

        loadStoredAuth();
    }, []);

    // Auto-refresh token when it expires
    useEffect(() => {
        if (!refreshToken || !user) return;

        const refreshInterval = setInterval(async () => {
            try {
                const response = await authApi.refresh(refreshToken);
                if (response.data) {
                    api.setToken(response.data.accessToken);
                    console.log('Token refreshed successfully');
                }
            } catch (error) {
                console.error('Token refresh failed:', error);
                // If refresh fails, logout user
                logout();
            }
        }, 14 * 60 * 1000); // Refresh every 14 minutes (token expires in 15)

        return () => clearInterval(refreshInterval);
    }, [refreshToken, user]);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        
        try {
            const response = await authApi.login(email, password);
            
            if (response.error) {
                showToast(response.error, 'error');
                setIsLoading(false);
                return false;
            }
            
            if (response.data) {
                const { user: userData, accessToken, refreshToken: newRefreshToken } = response.data;
                
                // Store tokens
                api.setToken(accessToken);
                setRefreshToken(newRefreshToken);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('studycollab_refresh_token', newRefreshToken);
                }
                
                // Store user
                setUser(userData);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('studycollab_user', JSON.stringify(userData));
                }
                
                showToast('Login successful!', 'success');
                setIsLoading(false);
                return true;
            }
            
            setIsLoading(false);
            return false;
        } catch (error: any) {
            console.error('Login error:', error);
            showToast('Login failed. Please try again.', 'error');
            setIsLoading(false);
            return false;
        }
    };

    const register = async (name: string, email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        
        try {
            const response = await authApi.register(name, email, password);
            
            if (response.error) {
                showToast(response.error, 'error');
                setIsLoading(false);
                return false;
            }
            
            if (response.data) {
                const { user: userData, accessToken, refreshToken: newRefreshToken } = response.data;
                
                // Store tokens
                api.setToken(accessToken);
                setRefreshToken(newRefreshToken);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('studycollab_refresh_token', newRefreshToken);
                }
                
                // Store user
                setUser(userData);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('studycollab_user', JSON.stringify(userData));
                }
                
                showToast('Registration successful!', 'success');
                setIsLoading(false);
                return true;
            }
            
            setIsLoading(false);
            return false;
        } catch (error: any) {
            console.error('Registration error:', error);
            showToast('Registration failed. Please try again.', 'error');
            setIsLoading(false);
            return false;
        }
    };

    const logout = async () => {
        try {
            await authApi.logout(refreshToken);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setRefreshToken(null);
            api.setToken(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('studycollab_user');
                localStorage.removeItem('studycollab_token');
                localStorage.removeItem('studycollab_refresh_token');
            }
            showToast('Logged out successfully', 'success');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                isLoading,
                refreshToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
