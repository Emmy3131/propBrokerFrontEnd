import { useState } from "react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import api from "../../services/api";

const TwoFactor = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [code, setCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await api(
                "/auth/2fa/verify-login",
                {
                    method: "POST",
                    body: {
                        code,
                        email:
                            location.state?.email,
                    },
                }
            );

            if (response?.data) {
                navigate("/dashboard");
            } else {
                navigate("/dashboard");
            }
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
        <div className="flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-md">

                <h1 className="text-3xl font-bold text-white">
                    Two-Factor Authentication
                </h1>

                <p className="mt-3 text-slate-400">
                    Enter the six-digit code from your
                    authenticator app.
                </p>

                {error && (
                    <div className="mt-5 rounded-lg bg-red-500/10 p-4 text-red-400">
                        {error}
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
                                e.target.value
                                    .replace(/\D/g, "")
                            )
                        }
                        placeholder="000000"
                        required
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl tracking-[0.5em] text-white outline-none focus:border-cyan-400"
                    />

                    <button
                        disabled={loading || code.length !== 6}
                        className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"
                    >
                        {loading
                            ? "Verifying..."
                            : "Verify Code"}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default TwoFactor;