import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    FaArrowLeft,
    FaCheck,
    FaClock,
    FaCloudArrowDown,
    FaFileCircleCheck,
    FaFileImage,
    FaIdCard,
    FaInfo,
    FaArrowsRotate,
    FaShieldHalved,
    FaXmark,
    FaTriangleExclamation,
    FaUser,
    FaUserCheck,
} from "react-icons/fa6";

import api from "../../library/api";

/*
=====================================================
STATUS BADGE
=====================================================
*/

const StatusBadge = ({ status }) => {
    const config = {
        not_started: {
            label: "Not Started",
            className: "bg-slate-100 text-slate-700 border-slate-200",
            icon: <FaInfoCircle />,
        },

        pending: {
            label: "Pending",
            className: "bg-amber-50 text-amber-700 border-amber-200",
            icon: <FaClock />,
        },

        under_review: {
            label: "Under Review",
            className: "bg-blue-50 text-blue-700 border-blue-200",
            icon: <FaShieldHalved />,
        },

        verified: {
            label: "Verified",
            className: "bg-emerald-50 text-emerald-700 border-emerald-200",
            icon: <FaCheckCircle />,
        },

        rejected: {
            label: "Rejected",
            className: "bg-red-50 text-red-700 border-red-200",
            icon: <FaTriangleExclamation />,
        },
    };

    const current = config[status] || config.not_started;

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${current.className}`}
        >
            {current.icon}
            {current.label}
        </span>
    );
};

/*
=====================================================
INFO ITEM
=====================================================
*/

const InfoItem = ({ label, value }) => {
    return (
        <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="break-words text-sm font-semibold text-slate-800">
                {value || "Not provided"}
            </p>
        </div>
    );
};

/*
=====================================================
SECTION
=====================================================
*/

const Section = ({ title, icon, children, right }) => {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        {icon}
                    </div>

                    <h2 className="text-base font-bold text-slate-900">
                        {title}
                    </h2>
                </div>

                {right}
            </div>

            <div className="p-5">{children}</div>
        </section>
    );
};

/*
=====================================================
DOCUMENT CARD
=====================================================
*/

const DocumentCard = ({
    title,
    documentType,
    available,
    loading,
    onView,
}) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-surface-700  bg-brand-500/10">
            <div className="flex h-48 items-center justify-center  bg-brand-500/10">
                {loading ? (
                    <div className="text-center">
                        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-surface-700
              border-t-brand-500" />

                        <p className="text-sm text-surface-400">
                            Loading document...
                        </p>
                    </div>
                ) : available ? (
                    <div className="text-center">
                        <FaFileImage className="mx-auto mb-3 text-5xl text-surface-500" />

                        <p className="text-sm font-semibold text-slate-700">
                            Document available
                        </p>
                    </div>
                ) : (
                    <div className="px-4 text-center">
                        <FaFileImage className="mx-auto mb-3 text-4xl text-surface-400" />

                        <p className="text-sm font-semibold text-surface-400">
                            Not uploaded
                        </p>
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                    {title}
                </h3>

                {available ? (
                    <button
                        type="button"
                        onClick={() => onView(documentType)}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <FaCloudArrowDown />

                        View Secure Document
                    </button>
                ) : (
                    <button
                        type="button"
                        disabled
                        className="w-full cursor-not-allowed rounded-xl  bg-brand-500/10 px-4 py-2.5 text-sm font-semibold text-slate-400"
                    >
                        Document Unavailable
                    </button>
                )}
            </div>
        </div>
    );
};

/*
=====================================================
MAIN COMPONENT
=====================================================
*/

const AdminKycDetails = () => {
    const navigate = useNavigate();
    const { userId } = useParams();

    const [kyc, setKyc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [documentLoading, setDocumentLoading] = useState({
        documentFront: false,
        documentBack: false,
        selfie: false,
    });

    const [documentError, setDocumentError] = useState("");

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [reviewNote, setReviewNote] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    /*
    =====================================================
    FETCH KYC
    =====================================================
    */

    const fetchKyc = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get(`/kyc/admin/user/${userId}`);

            setKyc(response.data?.data?.kyc || null);
        } catch (err) {
            console.error("Failed to fetch KYC:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load this user's KYC information."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchKyc();
    }, [fetchKyc]);

    /*
    =====================================================
    VIEW SECURE DOCUMENT
    =====================================================
    */

    const handleViewDocument = async (documentType) => {
        try {
            setDocumentError("");

            setDocumentLoading((prev) => ({
                ...prev,
                [documentType]: true,
            }));

            const kycId = kyc?._id;

            if (!kycId) {
                throw new Error("KYC record not found.");
            }

            const response = await api.get(
                `/kyc/admin/${kycId}/document/${documentType}`
            );

            const url = response.data?.data?.url;

            if (!url) {
                throw new Error("Secure document URL was not returned.");
            }

            window.open(url, "_blank", "noopener,noreferrer");
        } catch (err) {
            console.error("Failed to open document:", err);

            setDocumentError(
                err.response?.data?.message ||
                err.message ||
                "Unable to open the document."
            );
        } finally {
            setDocumentLoading((prev) => ({
                ...prev,
                [documentType]: false,
            }));
        }
    };

    /*
    =====================================================
    APPROVE KYC
    =====================================================
    */

    const handleApprove = async () => {
        if (!kyc?._id) return;

        const confirmed = window.confirm(
            "Are you sure you want to approve this KYC application?"
        );

        if (!confirmed) return;

        try {
            setActionLoading(true);
            setError("");

            await api.patch(`/kyc/admin/${kyc._id}/approve`, {
                reviewNote: reviewNote.trim() || undefined,
            });

            await fetchKyc(true);

            setReviewNote("");
        } catch (err) {
            console.error("Failed to approve KYC:", err);

            setError(
                err.response?.data?.message ||
                "Unable to approve this KYC application."
            );
        } finally {
            setActionLoading(false);
        }
    };

    /*
    =====================================================
    REJECT KYC
    =====================================================
    */

    const handleReject = async (event) => {
        event.preventDefault();

        if (!kyc?._id) return;

        if (!rejectionReason.trim()) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");

            await api.patch(`/kyc/admin/${kyc._id}/reject`, {
                rejectionReason: rejectionReason.trim(),
                reviewNote: reviewNote.trim() || undefined,
            });

            setShowRejectModal(false);
            setRejectionReason("");
            setReviewNote("");

            await fetchKyc(true);
        } catch (err) {
            console.error("Failed to reject KYC:", err);

            setError(
                err.response?.data?.message ||
                "Unable to reject this KYC application."
            );
        } finally {
            setActionLoading(false);
        }
    };

    /*
    =====================================================
    DATE FORMATTER
    =====================================================
    */

    const formatDate = (date) => {
        if (!date) return "Not available";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
        }

        return parsedDate.toLocaleString("en-NG", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    /*
    =====================================================
    LOADING
    =====================================================
    */

    if (loading) {
        return (
            <div className="min-h-screen  bg-brand-500/10 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6 h-8 w-48 animate-pulse rounded-lg  bg-brand-500/10" />

                    <div className="mb-6 h-32 animate-pulse rounded-2xl  bg-brand-500/10 shadow-sm" />

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="h-72 animate-pulse rounded-2xl  bg-brand-500/10 shadow-sm" />
                        <div className="h-72 animate-pulse rounded-2xl  bg-brand-500/10 shadow-sm" />
                    </div>
                </div>
            </div>
        );
    }

    /*
    =====================================================
    ERROR
    =====================================================
    */

    if (error && !kyc) {
        return (
            <div className="min-h-screen  bg-brand-500/10 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-3xl">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                    >
                        <FaArrowLeft />

                        Back
                    </button>

                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                        <FaTriangleExclamation className="mx-auto mb-3 text-3xl text-red-500" />

                        <h2 className="mb-2 text-lg font-bold text-red-800">
                            Unable to load KYC
                        </h2>

                        <p className="mb-5 text-sm text-red-700">{error}</p>

                        <button
                            type="button"
                            onClick={() => fetchKyc()}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                        >
                            <FaRefresh />

                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /*
    =====================================================
    NO KYC
    =====================================================
    */

    if (!kyc) {
        return (
            <div className="min-h-screen  bg-brand-500/10 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-3xl">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                    >
                        <FaArrowLeft />

                        Back to Users
                    </button>

                    <div className="rounded-2xl border border-slate-200  bg-brand-500/10 p-8 text-center shadow-sm">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full  bg-brand-500/10">
                            <FaIdCard className="text-2xl text-slate-400" />
                        </div>

                        <h1 className="mb-2 text-xl font-bold text-surface-300">
                            KYC Not Submitted
                        </h1>

                        <p className="text-sm text-slate-500">
                            This user has not created a KYC application yet.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const user = kyc.user;

    const isUnderReview = kyc.status === "under_review";

    const hasFront = Boolean(kyc.documentFront?.storageKey);
    const hasBack = Boolean(kyc.documentBack?.storageKey);
    const hasSelfie = Boolean(kyc.selfie?.storageKey);

    return (
        <>
            <div className="space-y-6">
                <div>
                    {/* HEADER */}

                    <div className="mb-6">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                            >
                                <FaArrowLeft />

                                Back to Users
                            </button>

                            <button
                                type="button"
                                onClick={() => fetchKyc(true)}
                                disabled={refreshing}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                <FaRefresh className={refreshing ? "animate-spin" : ""} />

                                Refresh
                            </button>
                        </div>

                        <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm sm:p-6">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xl font-bold">
                                        {user?.profileImage ? (
                                            <img
                                                src={user.profileImage}
                                                alt={user.name || "User"}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            user?.name?.charAt(0)?.toUpperCase() || <FaUser />
                                        )}
                                    </div>

                                    <div>
                                        <h1 className="text-xl font-bold sm:text-2xl">
                                            {user?.name || "Unknown User"}
                                        </h1>

                                        <p className="mt-1 text-sm text-slate-300">
                                            {user?.email || "No email available"}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            KYC ID: {kyc._id}
                                        </p>
                                    </div>
                                </div>

                                <StatusBadge status={kyc.status} />
                            </div>
                        </div>
                    </div>

                    {/* ERROR */}

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <FaTriangleExclamation className="mt-0.5 shrink-0" />

                            <span>{error}</span>

                            <button
                                type="button"
                                onClick={() => setError("")}
                                className="ml-auto text-red-500 hover:text-red-700"
                            >
                                <FaXmark />
                            </button>
                        </div>
                    )}

                    {/* DOCUMENT ERROR */}

                    {documentError && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <FaTriangleExclamation className="mt-0.5 shrink-0" />

                            <span>{documentError}</span>

                            <button
                                type="button"
                                onClick={() => setDocumentError("")}
                                className="ml-auto text-amber-600 hover:text-amber-800"
                            >
                                <FaXmark />
                            </button>
                        </div>
                    )}

                    {/* USER INFORMATION */}

                    <div className="mb-6">
                        <Section
                            title="Applicant Information"
                            icon={<FaUser />}
                            right={
                                <button
                                    type="button"
                                    onClick={() => navigate(`/admin/users/${userId}`)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                                >
                                    <FaUserCheck />

                                    View User
                                </button>
                            }
                        >
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                <InfoItem label="Full Name" value={user?.name} />

                                <InfoItem label="Email" value={user?.email} />

                                <InfoItem label="Phone" value={user?.phone} />

                                <InfoItem label="Country" value={user?.country} />

                                <InfoItem
                                    label="Account Status"
                                    value={user?.status}
                                />

                                <InfoItem
                                    label="Email Verified"
                                    value={user?.emailVerified ? "Yes" : "No"}
                                />

                                <InfoItem
                                    label="2FA Enabled"
                                    value={user?.twoFactorEnabled ? "Yes" : "No"}
                                />

                                <InfoItem
                                    label="KYC Submitted"
                                    value={formatDate(kyc.submittedAt)}
                                />
                            </div>
                        </Section>
                    </div>

                    {/* PERSONAL + IDENTITY */}

                    <div className="mb-6 grid gap-6 lg:grid-cols-2">
                        <Section
                            title="Personal Information"
                            icon={<FaUser />}
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <InfoItem
                                    label="First Name"
                                    value={kyc.firstName}
                                />

                                <InfoItem
                                    label="Last Name"
                                    value={kyc.lastName}
                                />

                                <InfoItem
                                    label="Date of Birth"
                                    value={
                                        kyc.dateOfBirth
                                            ? new Date(kyc.dateOfBirth).toLocaleDateString(
                                                "en-NG"
                                            )
                                            : null
                                    }
                                />

                                <InfoItem
                                    label="Country"
                                    value={kyc.country}
                                />

                                <InfoItem
                                    label="City"
                                    value={kyc.city}
                                />

                                <InfoItem
                                    label="State"
                                    value={kyc.state}
                                />

                                <InfoItem
                                    label="Postal Code"
                                    value={kyc.postalCode}
                                />

                                <InfoItem
                                    label="Address"
                                    value={kyc.address}
                                />
                            </div>
                        </Section>

                        <Section
                            title="Identity Information"
                            icon={<FaIdCard />}
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <InfoItem
                                    label="Document Type"
                                    value={
                                        kyc.identityDocumentType
                                            ?.replaceAll("_", " ")
                                            ?.replace(/\b\w/g, (char) =>
                                                char.toUpperCase()
                                            )
                                    }
                                />

                                <InfoItem
                                    label="Document Number"
                                    value={kyc.identityDocumentNumber}
                                />

                                <InfoItem
                                    label="Submitted At"
                                    value={formatDate(kyc.submittedAt)}
                                />

                                <InfoItem
                                    label="Current Status"
                                    value={kyc.status?.replaceAll("_", " ")}
                                />
                            </div>
                        </Section>
                    </div>

                    {/* DOCUMENTS */}

                    <div className="mb-6">
                        <Section
                            title="Identity Documents"
                            icon={<FaFileCircleCheck />}
                            right={
                                <span className="text-xs text-slate-500">
                                    Secure administrator access
                                </span>
                            }
                        >
                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                <DocumentCard
                                    title="Identity Document - Front"
                                    documentType="documentFront"
                                    available={hasFront}
                                    loading={documentLoading.documentFront}
                                    onView={handleViewDocument}
                                />

                                <DocumentCard
                                    title="Identity Document - Back"
                                    documentType="documentBack"
                                    available={hasBack}
                                    loading={documentLoading.documentBack}
                                    onView={handleViewDocument}
                                />

                                <DocumentCard
                                    title="Selfie"
                                    documentType="selfie"
                                    available={hasSelfie}
                                    loading={documentLoading.selfie}
                                    onView={handleViewDocument}
                                />
                            </div>
                        </Section>
                    </div>

                    {/* REVIEW */}

                    <div className="mb-6">
                        <Section
                            title="Review Information"
                            icon={<FaShieldHalved />}
                        >
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                <InfoItem
                                    label="Status"
                                    value={kyc.status?.replaceAll("_", " ")}
                                />

                                <InfoItem
                                    label="Reviewed By"
                                    value={kyc.reviewedBy?.name}
                                />

                                <InfoItem
                                    label="Reviewed At"
                                    value={formatDate(kyc.reviewedAt)}
                                />

                                <InfoItem
                                    label="Verified At"
                                    value={formatDate(kyc.verifiedAt)}
                                />
                            </div>

                            {kyc.rejectionReason && (
                                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-red-500">
                                        Rejection Reason
                                    </p>

                                    <p className="text-sm leading-6 text-red-800">
                                        {kyc.rejectionReason}
                                    </p>
                                </div>
                            )}

                            {kyc.reviewNote && (
                                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Review Note
                                    </p>

                                    <p className="text-sm leading-6 text-slate-700">
                                        {kyc.reviewNote}
                                    </p>
                                </div>
                            )}
                        </Section>
                    </div>

                    {/* ADMIN ACTIONS */}

                    {isUnderReview && (
                        <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5">
                                <h2 className="text-lg font-bold text-slate-900">
                                    KYC Review
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Review the applicant's information and documents before
                                    making a decision.
                                </p>
                            </div>

                            <div className="mb-5">
                                <label
                                    htmlFor="reviewNote"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Review Note
                                    <span className="ml-1 font-normal text-slate-400">
                                        (optional)
                                    </span>
                                </label>

                                <textarea
                                    id="reviewNote"
                                    value={reviewNote}
                                    onChange={(event) =>
                                        setReviewNote(event.target.value)
                                    }
                                    rows={4}
                                    maxLength={2000}
                                    placeholder="Add an internal review note..."
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                />

                                <p className="mt-1 text-right text-xs text-slate-400">
                                    {reviewNote.length}/2000
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={actionLoading}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <FaTimes />

                                    Reject KYC
                                </button>

                                <button
                                    type="button"
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {actionLoading ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheck />

                                            Approve KYC
                                        </>
                                    )}
                                </button>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* REJECTION MODAL */}

            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Reject KYC Application
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    A rejection reason is required.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowRejectModal(false)}
                                disabled={actionLoading}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <FaXmark />
                            </button>
                        </div>

                        <form onSubmit={handleReject} className="p-5">
                            <label
                                htmlFor="rejectionReason"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Rejection Reason
                            </label>

                            <textarea
                                id="rejectionReason"
                                value={rejectionReason}
                                onChange={(event) =>
                                    setRejectionReason(event.target.value)
                                }
                                rows={5}
                                maxLength={1000}
                                required
                                placeholder="Explain why this KYC application is being rejected..."
                                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
                            />

                            <p className="mt-1 text-right text-xs text-slate-400">
                                {rejectionReason.length}/1000
                            </p>

                            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowRejectModal(false)}
                                    disabled={actionLoading}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        actionLoading || !rejectionReason.trim()
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {actionLoading ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                                            Rejecting...
                                        </>
                                    ) : (
                                        <>
                                            <FaTimes />

                                            Reject KYC
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminKycDetails;