import { useState } from "react";
import api from "../../library/api";

const ForgotPassword = () => {
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
            /*
            =====================================================
            SEND FORGOT PASSWORD REQUEST
            =====================================================
            */

            const response = await api.post(
                "/auth/forgot-password",
                {
                    email: email.trim(),
                }
            );

            console.log(
                "FORGOT PASSWORD RESPONSE:",
                response.data
            );

            /*
            =====================================================
            SUCCESS MESSAGE
            =====================================================
            */

            setMessage(
                response.data?.message ||
                "If the account exists, a password reset email has been sent."
            );

        } catch (error) {

            console.error(
                "FORGOT PASSWORD ERROR:",
                error.response?.data ||
                error.message
            );

            setError(
                error.response?.data?.message ||
                "Unable to process request."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-6">

            <div className="w-full max-w-md">

                {/* =====================================================
                    TITLE
                ===================================================== */}

                <h1 className="text-3xl font-bold text-white">
                    Forgot Password?
                </h1>

                <p className="mt-3 text-slate-400">
                    Enter your email and we'll send you a
                    password reset link.
                </p>

                {/* =====================================================
                    SUCCESS MESSAGE
                ===================================================== */}

                {message && (
                    <div className="mt-5 rounded-lg bg-emerald-500/10 p-4 text-emerald-400">
                        {message}
                    </div>
                )}

                {/* =====================================================
                    ERROR MESSAGE
                ===================================================== */}

                {error && (
                    <div className="mt-5 rounded-lg bg-red-500/10 p-4 text-red-400">
                        {error}
                    </div>
                )}

                {/* =====================================================
                    FORM
                ===================================================== */}

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-5"
                >

                    {/* EMAIL */}

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-slate-300"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                            autoComplete="email"
                            placeholder="you@example.com"
                            className="
                                w-full
                                rounded-lg
                                border border-white/10
                                bg-white/5
                                px-4 py-3
                                text-white
                                outline-none
                                transition
                                placeholder:text-slate-500
                                focus:border-cyan-400
                                focus:ring-1
                                focus:ring-cyan-400
                            "
                        />
                    </div>

                    {/* SUBMIT */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full
                            rounded-lg
                            bg-cyan-500
                            px-4 py-3
                            font-semibold
                            text-slate-950
                            transition
                            hover:bg-cyan-400
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        {loading
                            ? "Sending..."
                            : "Send Reset Link"}
                    </button>

                </form>

            </div>
        </div>
    );
};

export default ForgotPassword;