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

            if (!currentUser) {
                throw new Error(
                    "Authenticated user was not returned."
                );
            }

            setUser(currentUser);

            return currentUser;

        } catch (error) {
            console.error(
                "Failed to get current user:",
                error.response?.data ||
                error.message
            );

            /*
            The access token is invalid or expired.
            */

            localStorage.removeItem("token");

            setUser(null);

            return null;
        }
    };

    /*
    =================================================
    COMPLETE LOGIN
    =================================================

    This function is used after successful authentication.

    It is especially important for the 2FA flow because
    the access token is only issued AFTER 2FA verification.
    */

    const completeLogin = async (authData) => {
        const accessToken =
            authData?.accessToken ||
            authData?.token;

        if (!accessToken) {
            throw new Error(
                "No access token returned."
            );
        }

        // Save access token
        localStorage.setItem(
            "token",
            accessToken
        );

        // Save CSRF token
        const csrfToken =
            authData?.csrfToken;

        if (csrfToken) {
            localStorage.setItem(
                "csrfToken",
                csrfToken
            );
        }

        /*
        =====================================================
        GET USER FROM LOGIN RESPONSE
        =====================================================
        */

        let loggedInUser =
            authData?.data?.user ||
            authData?.user ||
            null;

        /*
        =====================================================
        IF USER WAS NOT INCLUDED, FETCH /auth/me
        =====================================================
        */

        if (!loggedInUser) {
            loggedInUser = await getCurrentUser();
        }

        /*
        =====================================================
        MAKE SURE USER EXISTS
        =====================================================
        */

        if (!loggedInUser) {
            localStorage.removeItem("token");
            localStorage.removeItem("csrfToken");

            setUser(null);

            throw new Error(
                "Authentication succeeded but user information could not be loaded."
            );
        }

        /*
        =====================================================
        THIS IS THE IMPORTANT PART
    
        Update React auth state immediately.
        =====================================================
        */

        setUser(loggedInUser);

        console.log(
            "AUTH USER SET:",
            loggedInUser
        );

        return loggedInUser;
    };
    /*
    =================================================
    INITIALIZE AUTH
    =================================================
    */

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token =
                    localStorage.getItem("token");

                /*
                No access token means the user is not
                authenticated.
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

            const data = response.data;

            console.log(
                "LOGIN RESPONSE:",
                data
            );

            /*
            =====================================================
            2FA REQUIRED
            =====================================================
            */

            if (
                data?.requiresTwoFactor === true
            ) {
                const challenge =
                    data?.data?.challenge ||
                    data?.challenge;

                if (!challenge) {
                    throw new Error(
                        "Two-factor authentication is required, but no challenge was returned."
                    );
                }

                return {
                    requiresTwoFactor: true,
                    challenge,
                };
            }

            /*
            =====================================================
            NORMAL LOGIN
            =====================================================
            */

            const accessToken =
                data?.accessToken ||
                data?.token;

            if (!accessToken) {
                throw new Error(
                    "Login succeeded but no access token was returned."
                );
            }

            /*
            IMPORTANT:
            completeLogin updates `user` immediately.
            */

            const loggedInUser =
                await completeLogin(data);

            return {
                requiresTwoFactor: false,
                user: loggedInUser,
            };

        } catch (error) {
            console.error(
                "LOGIN ERROR:",
                error.response?.data ||
                error.message
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
            Signup only creates the account.

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
            The browser sends the HTTP-only refresh
            token cookie automatically because api.js
            should use withCredentials: true.
            */

            const response = await api.post(
                "/auth/refresh"
            );

            console.log(
                "REFRESH RESPONSE:",
                response.data
            );

            const accessToken =
                response.data?.accessToken ||
                response.data?.token;

            if (!accessToken) {
                throw new Error(
                    "No access token returned from refresh."
                );
            }

            /*
            Store the new access token and restore
            the authenticated user.
            */

            const currentUser =
                await completeLogin(
                    response.data
                );

            return currentUser;

        } catch (error) {
            console.error(
                "Session refresh failed:",
                error.response?.data ||
                error.message
            );

            localStorage.removeItem("token");

            localStorage.removeItem(
                "csrfToken"
            );

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
            await api.post(
                "/auth/logout"
            );

        } catch (error) {
            console.error(
                "Logout failed:",
                error.response?.data ||
                error.message
            );

        } finally {
            /*
            Always clear the local authentication
            state even if the backend request fails.
            */

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "csrfToken"
            );

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
            await api.post(
                "/auth/logout-all"
            );

        } catch (error) {
            console.error(
                "Logout all failed:",
                error.response?.data ||
                error.message
            );

        } finally {
            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "csrfToken"
            );

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
                /*
                User state
                */

                user,

                /*
                Initial authentication loading state
                */

                loading,

                /*
                Authenticated only after a user has
                actually been loaded.
                */

                isAuthenticated:
                    Boolean(user),

                /*
                Authentication methods
                */

                login,
                completeLogin,

                signup,

                logout,
                logoutAll,

                /*
                Session methods
                */

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
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};

export default AuthProvider;