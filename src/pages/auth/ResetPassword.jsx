import { useState } from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import api from "../../library/api";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] =
        useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (password !== passwordConfirm) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await api(
                `/auth/reset-password/${token}`,
                {
                    method: "PATCH",
                    body: {
                        password,
                        passwordConfirm,
                    },
                }
            );

            setSuccess(
                response?.message ||
                "Password reset successfully."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (error) {
            setError(
                error?.message ||
                "Unable to reset password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-md">

                <h1 className="text-3xl font-bold text-white">
                    Reset Password
                </h1>

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
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                        minLength={8}
                        placeholder="New password"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    />

                    <input
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) =>
                            setPasswordConfirm(e.target.value)
                        }
                        required
                        minLength={8}
                        placeholder="Confirm new password"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    />

                    <button
                        disabled={loading}
                        className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950"
                    >
                        {loading
                            ? "Resetting..."
                            : "Reset Password"}
                    </button>
                </form>

                <Link
                    to="/login"
                    className="mt-6 block text-center text-cyan-400"
                >
                    Back to Login
                </Link>

            </div>
        </div>
    );
};

export default ResetPassword;