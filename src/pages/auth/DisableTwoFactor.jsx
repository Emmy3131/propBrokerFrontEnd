import { useState } from "react";
import api from "../../library/api";

const DisableTwoFactor = () => {
    const [code, setCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await api(
                "/auth/2fa/disable",
                {
                    method: "POST",
                    body: {
                        token: code,
                    },
                }
            );

            setSuccess(
                response?.message ||
                "Two-factor authentication disabled."
            );

            setCode("");
        } catch (error) {
            setError(
                error?.message ||
                "Unable to disable two-factor authentication."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-md">

            <h1 className="text-3xl font-bold text-white">
                Disable 2FA
            </h1>

            <p className="mt-3 text-slate-400">
                Enter your current authenticator code to
                disable two-factor authentication.
            </p>

            {error && (
                <div className="mt-5 rounded-lg bg-red-500/10 p-4 text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-5 rounded-lg bg-emerald-500/10 p-4 text-emerald-400">
                    {success}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
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
                    placeholder="000000"
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-xl tracking-widest text-white outline-none focus:border-cyan-400"
                />

                <button
                    disabled={
                        loading ||
                        code.length !== 6
                    }
                    className="w-full rounded-lg bg-red-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
                >
                    {loading
                        ? "Disabling..."
                        : "Disable 2FA"}
                </button>
            </form>

        </div>
    );
};

export default DisableTwoFactor;