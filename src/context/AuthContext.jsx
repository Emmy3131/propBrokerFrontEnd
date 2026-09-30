import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import api from "../library/api";

const AuthContext = createContext(null);

/*
=====================================================
AUTH CONFIGURATION
=====================================================
*/

/*
 * Automatically log the user out after 15 minutes
 * without activity.
 *
 * 15 minutes = 15 * 60 * 1000 milliseconds
 */
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

/*
 * How often the activity timer should be checked.
 *
 * We check every 1 second so that the logout happens
 * very close to the configured timeout.
 */
const ACTIVITY_CHECK_INTERVAL = 1000;


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
    INACTIVITY REFERENCES
    =================================================
    */

    /*
     * Stores the timestamp of the user's last activity.
     *
     * useRef is used instead of state because changing
     * this value should NOT cause React to rerender.
     */
    const lastActivityRef = useRef(Date.now());

    /*
     * Stores the interval that checks for inactivity.
     */
    const inactivityIntervalRef = useRef(null);

    /*
     * Prevents multiple logout requests from being
     * triggered at the same time.
     */
    const isLoggingOutRef = useRef(false);

    /*
     * Prevents activity events from creating unnecessary
     * work immediately after the user becomes inactive.
     */
    const activityThrottleRef = useRef(false);


    /*
    =================================================
    UPDATE LAST ACTIVITY
    =================================================
    */

    const updateActivity = useCallback(() => {
        /*
         * Only track activity while the user is
         * authenticated.
         */
        if (!user) {
            return;
        }

        /*
         * Avoid writing to the ref thousands of times
         * during mouse movement.
         */
        if (activityThrottleRef.current) {
            return;
        }

        activityThrottleRef.current = true;

        lastActivityRef.current = Date.now();

        /*
         * Allow another activity update shortly after.
         */
        window.setTimeout(() => {
            activityThrottleRef.current = false;
        }, 1000);
    }, [user]);


    /*
    =================================================
    STOP INACTIVITY TIMER
    =================================================
    */

    const stopInactivityTimer = useCallback(() => {
        if (inactivityIntervalRef.current) {
            window.clearInterval(
                inactivityIntervalRef.current
            );

            inactivityIntervalRef.current = null;
        }
    }, []);


    /*
    =================================================
    LOGOUT
    =================================================
    */

    const logout = useCallback(async () => {
        /*
        ==============================================
        PREVENT MULTIPLE LOGOUT REQUESTS
        ==============================================
        */

        if (isLoggingOutRef.current) {
            return;
        }

        isLoggingOutRef.current = true;

        /*
        ==============================================
        STOP INACTIVITY TIMER
        ==============================================
        */

        stopInactivityTimer();

        try {
            /*
            ==========================================
            TELL BACKEND TO LOGOUT
            ==========================================
            */

            await api.post("/auth/logout");

        } catch (error) {
            console.error(
                "Logout failed:",
                error.response?.data ||
                error.message
            );

        } finally {
            /*
            ==========================================
            CLEAR LOCAL AUTHENTICATION
            ==========================================
            */

            localStorage.removeItem("token");

            localStorage.removeItem("csrfToken");

            /*
            ==========================================
            CLEAR REACT AUTH STATE
            ==========================================
            */

            setUser(null);

            /*
            ==========================================
            RESET ACTIVITY TIMER
            ==========================================
            */

            lastActivityRef.current = Date.now();

            isLoggingOutRef.current = false;

            /*
            ==========================================
            REDIRECT TO LOGIN
            ==========================================
            */

            window.location.replace("/login");
        }
    }, [stopInactivityTimer]);

    /*
    =================================================
    GET CURRENT USER
    =================================================
    */

    const getCurrentUser = useCallback(async () => {
        const token = localStorage.getItem("token");

        /*
        ==============================================
        NO ACCESS TOKEN
        ==============================================
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

            /*
             * Update React authentication state.
             */
            setUser(currentUser);

            /*
             * Treat successful authentication as
             * recent activity.
             */
            lastActivityRef.current = Date.now();

            return currentUser;

        } catch (error) {
            console.error(
                "Failed to get current user:",
                error.response?.data ||
                error.message
            );

            /*
            ==========================================
            ACCESS TOKEN INVALID / EXPIRED
            ==========================================
            */

            localStorage.removeItem("token");

            localStorage.removeItem("csrfToken");

            setUser(null);

            /*
            ==========================================
            REDIRECT TO LOGIN
            ==========================================
            */

            window.location.replace("/login");

            return null;
        }
    }, []);


    /*
    =================================================
    COMPLETE LOGIN
    =================================================

    Used by:

    - Normal login
    - 2FA login
    - Session refresh
    */

    const completeLogin = useCallback(async (authData) => {
        const accessToken =
            authData?.accessToken ||
            authData?.token;

        if (!accessToken) {
            throw new Error(
                "No access token returned."
            );
        }

        /*
        ==============================================
        SAVE ACCESS TOKEN
        ==============================================
        */

        localStorage.setItem(
            "token",
            accessToken
        );


        /*
        ==============================================
        SAVE CSRF TOKEN
        ==============================================
        */

        const csrfToken =
            authData?.csrfToken;

        if (csrfToken) {
            localStorage.setItem(
                "csrfToken",
                csrfToken
            );
        }


        /*
        ==============================================
        GET USER FROM LOGIN RESPONSE
        ==============================================
        */

        let loggedInUser =
            authData?.data?.user ||
            authData?.user ||
            null;


        /*
        ==============================================
        IF USER WAS NOT INCLUDED
        FETCH /auth/me
        ==============================================
        */

        if (!loggedInUser) {
            loggedInUser = await getCurrentUser();
        }


        /*
        ==============================================
        MAKE SURE USER EXISTS
        ==============================================
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
        ==============================================
        UPDATE REACT AUTH STATE IMMEDIATELY
        ==============================================
        */

        setUser(loggedInUser);


        /*
        ==============================================
        RESET INACTIVITY TIMER
        ==============================================
        */

        lastActivityRef.current = Date.now();

        console.log(
            "AUTH USER SET:",
            loggedInUser
        );

        return loggedInUser;

    }, [getCurrentUser]);


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
                ======================================
                NO ACCESS TOKEN
                ======================================
                */

                if (!token) {
                    setUser(null);

                    return;
                }

                /*
                ======================================
                RESTORE AUTHENTICATED USER
                ======================================
                */

                await getCurrentUser();

            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

    }, [getCurrentUser]);


    /*
    =================================================
    INACTIVITY AUTO-LOGOUT
    =================================================

    This effect starts ONLY when the user is logged in.
    */

    useEffect(() => {
        /*
         * If there is no authenticated user,
         * there is nothing to monitor.
         */
        if (!user) {
            stopInactivityTimer();

            return;
        }


        /*
        ==============================================
        RESET ACTIVITY
        ==============================================
        */

        lastActivityRef.current = Date.now();


        /*
        ==============================================
        USER ACTIVITY EVENTS
        ==============================================
        */

        const activityEvents = [
            "mousemove",
            "mousedown",
            "keydown",
            "scroll",
            "touchstart",
            "click",
        ];


        /*
        ==============================================
        ADD ACTIVITY LISTENERS
        ==============================================
        */

        activityEvents.forEach((eventName) => {
            window.addEventListener(
                eventName,
                updateActivity,
                {
                    passive: true,
                }
            );
        });


        /*
        ==============================================
        CHECK INACTIVITY
        ==============================================
        */

        inactivityIntervalRef.current =
            window.setInterval(async () => {
                /*
                 * Don't do anything if the user has
                 * already logged out.
                 */
                if (!user) {
                    return;
                }

                /*
                 * Don't start another logout while
                 * one is already running.
                 */
                if (isLoggingOutRef.current) {
                    return;
                }

                const now = Date.now();

                const inactiveTime =
                    now -
                    lastActivityRef.current;


                /*
                =========================================
                USER HAS BEEN INACTIVE TOO LONG
                =========================================
                */

                if (
                    inactiveTime >=
                    INACTIVITY_TIMEOUT
                ) {
                    console.log(
                        "User inactive for 15 minutes. Logging out..."
                    );

                    await logout();
                }

            }, ACTIVITY_CHECK_INTERVAL);


        /*
        ==============================================
        CLEANUP
        ==============================================
        */

        return () => {
            activityEvents.forEach((eventName) => {
                window.removeEventListener(
                    eventName,
                    updateActivity
                );
            });

            stopInactivityTimer();
        };

    }, [
        user,
        updateActivity,
        logout,
        stopInactivityTimer,
    ]);


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
            ==========================================
            2FA REQUIRED
            ==========================================
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
            ==========================================
            NORMAL LOGIN
            ==========================================
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
            * completeLogin updates:
            * - token
            * - csrfToken
            * - user
            * - inactivity timer
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
             * Signup only creates the account.
             *
             * It does NOT automatically authenticate
             * the user.
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
             * The browser sends the HTTP-only refresh
             * token cookie automatically because api.js
             * uses withCredentials: true.
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
             * Store the new access token and restore
             * the authenticated user.
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

            localStorage.removeItem("csrfToken");

            setUser(null);

            /*
            ==========================================
            REDIRECT TO LOGIN
            ==========================================
            */

            window.location.replace("/login");

            return null;
        }
    };


    /*
    =================================================
    LOGOUT ALL SESSIONS
    =================================================
    */

    const logoutAll = async () => {
        /*
         * Stop inactivity monitoring immediately.
         */
        stopInactivityTimer();

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

            lastActivityRef.current = Date.now();
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
                ========================================
                USER STATE
                ========================================
                */

                user,

                /*
                ========================================
                LOADING STATE
                ========================================
                */

                loading,

                /*
                ========================================
                AUTHENTICATED STATE
                ========================================
                */

                isAuthenticated:
                    Boolean(user),

                /*
                ========================================
                AUTHENTICATION METHODS
                ========================================
                */

                login,

                completeLogin,

                signup,

                logout,

                logoutAll,

                /*
                ========================================
                SESSION METHODS
                ========================================
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