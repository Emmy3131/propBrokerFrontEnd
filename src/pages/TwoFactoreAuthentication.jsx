import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaShieldHalved,
  FaCircleCheck,
  FaLock,
  FaMobileScreenButton,
  FaChevronRight,
} from "react-icons/fa6";

import { useAuth } from "../context/AuthContext";

const TwoFactorAuthentication = () => {
    const { user, loading } = useAuth();

    /*
    =====================================================
    LOADING
    =====================================================
    */

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-950 text-white flex items-center justify-center px-4">
                <div className="text-surface-400">
                    Loading security settings...
                </div>
            </div>
        );
    }

    /*
    =====================================================
    2FA STATUS
    =====================================================
    */

    const twoFactorEnabled = Boolean(user?.twoFactorEnabled);

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
                    to="/profile"
                    className="inline-flex items-center gap-2 text-surface-400 hover:text-white transition mb-8"
                >
                    <FaArrowLeft />
                    Back to Profile
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4">

                        <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                            <FaShieldHalved className="text-brand-400 text-xl" />
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">
                                Two-Factor Authentication
                            </h1>

                            <p className="text-surface-400 mt-1">
                                Manage the additional security layer protecting your account.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-surface-900 border border-surface-700 rounded-2xl overflow-hidden">

                    <div className="p-6 sm:p-8">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

                            <div className="flex items-start gap-4">

                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${twoFactorEnabled
                                            ? "bg-success-500/10 text-success-400"
                                            : "bg-warning-500/10 text-warning-400"
                                        }`}
                                >
                                    {twoFactorEnabled ? (
                                        <FaCheckCircle />
                                    ) : (
                                        <FaLock />
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Two-factor authentication
                                    </h2>

                                    <p className="text-sm text-surface-400 mt-1">
                                        {twoFactorEnabled
                                            ? "Two-factor authentication is currently enabled on your account."
                                            : "Two-factor authentication is currently disabled on your account."}
                                    </p>
                                </div>

                            </div>

                            <span
                                className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold ${twoFactorEnabled
                                        ? "bg-success-500/10 text-success-400 border border-success-500/20"
                                        : "bg-warning-500/10 text-warning-400 border border-warning-500/20"
                                    }`}
                            >
                                {twoFactorEnabled ? "Enabled" : "Disabled"}
                            </span>

                        </div>

                    </div>

                    <div className="border-t border-surface-700" />

                    {/* Enabled */}
                    {twoFactorEnabled ? (
                        <div>

                            <Link
                                to="/profile/two-factor-authentication/disable"
                                className="flex items-center justify-between gap-4 p-6 hover:bg-surface-800/60 transition"
                            >

                                <div className="flex items-start gap-4">

                                    <div className="w-11 h-11 rounded-xl bg-surface-800 flex items-center justify-center shrink-0">
                                        <FaLock className="text-danger-400" />
                                    </div>

                                    <div>
                                        <h3 className="font-medium">
                                            Disable two-factor authentication
                                        </h3>

                                        <p className="text-sm text-surface-400 mt-1">
                                            Turn off two-factor authentication after verifying your
                                            authenticator code.
                                        </p>
                                    </div>

                                </div>

                                <FaChevronRight className="text-surface-500 shrink-0" />

                            </Link>

                        </div>
                    ) : (
                        /* Disabled */
                        <div>

                            <Link
                                to="/profile/two-factor-authentication/setup"
                                className="flex items-center justify-between gap-4 p-6 hover:bg-surface-800/60 transition"
                            >

                                <div className="flex items-start gap-4">

                                    <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                                        <FaMobileScreenButton className="text-brand-400" />
                                    </div>

                                    <div>
                                        <h3 className="font-medium">
                                            Set up two-factor authentication
                                        </h3>

                                        <p className="text-sm text-surface-400 mt-1">
                                            Use an authenticator app to add another layer of
                                            protection to your account.
                                        </p>
                                    </div>

                                </div>

                                <FaChevronRight className="text-surface-500 shrink-0" />

                            </Link>

                        </div>
                    )}

                </div>

                {/* Information */}
                <div className="mt-6 bg-surface-900/50 border border-surface-700 rounded-xl p-5">

                    <div className="flex items-start gap-3">

                        <FaShieldHalved className="text-brand-400 mt-1 shrink-0" />

                        <div>
                            <h3 className="font-medium">
                                Why use two-factor authentication?
                            </h3>

                            <p className="text-sm text-surface-500 mt-1 leading-6">
                                Two-factor authentication helps protect your account even if
                                your password is compromised by requiring an additional
                                verification code from your authenticator app.
                            </p>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default TwoFactorAuthentication;