import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import api from "../../library/api";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!token) {
            setError("Invalid or missing password reset token.");
            return;
        }

        if (!password || !passwordConfirm) {
            setError("Please enter and confirm your new password.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (password !== passwordConfirm) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.patch(
                `/auth/reset-password/${token}`,
                {
                    password,
                    passwordConfirm,
                }
            );

            setSuccess(
                response?.data?.message ||
                "Your password has been reset successfully."
            );

            setPassword("");
            setPasswordConfirm("");

            // Give the user a moment to see the success message.
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2500);
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Unable to reset your password. The link may have expired.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-4">
                        <FaLock className="text-brand-400 text-xl" />
                    </div>

                    <h1 className="text-2xl font-bold text-white">
                        Reset Your Password
                    </h1>

                    <p className="text-surface-400 mt-2">
                        Create a new secure password for your account.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 sm:p-8 shadow-xl">
                    {success ? (
                        <div className="text-center py-6">
                            <div className="flex justify-center mb-4">
                                <div className="w-14 h-14 rounded-full bg-success-500/10 flex items-center justify-center">
                                    <FaCheckCircle className="text-success-400 text-3xl" />
                                </div>
                            </div>

                            <h2 className="text-xl font-semibold text-white">
                                Password Reset Successful
                            </h2>

                            <p className="text-surface-400 mt-3">
                                {success}
                            </p>

                            <p className="text-sm text-surface-500 mt-4">
                                Redirecting you to the login page...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Error */}
                            {error && (
                                <div className="rounded-lg border border-danger-500/20 bg-danger-500/10 px-4 py-3">
                                    <p className="text-sm text-danger-400">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-2">
                                    New Password
                                </label>

                                <div className="relative">
                                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        autoComplete="new-password"
                                        className="w-full rounded-lg border border-surface-700 bg-surface-800 text-white pl-10 pr-11 py-3 outline-none focus:border-brand-500"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((previous) => !previous)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-2">
                                    Confirm New Password
                                </label>

                                <div className="relative">
                                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />

                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={passwordConfirm}
                                        onChange={(e) =>
                                            setPasswordConfirm(e.target.value)
                                        }
                                        placeholder="Confirm new password"
                                        autoComplete="new-password"
                                        className="w-full rounded-lg border border-surface-700 bg-surface-800 text-white pl-10 pr-11 py-3 outline-none focus:border-brand-500"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                (previous) => !previous
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Password requirements */}
                            <div className="rounded-lg bg-surface-800/70 border border-surface-700 p-4">
                                <p className="text-xs font-medium text-surface-300 mb-2">
                                    Password requirements
                                </p>

                                <ul className="text-xs text-surface-500 space-y-1">
                                    <li>• At least 8 characters</li>
                                    <li>• Use a combination of letters and numbers</li>
                                    <li>• Avoid using easily guessed passwords</li>
                                </ul>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 transition"
                            >
                                {loading ? "Resetting Password..." : "Reset Password"}
                            </button>

                            {/* Back to login */}
                            <div className="text-center pt-2">
                                <Link
                                    to="/login"
                                    className="text-sm text-brand-400 hover:text-brand-300"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;