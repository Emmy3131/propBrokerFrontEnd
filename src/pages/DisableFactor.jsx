import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaShieldHalved,
    FaLock,
    FaTriangleExclamation,
    FaCheckCircle,
    FaSpinner,
} from "react-icons/fa6";

import api from "../../library/api";

const DisableTwoFactor = () => {
    const navigate = useNavigate();

    const [verificationCode, setVerificationCode] = useState("");

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /*
    =====================================================
    DISABLE 2FA
    =====================================================
    */

    const handleDisable = async (event) => {
        event.preventDefault();

        if (!/^\d{6}$/.test(verificationCode)) {
            setError("Please enter the 6-digit code from your authenticator app.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const response = await api.post("/auth/2fa/disable", {
                token: verificationCode,
            });

            setSuccess(
                response.data?.message ||
                "Two-factor authentication has been disabled successfully."
            );

            setVerificationCode("");

            /*
            Give the user a moment to see the success message
            before returning to the 2FA page.
            */

            setTimeout(() => {
                navigate("/profile/two-factor-authentication");
            }, 1200);
        } catch (err) {
            console.error("Disable 2FA error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to disable two-factor authentication."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-950 text-white px-4 py-8">
            <div className="max-w-2xl mx-auto">

                {/* Back */}
                <Link
                    to="/profile/two-factor-authentication"
                    className="inline-flex items-center gap-2 text-surface-400 hover:text-white transition mb-8"
                >
                    <FaArrowLeft />
                    Back to Two-Factor Authentication
                </Link>

                {/* Header */}
                <div className="mb-8">

                    <div className="flex items-center gap-4">

                        <div className="w-12 h-12 rounded-xl bg-danger-500/10 border border-danger-500/20 flex items-center justify-center">
                            <FaLock className="text-danger-400 text-xl" />
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">
                                Disable Two-Factor Authentication
                            </h1>

                            <p className="text-surface-400 mt-1">
                                Verify your authenticator code to disable 2FA.
                            </p>
                        </div>

                    </div>

                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-danger-500/20 bg-danger-500/10 p-4 text-danger-300">

                        <FaTriangleExclamation className="mt-0.5 shrink-0" />

                        <p className="text-sm">
                            {error}
                        </p>

                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-success-500/20 bg-success-500/10 p-4 text-success-300">

                        <FaCheckCircle className="mt-0.5 shrink-0" />

                        <p className="text-sm">
                            {success}
                        </p>

                    </div>
                )}

                {/* Main Card */}
                <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 sm:p-8">

                    {/* Warning */}
                    <div className="rounded-xl border border-warning-500/20 bg-warning-500/10 p-4 mb-7">

                        <div className="flex items-start gap-3">

                            <FaTriangleExclamation className="text-warning-400 mt-0.5 shrink-0" />

                            <div>
                                <h3 className="font-medium text-warning-300">
                                    Security warning
                                </h3>

                                <p className="text-sm text-warning-400/80 mt-1 leading-6">
                                    Disabling two-factor authentication will remove the
                                    additional verification step from your account. Make sure
                                    you understand the security implications before continuing.
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* Form */}
                    <form onSubmit={handleDisable}>

                        <label
                            htmlFor="verificationCode"
                            className="block text-sm font-medium text-surface-300 mb-2"
                        >
                            Authenticator code
                        </label>

                        <input
                            id="verificationCode"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(event) =>
                                setVerificationCode(
                                    event.target.value.replace(/\D/g, "")
                                )
                            }
                            placeholder="000000"
                            className="w-full bg-surface-950 border border-surface-700 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-brand-500"
                        />

                        <p className="text-xs text-surface-500 mt-2">
                            Enter the current 6-digit code from your authenticator app.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-7">

                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    verificationCode.length !== 6
                                }
                                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-danger-500 hover:bg-danger-600 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Disabling...
                                    </>
                                ) : (
                                    <>
                                        <FaLock />
                                        Disable Two-Factor Authentication
                                    </>
                                )}
                            </button>

                            <Link
                                to="/profile/two-factor-authentication"
                                className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-xl border border-surface-700 hover:bg-surface-800 transition"
                            >
                                Cancel
                            </Link>

                        </div>

                    </form>

                </div>

                {/* Security information */}
                <div className="mt-6 flex items-start gap-3 text-sm text-surface-500">

                    <FaShieldHalved className="text-brand-400 mt-0.5 shrink-0" />

                    <p className="leading-6">
                        You can enable two-factor authentication again at any time from
                        your security settings.
                    </p>

                </div>

            </div>
        </div>
    );
};

export default DisableTwoFactor;