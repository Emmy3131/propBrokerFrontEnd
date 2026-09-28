import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaArrowRight,
    FaCheck,
    FaKey,
    FaLock,
    FaRightFromBracket,
    FaShieldHalved,
    FaUser,
    FaTriangleExclamation,
} from "react-icons/fa6";

import api from "../../library/api";
import { useAuth } from "../../context/AuthContext";

/*
=====================================================
HELPERS
=====================================================
*/

const getInitials = (name = "") => {
    return (
        name
            .trim()
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("") || "U"
    );
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
        .replace(/\b\w/g, (char) => char.toUpperCase());
};


/*
=====================================================
REUSABLE INPUT
=====================================================
*/

const Input = ({
    label,
    name,
    value,
    onChange,
    type = "text",
    disabled = false,
    placeholder = "",
    required = false,
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
                {label}
            </label>

            <input
                name={name}
                type={type}
                value={value ?? ""}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                required={required}
                className={`w-full rounded-xl border border-surface-700 bg-surface-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-surface-500 focus:border-brand-500 ${disabled
                        ? "cursor-not-allowed opacity-60"
                        : ""
                    }`}
            />
        </div>
    );
};


/*
=====================================================
INFO ITEM
=====================================================
*/

const InfoItem = ({
    label,
    value,
}) => {
    return (
        <div className="rounded-xl border border-surface-700 bg-surface-950 p-4">
            <p className="text-xs uppercase tracking-wide text-surface-500">
                {label}
            </p>

            <p className="mt-2 break-words text-sm font-medium text-white">
                {value || "—"}
            </p>
        </div>
    );
};


/*
=====================================================
SECTION
=====================================================
*/

const Section = ({
    title,
    description,
    children,
    id,
}) => {
    return (
        <section
            id={id}
            className="rounded-2xl border border-surface-700 bg-surface-900 p-5 sm:p-6"
        >
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">
                    {title}
                </h2>

                {description && (
                    <p className="mt-1 text-sm text-gray-400">
                        {description}
                    </p>
                )}
            </div>

            {children}
        </section>
    );
};


/*
=====================================================
SECURITY ITEM
=====================================================
*/

const SecurityItem = ({
    icon,
    title,
    description,
    status,
    statusType = "neutral",
    actionLabel,
    onAction,
}) => {
    const statusClasses = {
        success:
            "border-success/20 bg-success/10 text-success",

        warning:
            "border-warning/20 bg-warning/10 text-warning",

        danger:
            "border-danger/20 bg-danger/10 text-danger",

        neutral:
            "border-surface-700 bg-surface-800 text-gray-300",
    };

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-surface-700 bg-surface-950 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-800 text-brand">
                    {icon}
                </div>

                <div className="min-w-0">
                    <h3 className="font-semibold text-white">
                        {title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-400">
                        {description}
                    </p>

                    {status && (
                        <span
                            className={`mt-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusClasses[statusType]}`}
                        >
                            {status}
                        </span>
                    )}
                </div>
            </div>

            {actionLabel && (
                <button
                    type="button"
                    onClick={onAction}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-surface-700 bg-surface-800 px-4 py-2.5 text-sm font-medium text-white transition hover:border-brand-500 hover:bg-surface-700"
                >
                    {actionLabel}

                    <FaArrowRight className="text-xs" />
                </button>
            )}
        </div>
    );
};


/*
=====================================================
PROFILE PAGE
=====================================================
*/

