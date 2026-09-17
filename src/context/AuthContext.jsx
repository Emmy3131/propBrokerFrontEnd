import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

/*
=====================================================
AUTH PROVIDER
=====================================================
*/

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /*
    =================================================
    GET CURRENT USER
    =================================================
    */

    const getCurrentUser = async () => {
        const token = localStorage.getItem("token");

        /*
        No access token means there is no authenticated
        frontend session to restore.
        */

        if (!token) {
            setUser(null);
            return null;
        }

        try {
            const response = await api.get("/auth/me");

            const currentUser =
                response.data?.data?.user ||
                response.data?.user ||
                null;

            setUser(currentUser);

            return currentUser;
        } catch (error) {
            console.error(
                "Failed to get current user:",
                error.response?.data || error.message
            );

            /*
            Access token is invalid/expired.
            Remove it from localStorage.
            */

            localStorage.removeItem("token");

            setUser(null);

            return null;
        }
    };

    /*
    =================================================
    INITIALIZE AUTH
    =================================================
    */

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem("token");

                /*
                No token = don't call /auth/me.
                This prevents a new visitor from getting:

                "You are not logged in."
                */

                if (!token) {
                    setUser(null);
                    return;
                }

                await getCurrentUser();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    /*
    =================================================
    LOGIN
    =================================================
    */

    const login = async (credentials) => {
        try {
            const response = await api.post(
                "/auth/login",
                credentials
            );

            /*
            Backend should return the access token.
            */

            const accessToken =
                response.data?.accessToken ||
                response.data?.token;

            if (accessToken) {
                localStorage.setItem("token", accessToken);
            }

            /*
            Get the authenticated user after login.
            */

            const loggedInUser =
                response.data?.data?.user ||
                response.data?.user ||
                null;

            setUser(loggedInUser);

            /*
            If the login response doesn't contain the user,
            fetch it from /me.
            */

            if (!loggedInUser) {
                await getCurrentUser();
            }

            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                "Login failed."
            );
        }
    };

    /*
    =================================================
    SIGNUP
    =================================================
    */

    const signup = async (userData) => {
        try {
            /*
            Signup ONLY creates the account.

            It does NOT call /auth/me.
            It does NOT log the user in.
            */

            const response = await api.post(
                "/auth/signup",
                userData
            );

            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                "Unable to create account."
            );
        }
    };

    /*
    =================================================
    REFRESH SESSION
    =================================================
    */

    const refreshSession = async () => {
        try {
            /*
            Browser automatically sends the HTTP-only
            refreshToken cookie because api.js has:

            withCredentials: true
            */

            const response = await api.post(
                "/auth/refresh"
            );

            const accessToken =
                response.data?.accessToken ||
                response.data?.token;

            if (!accessToken) {
                throw new Error(
                    "No access token returned from refresh."
                );
            }

            localStorage.setItem(
                "token",
                accessToken
            );

            /*
            Now retrieve the authenticated user.
            */

            return await getCurrentUser();
        } catch (error) {
            console.error(
                "Session refresh failed:",
                error.response?.data || error.message
            );

            localStorage.removeItem("token");
            setUser(null);

            return null;
        }
    };

    /*
    =================================================
    LOGOUT
    =================================================
    */

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error(
                "Logout failed:",
                error.response?.data || error.message
            );
        } finally {
            localStorage.removeItem("token");
            setUser(null);
        }
    };

    /*
    =================================================
    LOGOUT ALL SESSIONS
    =================================================
    */

    const logoutAll = async () => {
        try {
            await api.post("/auth/logout-all");
        } catch (error) {
            console.error(
                "Logout all failed:",
                error.response?.data || error.message
            );
        } finally {
            localStorage.removeItem("token");
            setUser(null);
        }
    };

    /*
    =================================================
    AUTH CONTEXT
    =================================================
    */

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: Boolean(user),

                login,
                signup,

                logout,
                logoutAll,

                getCurrentUser,
                refreshSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

/*
=====================================================
USE AUTH
=====================================================
*/

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};

export default AuthProvider;