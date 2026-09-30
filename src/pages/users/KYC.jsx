import { useCallback, useEffect, useState } from "react";

import {
    FaArrowRight,
    FaCheck,
    FaCircleCheck,
    FaClock,
    FaFileShield,
    FaIdCard,
    FaLock,
    FaShieldHalved,
    FaSpinner,
    FaTriangleExclamation,
    FaUpload,
} from "react-icons/fa6";

import api from "../../library/api";

const KYC = () => {
    const [kyc, setKyc] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        country: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        identityDocumentType: "",
        identityDocumentNumber: "",
    });

    const [files, setFiles] = useState({
        documentFront: null,
        documentBack: null,
        selfie: null,
    });

    /*
    =====================================================
    LOAD KYC
    =====================================================
    */

    const fetchKyc = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/kyc/me");

            const currentKyc = response?.data?.data?.kyc || null;

            console.log("KYC REFRESHED:", currentKyc);

            setKyc(currentKyc);

            if (currentKyc) {
                setForm({
                    firstName: currentKyc.firstName || "",
                    lastName: currentKyc.lastName || "",

                    dateOfBirth: currentKyc.dateOfBirth
                        ? new Date(currentKyc.dateOfBirth)
                              .toISOString()
                              .split("T")[0]
                        : "",

                    country: currentKyc.country || "",
                    address: currentKyc.address || "",
                    city: currentKyc.city || "",
                    state: currentKyc.state || "",
                    postalCode: currentKyc.postalCode || "",

                    identityDocumentType:
                        currentKyc.identityDocumentType || "",

                    /*
                     * The backend intentionally does not return
                     * the existing identity document number.
                     */
                    identityDocumentNumber: "",
                });
            } else {
                setForm({
                    firstName: "",
                    lastName: "",
                    dateOfBirth: "",
                    country: "",
                    address: "",
                    city: "",
                    state: "",
                    postalCode: "",
                    identityDocumentType: "",
                    identityDocumentNumber: "",
                });
            }
        } catch (err) {
            console.error("FETCH KYC ERROR:", err);

            setError(
                err?.response?.data?.message ||
                    "Unable to load your KYC information.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    /*
    =====================================================
    INITIAL + AUTOMATIC KYC REFRESH
    =====================================================
    */

    useEffect(() => {
        fetchKyc();
    }, [fetchKyc]);

    /*
    =====================================================
    HANDLE FORM CHANGE
    =====================================================
    */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /*
    =====================================================
    FILE VALIDATION
    =====================================================
    */

    const validateFile = (file) => {
        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        const maxSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            throw new Error(
                "Invalid file type. Only JPEG, PNG and WebP images are allowed.",
            );
        }

        if (file.size > maxSize) {
            throw new Error(
                "File is too large. Each KYC document must be 5 MB or smaller.",
            );
        }
    };

    /*
    =====================================================
    HANDLE FILE
    =====================================================
    */

    const handleFileChange = (e, field) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            validateFile(file);

            setFiles((previous) => ({
                ...previous,
                [field]: file,
            }));
        } catch (err) {
            e.target.value = "";

            setError(
                err?.message || "Unable to select this file.",
            );
        }
    };

    /*
    =====================================================
    DOCUMENT TYPE
    =====================================================
    */

    const requiresBackDocument =
        form.identityDocumentType !== "passport";

    /*
    =====================================================
    KYC STATUS
    =====================================================
    */

    const status = kyc?.status || "not_started";

    const isVerified = status === "verified";
    const isUnderReview = status === "under_review";
    const isRejected = status === "rejected";

    const canEdit = !isVerified && !isUnderReview;

    /*
    =====================================================
    CREATE / UPDATE KYC
    =====================================================
    */

    const saveKycInformation = async () => {
        const payload = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            dateOfBirth: form.dateOfBirth,
            country: form.country.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            postalCode: form.postalCode.trim(),
            identityDocumentType:
                form.identityDocumentType,
            identityDocumentNumber:
                form.identityDocumentNumber.trim(),
        };

        if (!payload.firstName) {
            throw new Error("Please enter your first name.");
        }

        if (!payload.lastName) {
            throw new Error("Please enter your last name.");
        }

        if (!payload.dateOfBirth) {
            throw new Error("Please provide your date of birth.");
        }

        if (!payload.country) {
            throw new Error("Please provide your country.");
        }

        if (!payload.address) {
            throw new Error("Please provide your address.");
        }

        if (!payload.city) {
            throw new Error("Please provide your city.");
        }

        if (!payload.state) {
            throw new Error("Please provide your state.");
        }

        if (!payload.identityDocumentType) {
            throw new Error(
                "Please select your identity document type.",
            );
        }

        if (!payload.identityDocumentNumber) {
            throw new Error(
                "Please enter your identity document number.",
            );
        }

        let response;

        if (!kyc) {
            response = await api.post("/kyc", payload);
        } else {
            response = await api.patch("/kyc", payload);
        }

        const updatedKyc =
            response?.data?.data?.kyc;

        if (updatedKyc) {
            setKyc(updatedKyc);
        }

        return updatedKyc;
    };

    /*
    =====================================================
    SAVE INFORMATION
    =====================================================
    */

    const handleSaveInformation = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await saveKycInformation();

            setSuccess(
                "Your KYC information has been saved successfully.",
            );
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Unable to save your KYC information.",
            );
        } finally {
            setSaving(false);
        }
    };

    /*
    =====================================================
    UPLOAD DOCUMENTS
    =====================================================
    */

    const handleUploadDocuments = async () => {
        if (!kyc) {
            throw new Error(
                "Please save your KYC information first.",
            );
        }

        if (!files.documentFront) {
            throw new Error(
                "Please upload the front of your identity document.",
            );
        }

        if (
            requiresBackDocument &&
            !files.documentBack
        ) {
            throw new Error(
                "Please upload the back of your identity document.",
            );
        }

        if (!files.selfie) {
            throw new Error(
                "Please upload your selfie.",
            );
        }

        const formData = new FormData();

        formData.append(
            "documentFront",
            files.documentFront,
        );

        if (
            requiresBackDocument &&
            files.documentBack
        ) {
            formData.append(
                "documentBack",
                files.documentBack,
            );
        }

        formData.append(
            "selfie",
            files.selfie,
        );

        /*
         * Do not manually set Content-Type.
         * Axios/browser will create the multipart boundary.
         */

        const response = await api.post(
            "/kyc/documents",
            formData,
        );

        return response?.data;
    };

    /*
    =====================================================
    UPLOAD ONLY
    =====================================================
    */

    const handleUpload = async () => {
        try {
            setUploading(true);
            setError("");
            setSuccess("");

            await handleUploadDocuments();

            setSuccess(
                "Your KYC documents were uploaded successfully.",
            );

            setFiles({
                documentFront: null,
                documentBack: null,
                selfie: null,
            });

            await fetchKyc();
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Unable to upload your documents.",
            );
        } finally {
            setUploading(false);
        }
    };

    /*
    =====================================================
    FINAL SUBMISSION
    =====================================================
    */

    const handleSubmitKyc = async () => {
        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            /*
             * Save the information first.
             */
            await saveKycInformation();

            /*
             * Upload selected files.
             */
            if (
                files.documentFront ||
                files.documentBack ||
                files.selfie
            ) {
                await handleUploadDocuments();
            }

            /*
             * Ask backend to validate everything
             * and move KYC to under_review.
             */
            const response = await api.post(
                "/kyc/submit",
            );

            const submittedKyc =
                response?.data?.data?.kyc;

            if (submittedKyc) {
                setKyc(submittedKyc);
            } else {
                await fetchKyc();
            }

            setFiles({
                documentFront: null,
                documentBack: null,
                selfie: null,
            });

            setSuccess(
                response?.data?.message ||
                    "Your KYC has been submitted successfully and is now under review.",
            );
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Unable to submit your KYC.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    /*
    =====================================================
    LOADING
    =====================================================
    */

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-brand-400 text-3xl mx-auto" />

                    <p className="text-surface-400 mt-4">
                        Loading your KYC information...
                    </p>
                </div>
            </div>
        );
    }

    /*
    =====================================================
    STATUS DISPLAY
    =====================================================
    */

    const renderStatus = () => {
        if (isVerified) {
            return (
                <div className="rounded-2xl border border-success-500/20 bg-success-500/10 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-success-500/10 flex items-center justify-center shrink-0">
                            <FaCircleCheck className="text-success-400 text-xl" />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Identity Verified
                            </h2>

                            <p className="text-sm text-surface-400 mt-1">
                                Your identity has been successfully
                                verified.
                            </p>

                            {kyc?.verifiedAt && (
                                <p className="text-xs text-surface-500 mt-2">
                                    Verified on{" "}
                                    {new Date(
                                        kyc.verifiedAt,
                                    ).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        if (isUnderReview) {
            return (
                <div className="rounded-2xl border border-warning-500/20 bg-warning-500/10 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-warning-500/10 flex items-center justify-center shrink-0">
                            <FaClock className="text-warning-400 text-xl" />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Verification Under Review
                            </h2>

                            <p className="text-sm text-surface-400 mt-1">
                                Your documents have been submitted
                                and are currently being reviewed.
                            </p>

                            {kyc?.submittedAt && (
                                <p className="text-xs text-surface-500 mt-2">
                                    Submitted on{" "}
                                    {new Date(
                                        kyc.submittedAt,
                                    ).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        if (isRejected) {
            return (
                <div className="rounded-2xl border border-danger-500/20 bg-danger-500/10 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-danger-500/10 flex items-center justify-center shrink-0">
                            <FaTriangleExclamation className="text-danger-400 text-xl" />
                        </div>

                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-white">
                                KYC Requires Attention
                            </h2>

                            <p className="text-sm text-surface-400 mt-1">
                                Your previous KYC submission was
                                rejected. Please review the reason and
                                update your information before
                                resubmitting.
                            </p>

                            {kyc?.rejectionReason && (
                                <div className="mt-4 rounded-xl bg-surface-900/60 border border-danger-500/10 p-4">
                                    <p className="text-xs text-surface-500">
                                        Rejection reason
                                    </p>

                                    <p className="text-sm text-danger-300 mt-1">
                                        {kyc.rejectionReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="rounded-2xl border border-brand-500/20 bg-brand-500/10 p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                        <FaIdCard className="text-brand-400 text-xl" />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Identity Verification Required
                        </h2>

                        <p className="text-sm text-surface-400 mt-1">
                            Complete your identity verification to
                            access all platform features.
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    /*
    =====================================================
    FILE COMPONENT
    =====================================================
    */

    const DocumentUpload = ({
        title,
        description,
        field,
        required = true,
    }) => {
        const selectedFile = files[field];

        return (
            <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                    {title}

                    {required && (
                        <span className="text-danger-400 ml-1">
                            *
                        </span>
                    )}
                </label>

                <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-surface-700 hover:border-brand-500/50 rounded-xl bg-surface-800/50 p-6 transition">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                                {selectedFile ? (
                                    <FaCheck className="text-success-400" />
                                ) : (
                                    <FaUpload className="text-brand-400" />
                                )}
                            </div>

                            <div className="min-w-0">
                                {selectedFile ? (
                                    <>
                                        <p className="text-sm font-medium text-white truncate">
                                            {selectedFile.name}
                                        </p>

                                        <p className="text-xs text-success-400 mt-1">
                                            Document selected
                                        </p>

                                        <p className="text-xs text-surface-500 mt-1">
                                            {(
                                                selectedFile.size /
                                                1024 /
                                                1024
                                            ).toFixed(2)}{" "}
                                            MB
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-surface-300">
                                            Click to select a file
                                        </p>

                                        <p className="text-xs text-surface-500 mt-1">
                                            {description}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={(e) =>
                            handleFileChange(e, field)
                        }
                        className="hidden"
                    />
                </label>
            </div>
        );
    };

    /*
    =====================================================
    PAGE
    =====================================================
    */

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            {/* HEADER */}

            <div>
                <p className="text-sm text-brand-400 font-medium">
                    Account Verification
                </p>

                <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    KYC Verification
                </h1>

                <p className="text-surface-400 mt-2 max-w-2xl">
                    Verify your identity to protect your account
                    and comply with applicable financial and
                    regulatory requirements.
                </p>
            </div>

            {/* STATUS */}

            {renderStatus()}

            {/* SUCCESS */}

            {success && (
                <div className="rounded-xl border border-success-500/20 bg-success-500/10 px-5 py-4">
                    <p className="text-sm text-success-300">
                        {success}
                    </p>
                </div>
            )}

            {/* ERROR */}

            {error && (
                <div className="rounded-xl border border-danger-500/20 bg-danger-500/10 px-5 py-4">
                    <p className="text-sm text-danger-300">
                        {error}
                    </p>
                </div>
            )}

            {/* VERIFIED */}

            {isVerified && (
                <div className="bg-surface-900 border border-surface-700 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-success-500/10 flex items-center justify-center mx-auto">
                        <FaCircleCheck className="text-success-400 text-3xl" />
                    </div>

                    <h2 className="text-xl font-semibold text-white mt-5">
                        Your account is verified
                    </h2>

                    <p className="text-surface-400 mt-2 max-w-lg mx-auto">
                        Your identity verification has been
                        completed successfully. No further action
                        is required.
                    </p>
                </div>
            )}

            {/* UNDER REVIEW */}

            {isUnderReview && (
                <div className="bg-surface-900 border border-surface-700 rounded-2xl p-8">
                    <div className="flex items-center gap-4">
                        <FaFileShield className="text-warning-400 text-2xl shrink-0" />

                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Your documents are being reviewed
                            </h2>

                            <p className="text-sm text-surface-400 mt-1">
                                You don't need to submit anything else
                                at this time. We'll update your KYC
                                status after review.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* EDITABLE KYC AREA */}

            {canEdit && (
                <>
                    {/* PERSONAL INFORMATION */}

                    <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 sm:p-8">
                        <div className="flex items-start gap-4 mb-7">
                            <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                                <FaIdCard className="text-brand-400" />
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Personal Information
                                </h2>

                                <p className="text-sm text-surface-400 mt-1">
                                    Enter your details exactly as they
                                    appear on your identity document.
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={handleSaveInformation}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* FIRST NAME */}

                                <div>
                                    <label className="block text-sm font-medium text-surface-300 mb-2">
                                        First Name
                                    </label>

                                    <input
                                        type="text"
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        disabled={!canEdit}
                                        placeholder="First name"
                                        className="w-full rounded-lg border border-surface-700 bg-surface-800 text-white px-4 py-3 outline-none focus:border-brand-500 disabled:opacity-50"
                                    />
                                </div>

                                {/* LAST NAME */}

                                <div>
                                    <label className="block text-sm font-medium text-surface-300 mb-2">
                                        Last Name
                                    </label>

                                    <input
                                        type="text"
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        disabled={!canEdit}
                                        placeholder="Last name"
                                        className="w-full rounded-lg border border-surface-700 bg-surface-800 text-white px-4 py-3 outline-none focus:border-brand-500 disabled:opacity-50"
                                    />
                                </div>

                                {/* DATE OF BIRTH */}

                                <div>
                                    <label className="block text-sm font-medium text-surface-300 mb-2">
                                        Date of Birth
                                    </label>

                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={form.dateOfBirth}
                                        onChange={handleChange}
                                        disabled={!canEdit}
                                        className="w-full rounded-lg border border-surface-700 bg-surface-800 text-white px-4 py-3 outline-none focus:border-brand-500 disabled:opacity-50"
                                    />
                                </div>

                                {/* COUNTRY */}

                                <div>
                                    <label className="block text-sm font-medium text-surface-300 mb-2">
                                        Country
                                    </label>

                                    <input
                                        type="text"
                                        name="country"
                                        value={form.country}
                                        onChange={handleChange}
                                        disabled={!canEdit}
                                        placeholder="Country"
                                        className="w-full rounded-lg border border-surface-700 bg-surface-800 text-white px-4 py-3 outline-none focus:border-brand-500 disabled:opacity-50"
                                    />
                                </div>

                                {/* ADDRESS */}

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-surface-300 mb-2">
                                        Address
                                    </label>

                                    <input
                                        type="text"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        disabled={!canEdit}
                                        placeholder="Residential address"
                                        className="w-full rounded-lg border border-surface-700 bg-surface-800 text-white px-4 py-3 outline-none focus:border-brand-500 disabled:opacity-50"
                                    />
                                </div>

                                {/* CITY */}

                                <div>
                                    <label className="block text-sm font-medium text-surface-300 mb-2">
                                        City
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        disabled={!canEdit}
                                        placeholder="City"
                                        className="w-full rounded-lg border border-surface-700 bg-surface-800 text-white px-4 py-3 outline-none focus:border-brand-500 disabled:opacity-50"
                                    />
                                </div>

                                {/* STATE */}

                                <div>
                                    <label className="block text-sm font-medium text-surface-300 mb-2">
                                        State / Province
                                    </label>

                                    <input
                                        type="text"
                                        name="state"
                                        value={form.state}
                                        onChange={handleChange}
                                        disabled={!canEdit}
                                        placeholder="State or province"
                                        className="w-full rounded-lg border border-surface-700 bg-surface-800 text-white px-4 py-3 outline-none focus:border-brand-500 disabled:opacity-50"
                                    />
                                </div>

                                {/* POSTAL CODE */}

                                <div>
                                    <label className="block text-sm font-medium text-surface-300 mb-2">
                                        Postal Code
                                        <span className="text-surface-600 ml-1">
                                            (optional)
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={form.postalCode}
                                        onChange={handleChange}
                                        disabled={!canEdit}
                                        placeholder="Postal code"
                                        className="w-full rounded-lg border border-surface-700 bg-surface-800 text-white px-4 py-3 outline-none focus:border-brand-500 disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            {/* DOCUMENT TYPE */}

                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-2">
                                    Identity Document
                                </label>

                                <select
                                    name="identityDocumentType"
                                    value={form.identityDocumentType}
                                    onChange={handleChange}
                                    disabled={!canEdit}
                                    className="w-full rounded-lg border border-surface-700 bg-surface-800 text-white px-4 py-3 outline-none focus:border-brand-500 disabled:opacity-50"
                                >
                                    <option value="">
                                        Select identity document
                                    </option>

                                    <option value="passport">
                                        International Passport
                                    </option>

                                    <option value="national_id">
                                        National ID
                                    </option>

                                    <option value="drivers_license">
                                        Driver's License
                                    </option>

                                    <option value="voters_card">
                                        Voter's Card
                                    </option>
                                </select>
                            </div>

                            {/* DOCUMENT NUMBER */}

                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-2">
                                    Identity Document Number
                                </label>

                                <input
                                    type="text"
                                    name="identityDocumentNumber"
                                    value={form.identityDocumentNumber}
                                    onChange={handleChange}
                                    disabled={!canEdit}
                                    placeholder={
                                        kyc
                                            ? "Re-enter document number"
                                            : "Enter document number"
                                    }
                                    className="w-full rounded-lg border border-surface-700 bg-surface-800 text-white px-4 py-3 outline-none focus:border-brand-500 disabled:opacity-50"
                                />

                                {kyc && (
                                    <p className="text-xs text-surface-500 mt-2">
                                        For security, your existing document
                                        number is not displayed. Re-enter it
                                        when updating or resubmitting your KYC.
                                    </p>
                                )}
                            </div>

                            {/* SAVE */}

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        Save Information
                                        <FaArrowRight />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* DOCUMENT UPLOAD */}

                    <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 sm:p-8">
                        <div className="flex items-start gap-4 mb-7">
                            <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                                <FaUpload className="text-brand-400" />
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Identity Documents
                                </h2>

                                <p className="text-sm text-surface-400 mt-1">
                                    Upload clear, readable copies of your
                                    identity documents.
                                </p>

                                <p className="text-xs text-surface-500 mt-2">
                                    Accepted formats: JPEG, PNG and WebP.
                                    Maximum size: 5 MB per file.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <DocumentUpload
                                title="Document Front"
                                description="JPEG, PNG or WebP — max 5 MB"
                                field="documentFront"
                            />

                            {requiresBackDocument && (
                                <DocumentUpload
                                    title="Document Back"
                                    description="JPEG, PNG or WebP — max 5 MB"
                                    field="documentBack"
                                />
                            )}

                            <DocumentUpload
                                title="Selfie"
                                description="Clear photo of yourself — max 5 MB"
                                field="selfie"
                            />
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={
                                    uploading || submitting
                                }
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-surface-600 text-surface-200 hover:bg-surface-800 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <FaUpload />
                                        Upload Documents
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* SUBMIT */}

                    <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 sm:p-8">
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-success-500/10 flex items-center justify-center shrink-0">
                                <FaFileShield className="text-success-400" />
                            </div>

                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-white">
                                    Submit for Verification
                                </h2>

                                <p className="text-sm text-surface-400 mt-1">
                                    Once all required information and
                                    documents are provided, submit your KYC
                                    application for review.
                                </p>

                                <div className="flex items-start gap-3 mt-5 rounded-xl bg-surface-800/60 p-4">
                                    <FaLock className="text-brand-400 mt-1 shrink-0" />

                                    <p className="text-xs text-surface-500 leading-5">
                                        Your identity information and
                                        documents are sensitive information.
                                        Only authorized personnel should have
                                        access to them.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSubmitKyc}
                                    disabled={
                                        submitting ||
                                        saving ||
                                        uploading
                                    }
                                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit KYC
                                            <FaArrowRight />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* SECURITY INFORMATION */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface-900 border border-surface-700 rounded-xl p-5">
                    <FaShieldHalved className="text-brand-400 text-xl mb-3" />

                    <h3 className="text-white font-semibold">
                        Secure Verification
                    </h3>

                    <p className="text-sm text-surface-500 mt-1">
                        Your verification information is handled as
                        sensitive account information.
                    </p>
                </div>

                <div className="bg-surface-900 border border-surface-700 rounded-xl p-5">
                    <FaFileShield className="text-brand-400 text-xl mb-3" />

                    <h3 className="text-white font-semibold">
                        Document Protection
                    </h3>

                    <p className="text-sm text-surface-500 mt-1">
                        Documents are stored separately from your
                        normal profile information.
                    </p>
                </div>

                <div className="bg-surface-900 border border-surface-700 rounded-xl p-5">
                    <FaClock className="text-brand-400 text-xl mb-3" />

                    <h3 className="text-white font-semibold">
                        Manual Review
                    </h3>

                    <p className="text-sm text-surface-500 mt-1">
                        Submitted applications are reviewed before
                        they are marked as verified.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default KYC;