const Profile = () => {

    /*
    IMPORTANT:
    useNavigate MUST be inside the React component.
    */

    const navigate = useNavigate();

    const {
        user,
        logoutAll,
    } = useAuth();


    /*
    ===================================================
    PROFILE STATE
    ===================================================
    */

    const [profile, setProfile] = useState(user || null);

    const [loading, setLoading] = useState(true);

    const [savingProfile, setSavingProfile] =
        useState(false);

    const [changingPassword, setChangingPassword] =
        useState(false);

    const [profileError, setProfileError] =
        useState("");

    const [profileSuccess, setProfileSuccess] =
        useState("");

    const [passwordError, setPasswordError] =
        useState("");

    const [passwordSuccess, setPasswordSuccess] =
        useState("");


    /*
    ===================================================
    PROFILE FORM
    ===================================================
    */

    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
        country: user?.country || "",
    });


    /*
    ===================================================
    PASSWORD FORM
    ===================================================
    */

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });


    /*
    ===================================================
    FETCH PROFILE
    ===================================================
    */

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setProfileError("");

            const response = await api.get("/users/me");

            const currentUser =
                response.data?.data?.user ||
                response.data?.user ||
                null;

            if (currentUser) {
                setProfile(currentUser);

                setProfileForm({
                    name: currentUser.name || "",
                    phone: currentUser.phone || "",
                    country: currentUser.country || "",
                });
            }
        } catch (error) {
            console.error("Failed to load profile:", error);

            setProfileError(
                error.response?.data?.message ||
                "Failed to load your profile."
            );
        } finally {
            setLoading(false);
        }
    };


    /*
    ===================================================
    LOAD PROFILE
    ===================================================
    */

    useEffect(() => {
        fetchProfile();
    }, []);


    /*
    ===================================================
    PROFILE FORM CHANGE
    ===================================================
    */

    const handleProfileChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setProfileForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    /*
    ===================================================
    PASSWORD FORM CHANGE
    ===================================================
    */

    const handlePasswordChange = (event) => {
        const {
            name,
            value,
        } = event.target;

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

        setProfileError("");
        setProfileSuccess("");

        if (!profileForm.name.trim()) {
            setProfileError("Please enter your full name.");
            return;
        }

        try {
            setSavingProfile(true);

            const response = await api.patch(
                "/users/me",
                {
                    name: profileForm.name.trim(),
                    phone: profileForm.phone.trim(),
                    country: profileForm.country.trim(),
                }
            );

            const updatedUser =
                response.data?.data?.user ||
                response.data?.user ||
                null;

            if (updatedUser) {
                setProfile(updatedUser);

                setProfileForm({
                    name: updatedUser.name || "",
                    phone: updatedUser.phone || "",
                    country: updatedUser.country || "",
                });
            }

            setProfileSuccess(
                response.data?.message ||
                "Profile updated successfully."
            );
        } catch (error) {
            console.error(
                "Failed to update profile:",
                error
            );

            setProfileError(
                error.response?.data?.message ||
                "Failed to update your profile."
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

        setPasswordError("");
        setPasswordSuccess("");

        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = passwordForm;

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            setPasswordError(
                "Please complete all password fields."
            );

            return;
        }

        if (newPassword.length < 8) {
            setPasswordError(
                "Your new password must contain at least 8 characters."
            );

            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError(
                "New password and confirmation password do not match."
            );

            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError(
                "Your new password must be different from your current password."
            );

            return;
        }

        try {
            setChangingPassword(true);

            const response = await api.patch(
                "/users/me/password",
                {
                    currentPassword,
                    newPassword,
                    confirmPassword,
                }
            );

            setPasswordSuccess(
                response.data?.message ||
                "Password changed successfully."
            );

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            console.error(
                "Failed to change password:",
                error
            );

            setPasswordError(
                error.response?.data?.message ||
                "Failed to change your password."
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
        const confirmed = window.confirm(
            "Are you sure you want to sign out from all active sessions?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await logoutAll();
        } catch (error) {
            console.error(
                "Failed to logout all sessions:",
                error
            );

            setProfileError(
                error.response?.data?.message ||
                "Failed to sign out from all sessions."
            );
        }
    };


    /*
    ===================================================
    LOADING
    ===================================================
    */

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-surface-700 border-t-brand" />

                    <p className="mt-4 text-sm text-gray-400">
                        Loading your profile...
                    </p>
                </div>
            </div>
        );
    }


    /*
    ===================================================
    DISPLAY USER
    ===================================================
    */

    const displayUser = profile || user || {};

    const initials = getInitials(
        displayUser.name
    );

    const twoFactorEnabled =
        Boolean(displayUser.twoFactorEnabled);


    /*
    ===================================================
    RENDER
    ===================================================
    */

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6">

            {/* =================================================
          PAGE HEADER
      ================================================= */}

            <div>
                <h1 className="text-2xl font-bold text-white">
                    Profile
                </h1>

                <p className="mt-1 text-sm text-gray-400">
                    Manage your personal information,
                    account and security settings.
                </p>
            </div>


            {/* =================================================
          ERROR
      ================================================= */}

            {profileError && (
                <div className="flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
                    <FaTriangleExclamation className="mt-0.5 shrink-0" />

                    <span>{profileError}</span>
                </div>
            )}


            {/* =================================================
          PROFILE HEADER
      ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-surface-700 bg-surface-900">

                <div className="h-28 bg-gradient-to-r from-brand/20 via-brand/5 to-transparent" />

                <div className="-mt-12 px-5 pb-6 sm:px-6">

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                        <div className="flex items-end gap-4">

                            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-surface-900 bg-brand text-2xl font-bold text-white shadow-xl">
                                {initials}
                            </div>

                            <div className="pb-1">

                                <h2 className="text-xl font-bold text-white">
                                    {displayUser.name ||
                                        "User"}
                                </h2>

                                <p className="mt-1 text-sm text-gray-400">
                                    {displayUser.email ||
                                        "No email available"}
                                </p>

                            </div>

                        </div>


                        <div className="flex flex-wrap gap-2">

                            <span className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                                <span className="h-1.5 w-1.5 rounded-full bg-success" />

                                {formatStatus(
                                    displayUser.status ||
                                    "active"
                                )}
                            </span>


                            {displayUser.emailVerified && (
                                <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand">
                                    <FaCheck />

                                    Email Verified
                                </span>
                            )}

                        </div>

                    </div>

                </div>
            </div>


            {/* =================================================
          PERSONAL INFORMATION
      ================================================= */}

            <Section
                title="Personal Information"
                description="Update the personal information associated with your account."
            >

                <form
                    onSubmit={handleProfileSubmit}
                    className="space-y-5"
                >

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <Input
                            label="Full Name"
                            name="name"
                            value={profileForm.name}
                            onChange={handleProfileChange}
                            placeholder="Enter your full name"
                            required
                        />


                        <Input
                            label="Email Address"
                            name="email"
                            value={displayUser.email || ""}
                            disabled
                        />


                        <Input
                            label="Phone Number"
                            name="phone"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                            placeholder="Enter your phone number"
                        />


                        <Input
                            label="Country"
                            name="country"
                            value={profileForm.country}
                            onChange={handleProfileChange}
                            placeholder="Enter your country"
                        />

                    </div>


                    {profileSuccess && (
                        <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success">
                            <FaCheck />

                            {profileSuccess}
                        </div>
                    )}


                    <div className="flex justify-end">

                        <button
                            type="submit"
                            disabled={savingProfile}
                            className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {savingProfile
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </form>

            </Section>


            {/* =================================================
          ACCOUNT INFORMATION
      ================================================= */}

            <Section
                title="Account Information"
                description="Information about your propBroker account."
            >

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    <InfoItem
                        label="Account Status"
                        value={formatStatus(
                            displayUser.status
                        )}
                    />

                    <InfoItem
                        label="Account Role"
                        value={formatStatus(
                            displayUser.role
                        )}
                    />

                    <InfoItem
                        label="Email Verification"
                        value={
                            displayUser.emailVerified
                                ? "Verified"
                                : "Not Verified"
                        }
                    />

                    <InfoItem
                        label="Referral Code"
                        value={
                            displayUser.referralCode
                        }
                    />

                    <InfoItem
                        label="Member Since"
                        value={formatDate(
                            displayUser.createdAt
                        )}
                    />

                    <InfoItem
                        label="User ID"
                        value={displayUser._id}
                    />

                </div>

            </Section>


            {/* =================================================
          CHANGE PASSWORD
      ================================================= */}

            <Section
                id="change-password"
                title="Change Password"
                description="Update your password to keep your account secure."
            >

                <form
                    onSubmit={handlePasswordSubmit}
                    className="space-y-5"
                >

                    <Input
                        label="Current Password"
                        name="currentPassword"
                        type="password"
                        value={
                            passwordForm.currentPassword
                        }
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        required
                    />


                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <Input
                            label="New Password"
                            name="newPassword"
                            type="password"
                            value={
                                passwordForm.newPassword
                            }
                            onChange={handlePasswordChange}
                            placeholder="Minimum 8 characters"
                            required
                        />

                        <Input
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            value={
                                passwordForm.confirmPassword
                            }
                            onChange={handlePasswordChange}
                            placeholder="Confirm new password"
                            required
                        />

                    </div>


                    {passwordError && (
                        <div className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
                            <FaTriangleExclamation className="mt-0.5 shrink-0" />

                            {passwordError}
                        </div>
                    )}


                    {passwordSuccess && (
                        <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success">
                            <FaCheck />

                            {passwordSuccess}
                        </div>
                    )}


                    <div className="flex justify-end">

                        <button
                            type="submit"
                            disabled={changingPassword}
                            className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {changingPassword
                                ? "Changing Password..."
                                : "Change Password"}
                        </button>

                    </div>

                </form>

            </Section>


            {/* =================================================
          SECURITY
      ================================================= */}

            <Section
                title="Security"
                description="Manage two-factor authentication, sessions and account security."
            >

                <div className="space-y-4">

                    {/* 2FA */}

                    <SecurityItem
                        icon={<FaShieldHalved />}
                        title="Two-Factor Authentication"
                        description="Protect your account with an authenticator app."
                        status={
                            twoFactorEnabled
                                ? "✓ Enabled"
                                : "Not enabled"
                        }
                        statusType={
                            twoFactorEnabled
                                ? "success"
                                : "warning"
                        }
                        actionLabel="Manage 2FA"
                        onAction={() =>
                            navigate("/security")
                        }
                    />


                    {/* Password */}

                    <SecurityItem
                        icon={<FaKey />}
                        title="Password"
                        description="Change your password and keep your account credentials secure."
                        status="Password protected"
                        statusType="neutral"
                        actionLabel="Change Password"
                        onAction={() => {
                            document
                                .getElementById(
                                    "change-password"
                                )
                                ?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                });
                        }}
                    />


                    {/* Sessions */}

                    <SecurityItem
                        icon={<FaLock />}
                        title="Active Sessions"
                        description="Review devices currently signed in to your account."
                        status="Manage your sessions"
                        statusType="neutral"
                        actionLabel="Manage Sessions"
                        onAction={() =>
                            navigate("/security")
                        }
                    />


                    {/* Logout all */}

                    <SecurityItem
                        icon={<FaRightFromBracket />}
                        title="Sign Out Everywhere"
                        description="Sign out from all active sessions on your account."
                        status="Requires confirmation"
                        statusType="warning"
                        actionLabel="Logout All"
                        onAction={handleLogoutAll}
                    />

                </div>

            </Section>


            {/* =================================================
          ACCOUNT QUICK LINKS
      ================================================= */}

            <Section
                title="Account Settings"
                description="Quick access to other account management areas."
            >

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/security")
                        }
                        className="group flex items-center gap-4 rounded-2xl border border-surface-700 bg-surface-950 p-5 text-left transition hover:border-brand/40 hover:bg-surface-800"
                    >

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                            <FaShieldHalved />
                        </div>

                        <div className="min-w-0 flex-1">

                            <h3 className="font-semibold text-white">
                                Security Center
                            </h3>

                            <p className="mt-1 text-sm text-gray-400">
                                Manage 2FA and active sessions.
                            </p>

                        </div>

                        <FaArrowRight className="text-surface-500 transition group-hover:translate-x-1 group-hover:text-brand" />

                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            navigate("/security")
                        }
                        className="group flex items-center gap-4 rounded-2xl border border-surface-700 bg-surface-950 p-5 text-left transition hover:border-brand/40 hover:bg-surface-800"
                    >

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                            <FaLock />
                        </div>

                        <div className="min-w-0 flex-1">

                            <h3 className="font-semibold text-white">
                                Login & Security
                            </h3>

                            <p className="mt-1 text-sm text-gray-400">
                                Review your account protection.
                            </p>

                        </div>

                        <FaArrowRight className="text-surface-500 transition group-hover:translate-x-1 group-hover:text-brand" />

                    </button>

                </div>

            </Section>


            {/* =================================================
          FOOTER NOTE
      ================================================= */}

            <div className="flex items-start gap-3 rounded-2xl border border-surface-700 bg-surface-900 p-5">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <FaUser />
                </div>

                <div>
                    <p className="text-sm font-medium text-white">
                        Keep your account information secure
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-400">
                        Never share your password, authentication
                        codes or recovery information with anyone.
                    </p>
                </div>

            </div>

        </div>
    );
};

export default Profile;