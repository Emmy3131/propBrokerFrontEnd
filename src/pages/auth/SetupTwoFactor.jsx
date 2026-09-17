import { useState } from "react";

import api from "../../services/api";

const SetupTwoFactor = () => {
    const [setupData, setSetupData] = useState(null);
    const [code, setCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [setupLoading, setSetupLoading] =
        useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const startSetup = async () => {
        setSetupLoading(true);
        setError("");

        try {
            const response = await api(
                "/auth/2fa/setup",
                {
                    method: "POST",
                }
            );

            setSetupData(
                response?.data || response
            );
        } catch (error) {
            setError(
                error?.message ||
                "Unable to start 2FA setup."
            );
        } finally {
            setSetupLoading(false);
        }
    };

    const verifySetup = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await api(
                "/auth/2fa/verify-setup",
                {
                    method: "POST",
                    body: {
                        token: code,
                    },
                }
            );

            setSuccess(
                response?.message ||
                "Two-factor authentication enabled."
            );
        } catch (error) {
            setError(
                error?.message ||
                "Invalid authentication code."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl">

            <h1 className="text-3xl font-bold text-white">
                Set Up Two-Factor Authentication
            </h1>

            <p className="mt-3 text-slate-400">
                Protect your account with an authenticator
                application.
            </p>

            {!setupData && (
                <button
                    onClick={startSetup}
                    disabled={setupLoading}
                    className="mt-8 rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950"
                >
                    {setupLoading
                        ? "Preparing..."
                        : "Set Up 2FA"}
                </button>
            )}

            {setupData && (
                <div className="mt-8 space-y-6">

                    {setupData.qrCode && (
                        <img
                            src={setupData.qrCode}
                            alt="2FA QR Code"
                            className="h-64 w-64 rounded-lg bg-white p-4"
                        />
                    )}

                    {setupData.otpauthUrl && (
                        <div>
                            <p className="text-sm text-slate-400">
                                Manual setup key
                            </p>

                            <p className="mt-2 break-all rounded-lg bg-white/5 p-4 text-sm text-white">
                                {setupData.otpauthUrl}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-lg bg-red-500/10 p-4 text-red-400">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="rounded-lg bg-emerald-500/10 p-4 text-emerald-400">
                            {success}
                        </div>
                    )}

                    <form
                        onSubmit={verifySetup}
                        className="space-y-5"
                    >
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={code}
                            onChange={(e) =>
                                setCode(
                                    e.target.value.replace(
                                        /\D/g,
                                        ""
                                    )
                                )
                            }
                            placeholder="Enter 6-digit code"
                            required
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
                        />

                        <button
                            disabled={
                                loading ||
                                code.length !== 6
                            }
                            className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 disabled:opacity-50"
                        >
                            {loading
                                ? "Verifying..."
                                : "Enable 2FA"}
                        </button>
                    </form>

                </div>
            )}

        </div>
    );
};

export default SetupTwoFactor;