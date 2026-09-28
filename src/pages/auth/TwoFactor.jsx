import { useState } from "react";
import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import api from "../../library/api";

const TwoFactor = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { completeLogin, } = useAuth();

    const challenge =
        location.state?.challenge;

    const email =
        location.state?.email;

    const [code, setCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /*
    =================================================
    VERIFY TWO-FACTOR LOGIN
    =================================================
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        /*
        Make sure the challenge exists.
        */

        if (!challenge) {
            setError(
                "Your login session has expired. Please login again."
            );

            return;
        }

        /*
        Make sure the code is valid.
        */

        if (code.length !== 6) {
            setError(
                "Please enter your 6-digit authentication code."
            );

            return;
        }

        setLoading(true);

        try {
            /*
            ==========================================
            VERIFY 2FA
            ==========================================
            */

            const response = await api.post(
                "/auth/2fa/verify-login",
                {
                    challenge,
                    token: code,
                }
            );

            console.log(
                "2FA LOGIN RESPONSE:",
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
                    "Two-factor authentication succeeded but no access token was returned."
                );
            }

            /*
            Store access token.
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

            const user = await completeLogin(response.data);

            if (!user) {
                throw new Error(
                    "Authentication succeeded but user information was not returned."
                );
            }

            /*
            ==========================================
            REDIRECT
            ==========================================
            */

            if (user.role === "admin") {
                navigate("/adminDashboard", {
                    replace: true,
                });

                return;
            }

            if (user.role === "user") {
                navigate("/user/dashboard", {
                    replace: true,
                });

                return;
            }

            throw new Error(
                "Your account has an invalid or unsupported role."
            );

        } catch (error) {
            console.error(
                "2FA verification error:",
                error.response?.data ||
                error.message
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Invalid authentication code."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
    =================================================
    NO CHALLENGE
    =================================================
    */

    if (!challenge) {
        return (
            <div className="flex min-h-screen items-center justify-center px-6">
                <div className="w-full max-w-md text-center">

                    <h1 className="text-2xl font-bold text-white">
                        Login Session Expired
                    </h1>

                    <p className="mt-3 text-slate-400">
                        Your two-factor authentication
                        challenge is missing or has expired.
                    </p>

                    <Link
                        to="/login"
                        className="mt-6 inline-block rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                        Back to Login
                    </Link>

                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-md">

                <div className="mb-8">

                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
                        <span className="text-xl text-cyan-400">
                            🔐
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-white">
                        Two-Factor Authentication
                    </h1>

                    <p className="mt-3 text-slate-400">
                        Enter the 6-digit code from your
                        authenticator app.
                    </p>

                    {email && (
                        <p className="mt-2 text-sm text-slate-500">
                            Signing in as {email}
                        </p>
                    )}

                </div>

                {error && (
                    <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div>
                        <label
                            htmlFor="twoFactorCode"
                            className="mb-2 block text-sm text-slate-300"
                        >
                            Authentication code
                        </label>

                        <input
                            id="twoFactorCode"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={code}
                            onChange={(e) => {
                                setCode(
                                    e.target.value.replace(
                                        /\D/g,
                                        ""
                                    )
                                );
                            }}
                            placeholder="000000"
                            required
                            autoFocus
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl tracking-[0.5em] text-white outline-none transition focus:border-cyan-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            code.length !== 6
                        }
                        className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Verifying..."
                            : "Verify & Sign In"}
                    </button>

                </form>

                <div className="mt-6 text-center">

                    <Link
                        to="/login"
                        className="text-sm text-cyan-400 hover:text-cyan-300"
                    >
                        Back to Login
                    </Link>

                </div>

            </div>
        </div>
    );
};

export default TwoFactor;