import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../library/api";

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
                No token = no authenticated session.
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
            console.log("LOGIN REQUEST:", credentials);

            const response = await api.post(
                "/auth/login",
                credentials
            );

            console.log(
                "LOGIN RESPONSE:",
                response.data
            );

            /*
            ==========================================
            ACCESS TOKEN
            ==========================================
            */

            const accessToken =
                response.data?.accessToken ||
                response.data?.token;

            if (!accessToken) {
                throw new Error(
                    "Login succeeded but no access token was returned."
                );
            }

            /*
            Store the access token.
            */

            localStorage.setItem(
                "token",
                accessToken
            );

            /*
            ==========================================
            CSRF TOKEN
            ==========================================
            */

            const csrfToken =
                response.data?.csrfToken;

            if (csrfToken) {
                localStorage.setItem(
                    "csrfToken",
                    csrfToken
                );
            }

            /*
            ==========================================
            USER
            ==========================================
            */

            const loggedInUser =
                response.data?.data?.user ||
                response.data?.user ||
                null;

            if (!loggedInUser) {
                /*
                The login succeeded but the backend
                didn't return a user.

                Try /auth/me as a fallback.
                */

                const currentUser =
                    await getCurrentUser();

                if (!currentUser) {
                    throw new Error(
                        "Login succeeded but user information could not be loaded."
                    );
                }

                return currentUser;
            }

            /*
            Store authenticated user in React state.
            */

            setUser(loggedInUser);

            /*
            IMPORTANT:
            login() returns the USER, not the entire
            backend response.

            This allows Login.jsx to simply do:

            const user = await login(form);

            if (user.role === "admin") {
                navigate("/adminDashboard");
            }
            */

            return loggedInUser;

        } catch (error) {
            console.error(
                "LOGIN ERROR:",
                error.response?.data || error.message
            );

            throw new Error(
                error.response?.data?.message ||
                error.message ||
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

            It does NOT automatically authenticate
            the user.
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
            The browser automatically sends the
            HTTP-only refreshToken cookie because
            api.js should use:

            withCredentials: true
            */

            const response = await api.post(
                "/auth/refresh"
            );

            /*
            Get new access token.
            */

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
            The refresh endpoint also returns a
            new CSRF token.
            */

            const csrfToken =
                response.data?.csrfToken;

            if (csrfToken) {
                localStorage.setItem(
                    "csrfToken",
                    csrfToken
                );
            }

            /*
            Load authenticated user.
            */

            return await getCurrentUser();

        } catch (error) {
            console.error(
                "Session refresh failed:",
                error.response?.data || error.message
            );

            localStorage.removeItem("token");
            localStorage.removeItem("csrfToken");

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
            localStorage.removeItem("csrfToken");
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
            localStorage.removeItem("csrfToken");

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