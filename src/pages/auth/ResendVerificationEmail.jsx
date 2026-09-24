import { useState } from "react";
import api from "../../library/api";

const ResendVerification = () => {
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await api(
                "/auth/resend-verification",
                {
                    method: "POST",
                    body: { email },
                }
            );

            setMessage(
                response?.message ||
                "Verification email sent."
            );
        } catch (error) {
            setError(
                error?.message ||
                "Unable to send verification email."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-md">

                <h1 className="text-3xl font-bold text-white">
                    Resend Verification
                </h1>

                <p className="mt-3 text-slate-400">
                    Enter your email to receive another
                    verification link.
                </p>

                {message && (
                    <div className="mt-5 rounded-lg bg-emerald-500/10 p-4 text-emerald-400">
                        {message}
                    </div>
                )}

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
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    />

                    <button
                        disabled={loading}
                        className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950"
                    >
                        {loading
                            ? "Sending..."
                            : "Resend Email"}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default ResendVerification;