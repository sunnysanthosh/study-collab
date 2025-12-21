'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Test/Demo credentials
const TEST_USERS = [
    {
        id: '1',
        email: 'test@studycollab.com',
        password: 'test123',
        name: 'Test User',
        avatar: undefined,
    },
    {
        id: '2',
        email: 'admin@studycollab.com',
        password: 'admin123',
        name: 'Admin User',
        avatar: undefined,
    },
    {
        id: '3',
        email: 'student@studycollab.com',
        password: 'student123',
        name: 'Student User',
        avatar: undefined,
    },
];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('studycollab_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('studycollab_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check test credentials
        const testUser = TEST_USERS.find(
            u => u.email === email && u.password === password
        );
        
        if (testUser) {
            const userData: User = {
                id: testUser.id,
                name: testUser.name,
                email: testUser.email,
                avatar: testUser.avatar,
            };
            
            setUser(userData);
            localStorage.setItem('studycollab_user', JSON.stringify(userData));
            setIsLoading(false);
            return true;
        }
        
        // Also accept any email with password "demo123" for easy testing
        if (password === 'demo123') {
            const userData: User = {
                id: Date.now().toString(),
                name: email.split('@')[0],
                email: email,
            };
            
            setUser(userData);
            localStorage.setItem('studycollab_user', JSON.stringify(userData));
            setIsLoading(false);
            return true;
        }
        
        setIsLoading(false);
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('studycollab_user');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                logout,
                isLoading,
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

