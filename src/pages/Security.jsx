import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    FaArrowLeft,
    FaArrowRight,
    FaCheck,
    FaCircleInfo,
    FaClock,
    FaDesktop,
    FaKey,
    FaLock,
    FaMobileScreenButton,
    FaRotate,
    FaShieldHalved,
    FaTriangleExclamation,
    FaXmark,
} from "react-icons/fa6";

import api from "../library/api";
import { useAuth } from "../context/AuthContext";


/*
=====================================================
HELPERS
=====================================================
*/

const formatDate = (date) => {
    if (!date) {
        return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    return parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};


const formatDateTime = (date) => {
    if (!date) {
        return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    return parsedDate.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};


const getRelativeTime = (date) => {
    if (!date) {
        return "Never";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Unknown";
    }

    const difference =
        Date.now() - parsedDate.getTime();

    const seconds = Math.floor(
        difference / 1000
    );

    if (seconds < 60) {
        return "Just now";
    }

    const minutes = Math.floor(
        seconds / 60
    );

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(
        minutes / 60
    );

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(
        hours / 24
    );

    if (days < 30) {
        return `${days}d ago`;
    }

    return formatDate(date);
};


const getDeviceIcon = (userAgent = "") => {
    const value = userAgent.toLowerCase();

    if (
        value.includes("mobile") ||
        value.includes("android") ||
        value.includes("iphone") ||
        value.includes("ipad")
    ) {
        return (
            <FaMobileScreenButton />
        );
    }

    return <FaDesktop />;
};


const getDeviceName = (userAgent = "") => {
    if (!userAgent) {
        return "Unknown device";
    }

    const value = userAgent.toLowerCase();

    let browser = "Browser";

    if (value.includes("edg")) {
        browser = "Microsoft Edge";
    } else if (value.includes("chrome")) {
        browser = "Google Chrome";
    } else if (value.includes("firefox")) {
        browser = "Mozilla Firefox";
    } else if (
        value.includes("safari") &&
        !value.includes("chrome")
    ) {
        browser = "Safari";
    } else if (value.includes("opera")) {
        browser = "Opera";
    }

    let operatingSystem = "";

    if (value.includes("windows")) {
        operatingSystem = "Windows";
    } else if (value.includes("mac os")) {
        operatingSystem = "macOS";
    } else if (value.includes("android")) {
        operatingSystem = "Android";
    } else if (
        value.includes("iphone") ||
        value.includes("ipad")
    ) {
        operatingSystem = "iOS";
    } else if (value.includes("linux")) {
        operatingSystem = "Linux";
    }

    return operatingSystem
        ? `${browser} on ${operatingSystem}`
        : browser;
};


/*
=====================================================
PAGE
=====================================================
*/

const Security = () => {
    /*
    IMPORTANT:
    This hook MUST remain inside the component.
    */

    const navigate = useNavigate();

    const {
        user,
        logoutAll,
    } = useAuth();


    /*
    ===================================================
    STATE
    ===================================================
    */

    const [sessions, setSessions] =
        useState([]);

    const [loadingSessions, setLoadingSessions] =
        useState(true);

    const [revokingSession, setRevokingSession] =
        useState(null);

    const [loggingOutAll, setLoggingOutAll] =
        useState(false);

    const [pageLoading, setPageLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    const [twoFactorEnabled, setTwoFactorEnabled] =
        useState(false);


    /*
    ===================================================
    CLEAR MESSAGES
    ===================================================
    */

    const clearMessages = () => {
        setError("");
        setSuccessMessage("");
    };


    /*
    ===================================================
    GET 2FA STATUS
    ===================================================
    */

    const loadSecurityStatus = useCallback(async () => {
        try {
            setPageLoading(true);

            /*
             * We already have the authenticated user
             * from AuthContext.
             *
             * If your backend returns twoFactorEnabled
             * from /auth/me, this will be used directly.
             */

            if (user) {
                setTwoFactorEnabled(
                    Boolean(user.twoFactorEnabled)
                );
            }

            /*
             * Refresh the current user from the backend
             * where possible.
             */

            try {
                const response =
                    await api.get("/auth/me");

                const currentUser =
                    response.data?.data?.user ||
                    response.data?.user ||
                    null;

                if (currentUser) {
                    setTwoFactorEnabled(
                        Boolean(
                            currentUser.twoFactorEnabled
                        )
                    );
                }
            } catch (authError) {
                /*
                 * Don't fail the entire security page
                 * simply because /auth/me has a different
                 * response shape or is unavailable.
                 */
                console.warn(
                    "Could not refresh auth security status:",
                    authError
                );
            }
        } finally {
            setPageLoading(false);
        }
    }, [user]);


    /*
    ===================================================
    FETCH ACTIVE SESSIONS
    ===================================================
    */

    const fetchSessions = useCallback(
        async () => {
            try {
                setLoadingSessions(true);

                const response =
                    await api.get(
                        "/auth/sessions"
                    );

                const returnedSessions =
                    response.data?.data?.sessions ||
                    response.data?.sessions ||
                    [];

                setSessions(
                    Array.isArray(returnedSessions)
                        ? returnedSessions
                        : []
                );

            } catch (requestError) {
                console.error(
                    "Failed to load sessions:",
                    requestError
                );

                setError(
                    requestError.response?.data?.message ||
                    "Failed to load your active sessions."
                );
            } finally {
                setLoadingSessions(false);
            }
        },
        []
    );


    /*
    ===================================================
    INITIAL LOAD
    ===================================================
    */

    useEffect(() => {
        loadSecurityStatus();
        fetchSessions();
    }, [
        loadSecurityStatus,
        fetchSessions,
    ]);


    /*
    ===================================================
    REVOKE SESSION
    ===================================================
    */

    const handleRevokeSession = async (
        sessionId
    ) => {
        if (!sessionId) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to revoke this session?"
        );

        if (!confirmed) {
            return;
        }

        try {
            clearMessages();

            setRevokingSession(sessionId);

            await api.delete(
                `/auth/sessions/${sessionId}`
            );

            setSessions((previous) =>
                previous.filter(
                    (session) =>
                        session._id !== sessionId
                )
            );

            setSuccessMessage(
                "The session was revoked successfully."
            );

        } catch (requestError) {
            console.error(
                "Failed to revoke session:",
                requestError
            );

            setError(
                requestError.response?.data?.message ||
                "Failed to revoke the selected session."
            );
        } finally {
            setRevokingSession(null);
        }
    };


    /*
    ===================================================
    LOGOUT ALL SESSIONS
    ===================================================
    */

    const handleLogoutAll = async () => {
        const confirmed = window.confirm(
            "This will sign you out from all active sessions. Continue?"
        );

        if (!confirmed) {
            return;
        }

        try {
            clearMessages();

            setLoggingOutAll(true);

            await logoutAll();

        } catch (requestError) {
            console.error(
                "Failed to logout all sessions:",
                requestError
            );

            setError(
                requestError.response?.data?.message ||
                "Failed to sign out from all sessions."
            );

            setLoggingOutAll(false);
        }
    };


    /*
    ===================================================
    REFRESH
    ===================================================
    */

    const handleRefresh = async () => {
        clearMessages();

        await Promise.all([
            loadSecurityStatus(),
            fetchSessions(),
        ]);

        setSuccessMessage(
            "Security information refreshed."
        );
    };


    /*
    ===================================================
    LOADING
    ===================================================
    */

    if (pageLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">

                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-surface-700 border-t-brand" />

                    <p className="mt-4 text-sm text-gray-400">
                        Loading security settings...
                    </p>

                </div>
            </div>
        );
    }


    /*
    ===================================================
    RENDER
    ===================================================
    */

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6">

            {/* =================================================
          HEADER
      ================================================= */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <div className="mb-3">

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/profile")
                            }
                            className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
                        >
                            <FaArrowLeft />

                            Back to Profile
                        </button>

                    </div>

                    <h1 className="text-2xl font-bold text-white">
                        Security
                    </h1>

                    <p className="mt-1 text-sm text-gray-400">
                        Protect your account and manage
                        your active login sessions.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-surface-800"
                >
                    <FaRotate />

                    Refresh
                </button>

            </div>


            {/* =================================================
          MESSAGES
      ================================================= */}

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">

                    <FaTriangleExclamation className="mt-0.5 shrink-0" />

                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="ml-auto"
                    >
                        <FaXmark />
                    </button>

                </div>
            )}


            {successMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/10 p-4 text-sm text-success">

                    <FaCheck className="mt-0.5 shrink-0" />

                    <span>{successMessage}</span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccessMessage("")
                        }
                        className="ml-auto"
                    >
                        <FaXmark />
                    </button>

                </div>
            )}


            {/* =================================================
          SECURITY OVERVIEW
      ================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                {/* 2FA */}

                <div className="rounded-2xl border border-surface-700 bg-surface-900 p-5">

                    <div className="flex items-center justify-between">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                            <FaShieldHalved />
                        </div>

                        {twoFactorEnabled ? (
                            <span className="rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-medium text-success">
                                Enabled
                            </span>
                        ) : (
                            <span className="rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                                Not Enabled
                            </span>
                        )}

                    </div>

                    <h2 className="mt-5 font-semibold text-white">
                        Two-Factor Authentication
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-400">
                        Add another layer of protection
                        using an authenticator app.
                    </p>

                </div>


                {/* Sessions */}

                <div className="rounded-2xl border border-surface-700 bg-surface-900 p-5">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <FaLock />
                    </div>

                    <h2 className="mt-5 font-semibold text-white">
                        Active Sessions
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-400">
                        Devices currently signed in to
                        your account.
                    </p>

                    <p className="mt-3 text-2xl font-bold text-white">
                        {sessions.length}
                    </p>

                </div>


                {/* Account */}

                <div className="rounded-2xl border border-surface-700 bg-surface-900 p-5">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <FaKey />
                    </div>

                    <h2 className="mt-5 font-semibold text-white">
                        Account Protection
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-400">
                        Your account uses password
                        authentication and secure sessions.
                    </p>

                    <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-success">
                        <FaCheck />

                        Protected
                    </span>

                </div>

            </div>


            {/* =================================================
          TWO FACTOR AUTHENTICATION
      ================================================= */}

            <section className="rounded-2xl border border-surface-700 bg-surface-900 p-5 sm:p-6">

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-xl text-brand">
                            <FaShieldHalved />
                        </div>

                        <div>

                            <h2 className="text-lg font-semibold text-white">
                                Two-Factor Authentication
                            </h2>

                            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-400">
                                Two-factor authentication helps
                                protect your account even if your
                                password is compromised.
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-3">

                                {twoFactorEnabled ? (
                                    <span className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                                        <FaCheck />

                                        2FA is enabled
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2 rounded-full border border-warning/20 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning">
                                        <FaTriangleExclamation />

                                        2FA is not enabled
                                    </span>
                                )}

                            </div>

                        </div>

                    </div>


                    <div className="flex shrink-0 flex-col gap-3 sm:flex-row">

                        {!twoFactorEnabled ? (
                            <Link
                                to="/security/2fa/setup"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                            >
                                Enable 2FA

                                <FaArrowRight className="text-xs" />
                            </Link>
                        ) : (
                            <Link
                                to="/security/2fa/disable"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-5 py-3 text-sm font-semibold text-danger transition hover:bg-danger/20"
                            >
                                Disable 2FA

                                <FaArrowRight className="text-xs" />
                            </Link>
                        )}

                    </div>

                </div>

            </section>


            {/* =================================================
          SECURITY RECOMMENDATION
      ================================================= */}

            {!twoFactorEnabled && (
                <div className="flex flex-col gap-4 rounded-2xl border border-warning/20 bg-warning/5 p-5 sm:flex-row sm:items-center">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
                        <FaTriangleExclamation />
                    </div>

                    <div className="flex-1">

                        <h3 className="font-semibold text-white">
                            Strengthen your account security
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-gray-400">
                            Two-factor authentication adds an
                            additional verification step when
                            accessing your account.
                        </p>

                    </div>

                    <Link
                        to="/security/2fa/setup"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-warning/20 bg-warning/10 px-4 py-2.5 text-sm font-medium text-warning transition hover:bg-warning/20"
                    >
                        Set up 2FA

                        <FaArrowRight className="text-xs" />
                    </Link>

                </div>
            )}


            {/* =================================================
          ACTIVE SESSIONS
      ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-surface-700 bg-surface-900">

                <div className="flex flex-col gap-4 border-b border-surface-700 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                    <div>

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                <FaLock />
                            </div>

                            <div>

                                <h2 className="font-semibold text-white">
                                    Active Sessions
                                </h2>

                                <p className="mt-1 text-xs text-gray-400">
                                    Manage devices currently
                                    signed in to your account.
                                </p>

                            </div>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={fetchSessions}
                        disabled={loadingSessions}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-700 bg-surface-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-surface-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <FaRotate
                            className={
                                loadingSessions
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh Sessions
                    </button>

                </div>


                {/* Sessions loading */}

                {loadingSessions ? (
                    <div className="flex min-h-40 items-center justify-center p-6">

                        <div className="text-center">

                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-surface-700 border-t-brand" />

                            <p className="mt-3 text-sm text-gray-400">
                                Loading sessions...
                            </p>

                        </div>

                    </div>
                ) : sessions.length === 0 ? (

                    /* No sessions */

                    <div className="p-8 text-center">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-800 text-surface-500">
                            <FaDesktop />
                        </div>

                        <h3 className="mt-4 font-semibold text-white">
                            No active sessions found
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
                            There are currently no active
                            sessions available to display.
                        </p>

                    </div>

                ) : (

                    /* Sessions */

                    <div className="divide-y divide-surface-700">

                        {sessions.map((session) => {

                            const sessionId =
                                session._id ||
                                session.id;

                            const deviceName =
                                getDeviceName(
                                    session.userAgent
                                );

                            const isRevoking =
                                revokingSession ===
                                sessionId;

                            return (
                                <div
                                    key={sessionId}
                                    className="p-5 transition hover:bg-surface-950 sm:p-6"
                                >

                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                                        {/* Device */}

                                        <div className="flex min-w-0 items-start gap-4">

                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-800 text-lg text-brand">
                                                {getDeviceIcon(
                                                    session.userAgent
                                                )}
                                            </div>

                                            <div className="min-w-0">

                                                <div className="flex flex-wrap items-center gap-2">

                                                    <h3 className="font-semibold text-white">
                                                        {deviceName}
                                                    </h3>

                                                    {session.revoked ===
                                                        false && (
                                                            <span className="rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
                                                                Active
                                                            </span>
                                                        )}

                                                </div>


                                                <div className="mt-2 space-y-1">

                                                    <p className="text-sm text-gray-400">
                                                        IP Address:{" "}
                                                        <span className="text-gray-300">
                                                            {session.ipAddress ||
                                                                "Unavailable"}
                                                        </span>
                                                    </p>

                                                    <p className="text-sm text-gray-400">
                                                        Last active:{" "}
                                                        <span className="text-gray-300">
                                                            {getRelativeTime(
                                                                session.lastUsedAt ||
                                                                session.createdAt
                                                            )}
                                                        </span>
                                                    </p>

                                                </div>


                                                <div className="mt-3 flex flex-wrap gap-4 text-xs text-surface-500">

                                                    <span className="inline-flex items-center gap-1.5">
                                                        <FaClock />

                                                        Created{" "}
                                                        {formatDateTime(
                                                            session.createdAt
                                                        )}
                                                    </span>

                                                    {session.expiresAt && (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            Expires{" "}
                                                            {formatDateTime(
                                                                session.expiresAt
                                                            )}
                                                        </span>
                                                    )}

                                                </div>

                                            </div>

                                        </div>


                                        {/* Action */}

                                        <button
                                            type="button"
                                            disabled={
                                                isRevoking
                                            }
                                            onClick={() =>
                                                handleRevokeSession(
                                                    sessionId
                                                )
                                            }
                                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/20 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isRevoking ? (
                                                <>
                                                    <FaRotate className="animate-spin" />

                                                    Revoking...
                                                </>
                                            ) : (
                                                <>
                                                    <FaXmark />

                                                    Revoke
                                                </>
                                            )}
                                        </button>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </section>


            {/* =================================================
          LOGOUT ALL
      ================================================= */}

            <section className="rounded-2xl border border-danger/20 bg-danger/5 p-5 sm:p-6">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-start gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
                            <FaLock />
                        </div>

                        <div>

                            <h2 className="font-semibold text-white">
                                Sign Out From All Sessions
                            </h2>

                            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-400">
                                If you believe someone else has
                                access to your account, you can
                                invalidate all active sessions.
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={handleLogoutAll}
                        disabled={loggingOutAll}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-danger px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loggingOutAll ? (
                            <>
                                <FaRotate className="animate-spin" />

                                Signing Out...
                            </>
                        ) : (
                            <>
                                Sign Out Everywhere

                                <FaArrowRight className="text-xs" />
                            </>
                        )}
                    </button>

                </div>

            </section>


            {/* =================================================
          SECURITY INFORMATION
      ================================================= */}

            <section className="rounded-2xl border border-surface-700 bg-surface-900 p-5 sm:p-6">

                <div className="flex items-start gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <FaCircleInfo />
                    </div>

                    <div>

                        <h2 className="font-semibold text-white">
                            Security Tips
                        </h2>

                        <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-400">

                            <li>
                                • Use a strong password that you
                                do not reuse on other websites.
                            </li>

                            <li>
                                • Enable two-factor authentication
                                for additional account protection.
                            </li>

                            <li>
                                • Review your active sessions
                                regularly.
                            </li>

                            <li>
                                • Never share your password,
                                authentication codes or recovery
                                codes with anyone.
                            </li>

                        </ul>

                    </div>

                </div>

            </section>

        </div>
    );
};


export default Security;