import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext();

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
    INIT AUTH
    =================================================
    */

    const initAuth = async () => {
        try {
            /*
            The backend uses the HTTP-only refreshToken
            cookie to identify the current session.
            */

            const response = await api("/auth/me");

            /*
            Possible backend responses:

            {
                status: "success",
                data: {
                    user: {...}
                }
            }

            OR

            {
                status: "success",
                data: {...}
            }

            OR

            {
                user: {...}
            }
            */

            if (response?.data?.user) {
                setUser(response.data.user);
            } else if (response?.data) {
                setUser(response.data);
            } else if (response?.user) {
                setUser(response.user);
            } else {
                setUser(null);
            }

        } catch (error) {
            console.log("Auth initialization failed:", error);

            setUser(null);

        } finally {
            setLoading(false);
        }
    };

    /*
    =================================================
    RUN AUTH CHECK WHEN APPLICATION STARTS
    =================================================
    */

    useEffect(() => {
        initAuth();
    }, []);

    /*
    =================================================
    LOGIN
    =================================================
    */

    const login = async (credentials) => {
        try {
            const response = await api(
                "/auth/login",
                {
                    method: "POST",
                    data: credentials,
                }
            );

            /*
            Backend may return:

            {
                status: "success",
                accessToken: "...",
                data: {
                    user: {...}
                }
            }
            */

            if (response?.data?.user) {
                setUser(response.data.user);
            } else if (response?.data) {
                setUser(response.data);
            } else if (response?.user) {
                setUser(response.user);
            }

            return response;

        } catch (error) {
            throw error;
        }
    };

    /*
    =================================================
    SIGNUP
    =================================================
    */

    const signup = async (userData) => {
        try {
            const response = await api(
                "/auth/signup",
                {
                    method: "POST",
                    data: userData,
                }
            );

            return response;

        } catch (error) {
            throw error;
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
            Browser automatically sends the
            HTTP-only refreshToken cookie.
            */

            await api(
                "/auth/refresh",
                {
                    method: "POST",
                }
            );

            /*
            Get the newly authenticated user.
            */

            return await initAuth();

        } catch (error) {
            console.log("Session refresh failed:", error);

            setUser(null);

            return null;
        }
    };

    /*
    =================================================
    GET CURRENT USER
    =================================================
    */

    const getCurrentUser = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setUser(null);
            setLoading(false);
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

            localStorage.removeItem("token");
            setUser(null);

            return null;
        } finally {
            setLoading(false);
        }
    };

    /*
    =================================================
    LOGOUT
    =================================================
    */

    const logout = async () => {
        try {
            await api(
                "/auth/logout",
                {
                    method: "POST",
                }
            );

        } finally {
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
            await api(
                "/auth/logout-all",
                {
                    method: "POST",
                }
            );

        } finally {
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

export const useAuth = () => useContext(AuthContext);

/*
=====================================================
DEFAULT EXPORT
=====================================================
*/

export default AuthProvider;