import React, { createContext, useContext, useEffect, useState } from "react";
import {useMutation, UseMutationResult} from "@tanstack/react-query";
import {postData} from "../../api/queryClient";
import {ROUTES} from "../../api/routes";

interface AuthContextType {
    isAuthenticated: boolean;
    userId: string | null;
    storeUserId: (id: string) => void;
    token: string | null;
    storeToken: (token: string) => void;
    logout: UseMutationResult<void, Error, void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        setUserId(storedUser);
        setToken(storedToken);
        setIsAuthenticated(storedToken !== null);
    }, []);

    const storeUserId = (id: string) => {
        localStorage.setItem("user", id)
        setUserId(id);
    }

    const storeToken = (newToken: string) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setIsAuthenticated(true);
    };

    const clearToken = () => {
        localStorage.removeItem("token");
        setToken(null);
        setIsAuthenticated(false);
    };

    const logout = useMutation({
        mutationFn: () => postData<void>(ROUTES.LOGOUT, {}),
        onSuccess: () => {
            clearToken();
        },
    });


    return (
        <AuthContext.Provider value={{ isAuthenticated, userId, storeUserId, token, storeToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export default AuthProvider;
