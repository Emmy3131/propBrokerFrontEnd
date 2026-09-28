import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaShieldHalved,
    FaQrcode,
    FaKey,
     FaCircleCheck,
    FaTriangleExclamation,
    FaSpinner,
    FaCopy,
} from "react-icons/fa6";

import api from "../library/api";

const SetupTwoFactor = () => {
    const navigate = useNavigate();

    const [setupData, setSetupData] = useState(null);
    const [verificationCode, setVerificationCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [backupCodes, setBackupCodes] = useState([]);

    /*
    =====================================================
    START SETUP
    =====================================================
    */

    const handleStartSetup = async () => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const response = await api.post("/auth/2fa/setup");

            const data = response.data?.data;

            if (!data?.qrCode || !data?.manualSecret) {
                throw new Error(
                    "The server did not return the required 2FA setup information."
                );
            }

            setSetupData(data);

            setSuccess(
                "Your authenticator setup has been created. Scan the QR code with your authenticator app."
            );
        } catch (err) {
            console.error("2FA setup error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to start two-factor authentication setup."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
    =====================================================
    VERIFY SETUP
    =====================================================
    */

    const handleVerifySetup = async (event) => {
        event.preventDefault();

        if (!/^\d{6}$/.test(verificationCode)) {
            setError("Please enter the 6-digit code from your authenticator app.");
            return;
        }

        try {
            setVerifying(true);
            setError("");
            setSuccess("");

            const response = await api.post("/auth/2fa/verify-setup", {
                token: verificationCode,
            });

            const data = response.data?.data;

            setBackupCodes(data?.backupCodes || []);

            setSuccess(
                response.data?.message ||
                "Two-factor authentication has been enabled successfully."
            );

            setVerificationCode("");
        } catch (err) {
            console.error("2FA verification error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to verify your authenticator code."
            );
        } finally {
            setVerifying(false);
        }
    };

    /*
    =====================================================
    COPY BACKUP CODES
    =====================================================
    */

    const handleCopyBackupCodes = async () => {
        if (!backupCodes.length) return;

        try {
            await navigator.clipboard.writeText(backupCodes.join("\n"));

            setSuccess("Backup codes copied to your clipboard.");
        } catch (err) {
            console.error("Copy backup codes error:", err);

            setError(
                "Unable to copy the backup codes. Please copy them manually."
            );
        }
    };

    /*
    =====================================================
    CANCEL
    =====================================================
    */

    const handleCancel = () => {
        navigate("/profile/two-factor-authentication");
    };

    /*
    =====================================================
    PAGE
    =====================================================
    */

    return (
        <div className="min-h-screen bg-surface-950 text-white px-4 py-8">
            <div className="max-w-3xl mx-auto">

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

                        <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                            <FaShieldHalved className="text-brand-400 text-xl" />
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">
                                Set Up Two-Factor Authentication
                            </h1>

                            <p className="text-surface-400 mt-1">
                                Secure your account with an authenticator application.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-danger-500/20 bg-danger-500/10 p-4 text-danger-300">
                        <FaTriangleExclamation className="mt-0.5 shrink-0" />

                        <p className="text-sm">
                            {error}
                        </p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-success-500/20 bg-success-500/10 p-4 text-success-300">
                        <FaCheckCircle className="mt-0.5 shrink-0" />

                        <p className="text-sm">
                            {success}
                        </p>
                    </div>
                )}

                {/* =================================================
            BACKUP CODES
        ================================================= */}

                {backupCodes.length > 0 ? (
                    <div className="bg-surface-900 border border-success-500/20 rounded-2xl overflow-hidden">

                        <div className="p-6 sm:p-8">

                            <div className="flex items-start gap-4 mb-6">

                                <div className="w-12 h-12 rounded-xl bg-success-500/10 flex items-center justify-center shrink-0">
                                    <FaCheckCircle className="text-success-400 text-xl" />
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold">
                                        Two-Factor Authentication Enabled
                                    </h2>

                                    <p className="text-sm text-surface-400 mt-2 leading-6">
                                        Your account is now protected with two-factor
                                        authentication.
                                    </p>
                                </div>

                            </div>

                            {/* Warning */}
                            <div className="mb-6 rounded-xl border border-warning-500/20 bg-warning-500/10 p-4">
                                <p className="text-sm text-warning-300 leading-6">
                                    These backup codes are shown only once. Store them
                                    somewhere safe. Each code can only be used once.
                                </p>
                            </div>

                            {/* Codes */}
                            <div className="bg-surface-950 border border-surface-700 rounded-xl p-5">

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {backupCodes.map((code, index) => (
                                        <div
                                            key={`${code}-${index}`}
                                            className="bg-surface-800 border border-surface-700 rounded-lg px-4 py-3 text-center font-mono tracking-wider"
                                        >
                                            {code}
                                        </div>
                                    ))}
                                </div>

                            </div>

                            {/* Copy */}
                            <button
                                type="button"
                                onClick={handleCopyBackupCodes}
                                className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-surface-700 hover:bg-surface-800 transition"
                            >
                                <FaCopy />
                                Copy Backup Codes
                            </button>

                            {/* Done */}
                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/profile/two-factor-authentication")
                                }
                                className="mt-3 sm:ml-3 w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 transition font-medium"
                            >
                                Done
                            </button>

                        </div>
                    </div>
                ) : (
                    <>
                        {/* =================================================
                STEP 1
            ================================================= */}

                        <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 sm:p-8 mb-6">

                            <div className="flex items-start gap-4">

                                <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                                    <FaQrcode className="text-brand-400" />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Step 1 — Connect your authenticator
                                    </h2>

                                    <p className="text-sm text-surface-400 mt-2 leading-6">
                                        Use an authenticator application such as Google
                                        Authenticator, Microsoft Authenticator, or Authy.
                                    </p>
                                </div>

                            </div>

                            {!setupData && (
                                <button
                                    type="button"
                                    onClick={handleStartSetup}
                                    disabled={loading}
                                    className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Generating Setup...
                                        </>
                                    ) : (
                                        <>
                                            <FaShieldHalved />
                                            Generate QR Code
                                        </>
                                    )}
                                </button>
                            )}

                            {setupData && (
                                <div className="mt-8">

                                    {/* QR */}
                                    <div className="flex justify-center">

                                        <div className="bg-white p-4 rounded-xl">
                                            <img
                                                src={setupData.qrCode}
                                                alt="Two-factor authentication QR code"
                                                className="w-56 h-56"
                                            />
                                        </div>

                                    </div>

                                    {/* Manual Secret */}
                                    <div className="mt-8">

                                        <div className="flex items-center gap-2 mb-2">
                                            <FaKey className="text-brand-400" />

                                            <label className="text-sm font-medium text-surface-300">
                                                Manual setup key
                                            </label>
                                        </div>

                                        <div className="bg-surface-950 border border-surface-700 rounded-xl p-4 break-all font-mono text-sm text-surface-200">
                                            {setupData.manualSecret}
                                        </div>

                                        <p className="text-xs text-surface-500 mt-2">
                                            Use this key if your authenticator application cannot
                                            scan the QR code.
                                        </p>

                                    </div>

                                </div>
                            )}

                        </div>

                        {/* =================================================
                STEP 2
            ================================================= */}

                        {setupData && (
                            <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 sm:p-8">

                                <div className="flex items-start gap-4 mb-6">

                                    <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                                        <FaKey className="text-brand-400" />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Step 2 — Verify your authenticator
                                        </h2>

                                        <p className="text-sm text-surface-400 mt-2 leading-6">
                                            Enter the 6-digit code currently displayed in your
                                            authenticator application.
                                        </p>
                                    </div>

                                </div>

                                <form onSubmit={handleVerifySetup}>

                                    <label
                                        htmlFor="verificationCode"
                                        className="block text-sm font-medium text-surface-300 mb-2"
                                    >
                                        Authentication code
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

                                    <div className="flex flex-col sm:flex-row gap-3 mt-5">

                                        <button
                                            type="submit"
                                            disabled={
                                                verifying ||
                                                verificationCode.length !== 6
                                            }
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {verifying ? (
                                                <>
                                                    <FaSpinner className="animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    <FaCheckCircle />
                                                    Verify & Enable 2FA
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            disabled={verifying}
                                            className="px-6 py-3 rounded-xl border border-surface-700 hover:bg-surface-800 transition"
                                        >
                                            Cancel
                                        </button>

                                    </div>

                                </form>

                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};

export default SetupTwoFactor;