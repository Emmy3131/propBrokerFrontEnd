
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
    const navigate = useNavigate();
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
            // login() should return the authenticated user
            const response = await login(form);

            /*
             * 2FA
             *
             * If the backend requires 2FA after
             * password authentication, redirect
             * to the 2FA page first.
             */
            if (
                response?.requiresTwoFactor ||
                response?.data?.requiresTwoFactor
            ) {
                navigate("/two-factor");
                return;
            }

            /*
             * Get the user returned from AuthContext.
             *
             * Depending on how your login() function
             * returns the response, support both:
             *
             * response.role
             *
             * and
             *
             * response.data.user.role
             */
            const user =
                response?.role
                    ? response
                    : response?.data?.user;

            if (!user) {
                throw new Error(
                    "Login succeeded, but user information was not returned."
                );
            }

            /*
             * Redirect based on the user's role.
             */
            if (user.role === "admin") {
                navigate("/adminDashboard", {
                    replace: true,
                });
                return;
            }

            if (user.role === "user") {
                navigate("/userDashboard", {
                    replace: true,
                });
                return;
            }

            /*
             * Unknown role
             */
            throw new Error(
                "Your account has an invalid or unsupported role."
            );
        } catch (error) {
            console.error("Login error:", error);

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to login. Please try again."
            );
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
