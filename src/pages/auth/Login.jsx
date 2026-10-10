import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await login(form);

            console.log("LOGIN RESULT:", response);

            // Two-factor authentication
            if (response?.requiresTwoFactor) {
                if (!response?.challenge) {
                    throw new Error(
                        "Two-factor authentication is required, but no challenge was returned."
                    );
                }

                navigate("/two-factor", {
                    replace: true,
                    state: {
                        challenge: response.challenge,
                        email: form.email,
                    },
                });

                return;
            }

            // Verify that user information exists
            const user = response?.user;

            if (!user) {
                throw new Error(
                    "Login succeeded, but user information was not returned."
                );
            }

            // Admin login
            if (user.role === "admin") {
                toast.success("Login successful!");

                navigate("/adminDashboard", {
                    replace: true,
                });

                return;
            }

            // Normal user login
            if (user.role === "user") {
                toast.success("Login successful!");

                navigate("/user/dashboard", {
                    replace: true,
                });

                return;
            }

            // Unsupported role
            throw new Error(
                "Your account has an invalid or unsupported role."
            );
        } catch (error) {
            console.error("Login error:", error);

            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to login. Please try again.";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-md">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">
                        Welcome Back
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Sign in to your EmmCore Broker account.
                    </p>
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
                        <label className="mb-2 block text-sm text-slate-300">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                        />
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="text-sm text-slate-300">
                                Password
                            </label>

                            <Link
                                to="/forgot-password"
                                className="text-sm text-cyan-400 hover:text-cyan-300"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign In"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-400">
                    Don't have an account?{" "}

                    <Link
                        to="/signup"
                        className="text-cyan-400 hover:text-cyan-300"
                    >
                        Create account
                    </Link>
                </p>

            </div>
        </div>
    );
};

export default Login;