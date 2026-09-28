import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaArrowRight,
    FaCheck,
    FaCircleCheck,
    FaCircleExclamation,
    FaClock,
    FaCopy,
    FaEnvelope,
    FaIdCard,
    FaLock,
    FaPhone,
    FaShieldHalved,
    FaUser,
    FaUserShield,
    FaXmark,
} from "react-icons/fa6";

import api from "../library/api";
import { useAuth } from "../context/AuthContext";


/*
=====================================================
HELPERS
=====================================================
*/

const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return "U";

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};


const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    return parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};


const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};


const getStatusClasses = (status) => {
    switch (status) {
        case "active":
            return "bg-success/10 text-success border-success/20";

        case "verified":
            return "bg-success/10 text-success border-success/20";

        case "pending":
            return "bg-warning/10 text-warning border-warning/20";

        case "suspended":
        case "blocked":
        case "closed":
        case "rejected":
            return "bg-danger/10 text-danger border-danger/20";

        default:
            return "bg-surface-800 text-surface-300 border-surface-700";
    }
};


/*
=====================================================
REUSABLE COMPONENTS
=====================================================
*/

const SectionCard = ({
    title,
    description,
    icon: Icon,
    children,
    action,
}) => {
    return (
        <section className="overflow-hidden rounded-2xl border border-surface-700 bg-surface-900">
            <div className="flex flex-col gap-4 border-b border-surface-700 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <Icon />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-white">
                            {title}
                        </h2>

                        {description && (
                            <p className="mt-1 text-sm text-surface-400">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {action}
            </div>

            <div className="p-5">
                {children}
            </div>
        </section>
    );
};


const InfoItem = ({
    label,
    value,
    icon: Icon,
    badge,
    copyable = false,
    onCopy,
}) => {
    return (
        <div className="rounded-xl border border-surface-700 bg-surface-950/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-surface-500">
                {Icon && <Icon className="text-surface-400" />}
                <span>{label}</span>
            </div>

            <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-medium text-white">
                    {value || "—"}
                </p>

                {badge}

                {copyable && value && (
                    <button
                        type="button"
                        onClick={() => onCopy?.(value)}
                        className="shrink-0 rounded-lg p-2 text-surface-400 transition hover:bg-surface-800 hover:text-white"
                        title="Copy"
                    >
                        <FaCopy />
                    </button>
                )}
            </div>
        </div>
    );
};


const StatusBadge = ({ status }) => {
    const normalizedStatus = String(status || "").toLowerCase();

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                normalizedStatus
            )}`}
        >
            {formatStatus(status)}
        </span>
    );
};


/*
=====================================================
PROFILE PAGE
=====================================================
*/

const Profile = () => {
    const navigate = useNavigate();

    const { user, logoutAll } = useAuth();

    const [profile, setProfile] = useState(user || null);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        country: "",
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /*
    ===================================================
    LOAD PROFILE
    ===================================================
    */

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/users/me");

                const currentUser = response.data?.data?.user ||
                    response.data?.data ||
                    response.data?.user ||
                    response.data;

                setProfile(currentUser);

                setForm({
                    name: currentUser?.name || "",
                    phone: currentUser?.phone || "",
                    country: currentUser?.country || "",
                });
            } catch (err) {
                console.error("Failed to load profile:", err);

                /*
                If /users/me is not available yet, fall back
                to the authenticated user from AuthContext.
                */

                if (user) {
                    setProfile(user);

                    setForm({
                        name: user.name || "",
                        phone: user.phone || "",
                        country: user.country || "",
                    });
                }

                setError(
                    err.response?.data?.message ||
                    "Unable to load your profile."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user]);


    /*
    ===================================================
    FORM HANDLERS
    ===================================================
    */

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const handlePasswordChange = (event) => {
        const { name, value } = event.target;

        setPasswordForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    /*
    ===================================================
    UPDATE PROFILE
    ===================================================
    */

    const handleProfileSubmit = async (event) => {
        event.preventDefault();

        try {
            setSavingProfile(true);
            setError("");
            setSuccess("");

            const response = await api.patch("/users/me", {
                name: form.name,
                phone: form.phone,
                country: form.country,
            });

            const updatedUser =
                response.data?.data?.user ||
                response.data?.data ||
                response.data?.user;

            if (updatedUser) {
                setProfile(updatedUser);
            } else {
                setProfile((previous) => ({
                    ...previous,
                    ...form,
                }));
            }

            setSuccess("Your profile has been updated successfully.");
        } catch (err) {
            console.error("Failed to update profile:", err);

            setError(
                err.response?.data?.message ||
                "Unable to update your profile."
            );
        } finally {
            setSavingProfile(false);
        }
    };


    /*
    ===================================================
    CHANGE PASSWORD
    ===================================================
    */

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (
            passwordForm.newPassword !==
            passwordForm.confirmPassword
        ) {
            setError("New password and confirmation do not match.");
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }

        try {
            setChangingPassword(true);

            await api.patch("/users/me/password", {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword,
            });

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setSuccess(
                "Your password has been changed successfully."
            );
        } catch (err) {
            console.error("Failed to change password:", err);

            setError(
                err.response?.data?.message ||
                "Unable to change your password."
            );
        } finally {
            setChangingPassword(false);
        }
    };


    /*
    ===================================================
    LOGOUT ALL SESSIONS
    ===================================================
    */

    const handleLogoutAll = async () => {
        try {
            setError("");
            setSuccess("");

            await logoutAll();

            navigate("/login");
        } catch (err) {
            console.error("Logout all failed:", err);

            setError(
                err.response?.data?.message ||
                "Unable to log out of all sessions."
            );
        }
    };


    /*
    ===================================================
    COPY
    ===================================================
    */

    const handleCopy = async (value) => {
        try {
            await navigator.clipboard.writeText(value);

            setSuccess("Copied to clipboard.");

            setTimeout(() => {
                setSuccess("");
            }, 2000);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };


    /*
    ===================================================
    LOADING
    ===================================================
    */

    if (loading && !profile) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-surface-700 border-t-brand" />
            </div>
        );
    }


    const currentUser = profile || user || {};

    const isAdmin =
        currentUser.role === "admin";


    /*
    ===================================================
    RENDER
    ===================================================
    */

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">

            {/* =============================================
          PAGE HEADER
      ============================================= */}

            <div>
                <h1 className="text-2xl font-bold text-white">
                    Profile
                </h1>

                <p className="mt-1 text-sm text-surface-400">
                    Manage your personal information, account details,
                    and security settings.
                </p>
            </div>


            {/* =============================================
          ALERTS
      ============================================= */}

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
                    <FaCircleExclamation className="mt-0.5 shrink-0" />

                    <div className="flex-1">
                        {error}
                    </div>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="text-danger/70 hover:text-danger"
                    >
                        <FaXmark />
                    </button>
                </div>
            )}


            {success && (
                <div className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/10 p-4 text-sm text-success">
                    <FaCircleCheck className="mt-0.5 shrink-0" />

                    <div>
                        {success}
                    </div>
                </div>
            )}


            {/* =============================================
          PROFILE HEADER
      ============================================= */}

            <section className="overflow-hidden rounded-2xl border border-surface-700 bg-surface-900">
                <div className="h-28 bg-gradient-to-r from-brand/20 via-brand/5 to-transparent" />

                <div className="-mt-12 px-5 pb-6 sm:px-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

                            {/* Avatar */}
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-surface-900 bg-brand text-2xl font-bold text-white shadow-xl">
                                {getInitials(currentUser.name)}
                            </div>

                            <div className="pb-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl font-bold text-white">
                                        {currentUser.name || "User"}
                                    </h2>

                                    {isAdmin && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand">
                                            <FaUserShield />
                                            Administrator
                                        </span>
                                    )}
                                </div>

                                <p className="mt-1 text-sm text-surface-400">
                                    {currentUser.email || "No email available"}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <StatusBadge status={currentUser.status} />

                                    {currentUser.emailVerified ? (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                                            <FaCircleCheck />
                                            Email verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-warning/20 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
                                            <FaCircleExclamation />
                                            Email not verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate(
                                isAdmin
                                    ? "/admin/security"
                                    : "/user/security"
                            )}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-700 bg-surface-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-surface-700"
                        >
                            <FaShieldHalved />
                            Security
                            <FaArrowRight className="text-xs" />
                        </button>

                    </div>
                </div>
            </section>


            {/* =============================================
          PERSONAL INFORMATION
      ============================================= */}

            <SectionCard
                title="Personal Information"
                description="Update the personal information associated with your account."
                icon={FaUser}
            >
                <form
                    onSubmit={handleProfileSubmit}
                    className="space-y-5"
                >

                    <div className="grid gap-5 md:grid-cols-2">

                        <div>
                            <label className="mb-2 block text-sm font-medium text-surface-300">
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                className="w-full rounded-xl border border-surface-700 bg-surface-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-surface-600 focus:border-brand"
                            />
                        </div>


                        <div>
                            <label className="mb-2 block text-sm font-medium text-surface-300">
                                Email Address
                            </label>

                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />

                                <input
                                    type="email"
                                    value={currentUser.email || ""}
                                    disabled
                                    className="w-full cursor-not-allowed rounded-xl border border-surface-700 bg-surface-800/50 py-3 pl-11 pr-4 text-sm text-surface-500"
                                />
                            </div>

                            <p className="mt-1.5 text-xs text-surface-500">
                                Email changes are handled through account
                                security controls.
                            </p>
                        </div>


                        <div>
                            <label className="mb-2 block text-sm font-medium text-surface-300">
                                Phone Number
                            </label>

                            <div className="relative">
                                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />

                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Phone number"
                                    className="w-full rounded-xl border border-surface-700 bg-surface-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-surface-600 focus:border-brand"
                                />
                            </div>
                        </div>


                        <div>
                            <label className="mb-2 block text-sm font-medium text-surface-300">
                                Country
                            </label>

                            <input
                                type="text"
                                name="country"
                                value={form.country}
                                onChange={handleChange}
                                placeholder="Country"
                                className="w-full rounded-xl border border-surface-700 bg-surface-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-surface-600 focus:border-brand"
                            />
                        </div>

                    </div>


                    <div className="flex justify-end border-t border-surface-700 pt-5">
                        <button
                            type="submit"
                            disabled={savingProfile}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {savingProfile ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FaCheck />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </SectionCard>


            {/* =============================================
          ACCOUNT INFORMATION
      ============================================= */}

            <SectionCard
                title="Account Information"
                description="Information about your broker account."
                icon={FaIdCard}
            >

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    <InfoItem
                        label="Account Status"
                        value={formatStatus(currentUser.status)}
                        badge={<StatusBadge status={currentUser.status} />}
                    />

                    <InfoItem
                        label="Account Role"
                        value={isAdmin ? "Administrator" : "User"}
                        icon={isAdmin ? FaUserShield : FaUser}
                    />

                    <InfoItem
                        label="Member Since"
                        value={formatDate(currentUser.createdAt)}
                        icon={FaClock}
                    />

                    <InfoItem
                        label="Email Verification"
                        value={
                            currentUser.emailVerified
                                ? "Verified"
                                : "Not verified"
                        }
                        icon={FaEnvelope}
                    />

                    <InfoItem
                        label="Referral Code"
                        value={currentUser.referralCode}
                        copyable
                        onCopy={handleCopy}
                    />

                    <InfoItem
                        label="User ID"
                        value={currentUser._id || currentUser.id}
                        copyable
                        onCopy={handleCopy}
                    />

                </div>


                {/* Admin-only information */}

                {isAdmin && (
                    <div className="mt-5 rounded-xl border border-brand/20 bg-brand/5 p-4">

                        <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                <FaUserShield />
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-white">
                                    Administrator Account
                                </h3>

                                <p className="mt-1 text-sm text-surface-400">
                                    This account has administrative access to
                                    the broker platform. Administrative actions
                                    remain protected by role-based permissions.
                                </p>
                            </div>

                        </div>

                    </div>
                )}

            </SectionCard>


            {/* =============================================
          SECURITY OVERVIEW
      ============================================= */}

            <SectionCard
                title="Security"
                description="Manage password, two-factor authentication, and active sessions."
                icon={FaShieldHalved}
                action={
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                isAdmin
                                    ? "/admin/security"
                                    : "/user/security"
                            )
                        }
                        className="text-sm font-medium text-brand hover:underline"
                    >
                        Manage Security
                    </button>
                }
            >

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    <div className="rounded-xl border border-surface-700 bg-surface-950/50 p-4">

                        <div className="flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                <FaShieldHalved />
                            </div>

                            {currentUser.twoFactorEnabled ? (
                                <span className="text-xs font-medium text-success">
                                    Enabled
                                </span>
                            ) : (
                                <span className="text-xs font-medium text-warning">
                                    Disabled
                                </span>
                            )}
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-white">
                            Two-Factor Authentication
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-surface-500">
                            Add an extra layer of protection to your account.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    currentUser.twoFactorEnabled
                                        ? isAdmin
                                            ? "/admin/security/2fa/disable"
                                            : "/user/security/2fa/disable"
                                        : isAdmin
                                            ? "/admin/security/2fa/setup"
                                            : "/user/security/2fa/setup"
                                )
                            }
                            className="mt-4 text-sm font-medium text-brand hover:underline"
                        >
                            {currentUser.twoFactorEnabled
                                ? "Manage 2FA"
                                : "Enable 2FA"}
                        </button>

                    </div>


                    <div className="rounded-xl border border-surface-700 bg-surface-950/50 p-4">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                            <FaLock />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-white">
                            Password
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-surface-500">
                            Change your account password regularly to keep
                            your account secure.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                document
                                    .getElementById("change-password")
                                    ?.scrollIntoView({
                                        behavior: "smooth",
                                    })
                            }
                            className="mt-4 text-sm font-medium text-brand hover:underline"
                        >
                            Change Password
                        </button>

                    </div>


                    <div className="rounded-xl border border-surface-700 bg-surface-950/50 p-4">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
                            <FaShieldHalved />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-white">
                            Active Sessions
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-surface-500">
                            Review devices currently signed into your account.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    isAdmin
                                        ? "/admin/security"
                                        : "/user/security"
                                )
                            }
                            className="mt-4 text-sm font-medium text-brand hover:underline"
                        >
                            View Sessions
                        </button>

                    </div>

                </div>

            </SectionCard>


            {/* =============================================
          CHANGE PASSWORD
      ============================================= */}

            <section
                id="change-password"
                className="overflow-hidden rounded-2xl border border-surface-700 bg-surface-900"
            >

                <div className="border-b border-surface-700 p-5">

                    <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                            <FaLock />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-white">
                                Change Password
                            </h2>

                            <p className="mt-1 text-sm text-surface-400">
                                Update your password using your current password.
                            </p>
                        </div>

                    </div>

                </div>


                <form
                    onSubmit={handlePasswordSubmit}
                    className="space-y-5 p-5"
                >

                    <div className="grid gap-5 md:grid-cols-3">

                        <div>
                            <label className="mb-2 block text-sm font-medium text-surface-300">
                                Current Password
                            </label>

                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                autoComplete="current-password"
                                className="w-full rounded-xl border border-surface-700 bg-surface-950 px-4 py-3 text-sm text-white outline-none transition focus:border-brand"
                            />
                        </div>


                        <div>
                            <label className="mb-2 block text-sm font-medium text-surface-300">
                                New Password
                            </label>

                            <input
                                type="password"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                autoComplete="new-password"
                                className="w-full rounded-xl border border-surface-700 bg-surface-950 px-4 py-3 text-sm text-white outline-none transition focus:border-brand"
                            />
                        </div>


                        <div>
                            <label className="mb-2 block text-sm font-medium text-surface-300">
                                Confirm New Password
                            </label>

                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                autoComplete="new-password"
                                className="w-full rounded-xl border border-surface-700 bg-surface-950 px-4 py-3 text-sm text-white outline-none transition focus:border-brand"
                            />
                        </div>

                    </div>


                    <div className="flex justify-end border-t border-surface-700 pt-5">

                        <button
                            type="submit"
                            disabled={changingPassword}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {changingPassword ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FaLock />
                                    Update Password
                                </>
                            )}
                        </button>

                    </div>

                </form>

            </section>


            {/* =============================================
          LOGOUT ALL
      ============================================= */}

            <section className="overflow-hidden rounded-2xl border border-danger/20 bg-danger/5">

                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
                            <FaShieldHalved />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-white">
                                Sign out of all sessions
                            </h2>

                            <p className="mt-1 text-sm text-surface-400">
                                Sign out from every device currently connected
                                to your account.
                            </p>
                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={handleLogoutAll}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/20"
                    >
                        Sign Out Everywhere
                    </button>

                </div>

            </section>

        </div>
    );
};

export default Profile;