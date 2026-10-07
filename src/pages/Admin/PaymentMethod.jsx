import { useEffect, useState } from "react";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaPowerOff,
    FaUniversity,
    FaBitcoin,
    FaMobileAlt,
    FaCreditCard,
    FaTimes,
    FaSave,
    FaSpinner,
    FaCheckCircle,
    FaExclamationCircle,
} from "react-icons/fa";

import api from "../../library/api";

const CURRENCIES = ["USD", "NGN", "CAD", "EUR"];

const PAYMENT_TYPES = [
    {
        value: "bank_transfer",
        label: "Bank Transfer",
        icon: FaUniversity,
    },
    {
        value: "crypto",
        label: "Crypto",
        icon: FaBitcoin,
    },
    {
        value: "mobile_money",
        label: "Mobile Money",
        icon: FaMobileAlt,
    },
    {
        value: "other",
        label: "Other",
        icon: FaCreditCard,
    },
];

const emptyForm = {
    name: "",
    type: "bank_transfer",
    currency: "NGN",

    bankName: "",
    accountName: "",
    accountNumber: "",
    routingNumber: "",
    iban: "",
    swiftCode: "",

    network: "",
    walletAddress: "",

    instructions: "",

    displayOrder: 0,
    status: "active",
};

const PaymentMethods = () => {
    const [paymentMethods, setPaymentMethods] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [toggling, setToggling] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /*
    =====================================================
    LOAD PAYMENT METHODS
    =====================================================
    */

    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/payment-methods");

            const methods =
                response?.data?.data?.paymentMethods || [];

            setPaymentMethods(
                Array.isArray(methods) ? methods : []
            );
        } catch (err) {
            console.error(
                "Failed to load payment methods:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Unable to load payment methods."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    /*
    =====================================================
    FORM CHANGE
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
    OPEN CREATE
    =====================================================
    */

    const openCreateModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setSuccess("");
        setShowModal(true);
    };

    /*
    =====================================================
    OPEN EDIT
    =====================================================
    */

    const openEditModal = (method) => {
        setEditingId(method._id);

        setForm({
            name: method.name || "",
            type: method.type || "bank_transfer",
            currency: method.currency || "NGN",

            bankName: method.bankName || "",
            accountName: method.accountName || "",
            accountNumber: method.accountNumber || "",
            routingNumber: method.routingNumber || "",
            iban: method.iban || "",
            swiftCode: method.swiftCode || "",

            network: method.network || "",
            walletAddress: method.walletAddress || "",

            instructions: method.instructions || "",

            displayOrder: method.displayOrder ?? 0,
            status: method.status || "active",
        });

        setError("");
        setSuccess("");
        setShowModal(true);
    };

    /*
    =====================================================
    CLOSE MODAL
    =====================================================
    */

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingId(null);
        setForm(emptyForm);
        setError("");
    };

    /*
    =====================================================
    SAVE PAYMENT METHOD
    =====================================================
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const payload = {
                name: form.name.trim(),
                type: form.type,
                currency: form.currency,

                bankName: form.bankName.trim() || null,
                accountName: form.accountName.trim() || null,
                accountNumber:
                    form.accountNumber.trim() || null,

                routingNumber:
                    form.routingNumber.trim() || null,

                iban: form.iban.trim() || null,

                swiftCode:
                    form.swiftCode.trim() || null,

                network: form.network.trim() || null,

                walletAddress:
                    form.walletAddress.trim() || null,

                instructions:
                    form.instructions.trim() || "",

                displayOrder:
                    Number(form.displayOrder) || 0,

                status: form.status,
            };

            if (editingId) {
                await api.patch(
                    `/payment-methods/${editingId}`,
                    payload
                );

                setSuccess(
                    "Payment method updated successfully."
                );
            } else {
                await api.post(
                    "/payment-methods",
                    payload
                );

                setSuccess(
                    "Payment method created successfully."
                );
            }

            await fetchPaymentMethods();

            setTimeout(() => {
                setShowModal(false);
                setEditingId(null);
                setForm(emptyForm);
                setSuccess("");
            }, 800);
        } catch (err) {
            console.error(
                "Payment method save error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Unable to save payment method."
            );
        } finally {
            setSaving(false);
        }
    };

    /*
    =====================================================
    TOGGLE ACTIVE / INACTIVE
    =====================================================
    */

    const toggleStatus = async (method) => {
        try {
            setToggling(method._id);
            setError("");

            const newStatus =
                method.status === "active"
                    ? "inactive"
                    : "active";

            await api.patch(
                `/payment-methods/${method._id}`,
                {
                    status: newStatus,
                }
            );

            await fetchPaymentMethods();
        } catch (err) {
            console.error(
                "Toggle payment method error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Unable to update payment method."
            );
        } finally {
            setToggling(null);
        }
    };

    /*
    =====================================================
    DELETE / DEACTIVATE
    =====================================================
    */

    const deleteMethod = async (method) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate "${method.name}"?`
        );

        if (!confirmed) return;

        try {
            setDeleting(method._id);
            setError("");

            await api.delete(
                `/payment-methods/${method._id}`
            );

            setSuccess(
                "Payment method deactivated successfully."
            );

            await fetchPaymentMethods();

            setTimeout(() => {
                setSuccess("");
            }, 2500);
        } catch (err) {
            console.error(
                "Delete payment method error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Unable to deactivate payment method."
            );
        } finally {
            setDeleting(null);
        }
    };

    /*
    =====================================================
    HELPERS
    =====================================================
    */

    const getTypeIcon = (type) => {
        const item = PAYMENT_TYPES.find(
            (item) => item.value === type
        );

        return item?.icon || FaCreditCard;
    };

    const getTypeLabel = (type) => {
        const item = PAYMENT_TYPES.find(
            (item) => item.value === type
        );

        return item?.label || type;
    };

    /*
    =====================================================
    RENDER
    =====================================================
    */

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 lg:p-8">

            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            Payment Methods
                        </h1>

                        <p className="text-slate-400 mt-1">
                            Create and manage the payment
                            methods users can use to fund
                            their accounts.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition"
                    >
                        <FaPlus />
                        Add Payment Method
                    </button>

                </div>

                {/* SUCCESS */}
                {success && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-400">
                        <FaCheckCircle />
                        {success}
                    </div>
                )}

                {/* ERROR */}
                {error && !showModal && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
                        <FaExclamationCircle />
                        {error}
                    </div>
                )}

                {/* LOADING */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="flex items-center gap-3 text-slate-400">
                            <FaSpinner className="animate-spin" />
                            Loading payment methods...
                        </div>
                    </div>
                ) : paymentMethods.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

                        <FaCreditCard className="mx-auto text-4xl text-slate-600 mb-4" />

                        <h2 className="text-xl font-semibold mb-2">
                            No payment methods
                        </h2>

                        <p className="text-slate-400 mb-6">
                            Create your first payment
                            method so users can make
                            deposits.
                        </p>

                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
                        >
                            <FaPlus />
                            Create Payment Method
                        </button>

                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                        {paymentMethods.map((method) => {
                            const TypeIcon =
                                getTypeIcon(method.type);

                            return (
                                <div
                                    key={method._id}
                                    className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden"
                                >

                                    {/* CARD HEADER */}
                                    <div className="p-5 border-b border-slate-800">

                                        <div className="flex items-start justify-between gap-4">

                                            <div className="flex items-center gap-4">

                                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                                                    <TypeIcon />
                                                </div>

                                                <div>
                                                    <h2 className="font-semibold text-lg">
                                                        {method.name}
                                                    </h2>

                                                    <p className="text-sm text-slate-400">
                                                        {getTypeLabel(
                                                            method.type
                                                        )}
                                                        {" • "}
                                                        {
                                                            method.currency
                                                        }
                                                    </p>
                                                </div>

                                            </div>

                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    method.status ===
                                                    "active"
                                                        ? "bg-emerald-500/10 text-emerald-400"
                                                        : "bg-slate-700 text-slate-400"
                                                }`}
                                            >
                                                {method.status ===
                                                "active"
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>

                                        </div>

                                    </div>

                                    {/* DETAILS */}
                                    <div className="p-5 space-y-2">

                                        {method.type ===
                                            "bank_transfer" && (
                                            <>
                                                <Detail
                                                    label="Bank"
                                                    value={
                                                        method.bankName
                                                    }
                                                />

                                                <Detail
                                                    label="Account Name"
                                                    value={
                                                        method.accountName
                                                    }
                                                />

                                                <Detail
                                                    label="Account Number"
                                                    value={
                                                        method.accountNumber
                                                    }
                                                />

                                                <Detail
                                                    label="Routing Number"
                                                    value={
                                                        method.routingNumber
                                                    }
                                                />

                                                <Detail
                                                    label="IBAN"
                                                    value={
                                                        method.iban
                                                    }
                                                />

                                                <Detail
                                                    label="SWIFT"
                                                    value={
                                                        method.swiftCode
                                                    }
                                                />
                                            </>
                                        )}

                                        {method.type ===
                                            "crypto" && (
                                            <>
                                                <Detail
                                                    label="Network"
                                                    value={
                                                        method.network
                                                    }
                                                />

                                                <Detail
                                                    label="Wallet Address"
                                                    value={
                                                        method.walletAddress
                                                    }
                                                />
                                            </>
                                        )}

                                        {method.type ===
                                            "mobile_money" && (
                                            <>
                                                <Detail
                                                    label="Account Name"
                                                    value={
                                                        method.accountName
                                                    }
                                                />

                                                <Detail
                                                    label="Account Number"
                                                    value={
                                                        method.accountNumber
                                                    }
                                                />
                                            </>
                                        )}

                                        {method.instructions && (
                                            <div className="pt-3">
                                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                                                    Instructions
                                                </p>

                                                <p className="text-sm text-slate-300 whitespace-pre-line">
                                                    {
                                                        method.instructions
                                                    }
                                                </p>
                                            </div>
                                        )}

                                    </div>

                                    {/* ACTIONS */}
                                    <div className="p-4 border-t border-slate-800 flex flex-wrap gap-2">

                                        <button
                                            onClick={() =>
                                                openEditModal(
                                                    method
                                                )
                                            }
                                            className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium"
                                        >
                                            <FaEdit />
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                toggleStatus(
                                                    method
                                                )
                                            }
                                            disabled={
                                                toggling ===
                                                method._id
                                            }
                                            className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${
                                                method.status ===
                                                "active"
                                                    ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                                    : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                            }`}
                                        >
                                            {toggling ===
                                            method._id ? (
                                                <FaSpinner className="animate-spin" />
                                            ) : (
                                                <FaPowerOff />
                                            )}

                                            {method.status ===
                                            "active"
                                                ? "Deactivate"
                                                : "Activate"}
                                        </button>

                                        <button
                                            onClick={() =>
                                                deleteMethod(
                                                    method
                                                )
                                            }
                                            disabled={
                                                deleting ===
                                                method._id
                                            }
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium"
                                        >
                                            {deleting ===
                                            method._id ? (
                                                <FaSpinner className="animate-spin" />
                                            ) : (
                                                <FaTrash />
                                            )}
                                        </button>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}
            </div>

            {/* =====================================================
                CREATE / EDIT MODAL
            ===================================================== */}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">

                    <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

                        {/* MODAL HEADER */}
                        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900">

                            <div>
                                <h2 className="text-xl font-bold">
                                    {editingId
                                        ? "Edit Payment Method"
                                        : "Create Payment Method"}
                                </h2>

                                <p className="text-sm text-slate-400 mt-1">
                                    Configure the payment
                                    destination users will
                                    receive when making a
                                    deposit.
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
                            >
                                <FaTimes />
                            </button>

                        </div>

                        {/* FORM */}
                        <form
                            onSubmit={handleSubmit}
                            className="p-5 space-y-7"
                        >

                            {error && (
                                <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
                                    <FaExclamationCircle />
                                    {error}
                                </div>
                            )}

                            {/* BASIC */}
                            <section>

                                <h3 className="font-semibold text-white mb-4">
                                    Basic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <Input
                                        label="Payment Method Name"
                                        name="name"
                                        value={form.name}
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. GTBank NGN Transfer"
                                        required
                                    />

                                    <Select
                                        label="Payment Type"
                                        name="type"
                                        value={form.type}
                                        onChange={
                                            handleChange
                                        }
                                        options={PAYMENT_TYPES.map(
                                            (item) => ({
                                                value:
                                                    item.value,
                                                label:
                                                    item.label,
                                            })
                                        )}
                                    />

                                    <Select
                                        label="Currency"
                                        name="currency"
                                        value={
                                            form.currency
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        options={CURRENCIES.map(
                                            (currency) => ({
                                                value:
                                                    currency,
                                                label:
                                                    currency,
                                            })
                                        )}
                                    />

                                    <Input
                                        label="Display Order"
                                        name="displayOrder"
                                        type="number"
                                        value={
                                            form.displayOrder
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0"
                                    />

                                </div>

                            </section>

                            {/* BANK */}
                            {form.type ===
                                "bank_transfer" && (
                                <section>

                                    <h3 className="font-semibold text-white mb-4">
                                        Bank Details
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        <Input
                                            label="Bank Name"
                                            name="bankName"
                                            value={
                                                form.bankName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. GTBank"
                                        />

                                        <Input
                                            label="Account Name"
                                            name="accountName"
                                            value={
                                                form.accountName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Account holder name"
                                        />

                                        <Input
                                            label="Account Number"
                                            name="accountNumber"
                                            value={
                                                form.accountNumber
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Account number"
                                        />

                                        <Input
                                            label="Routing Number"
                                            name="routingNumber"
                                            value={
                                                form.routingNumber
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Optional"
                                        />

                                        <Input
                                            label="IBAN"
                                            name="iban"
                                            value={form.iban}
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Optional"
                                        />

                                        <Input
                                            label="SWIFT Code"
                                            name="swiftCode"
                                            value={
                                                form.swiftCode
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Optional"
                                        />

                                    </div>

                                </section>
                            )}

                            {/* CRYPTO */}
                            {form.type === "crypto" && (
                                <section>

                                    <h3 className="font-semibold text-white mb-4">
                                        Crypto Details
                                    </h3>

                                    <div className="space-y-4">

                                        <Input
                                            label="Network"
                                            name="network"
                                            value={
                                                form.network
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. TRC20"
                                        />

                                        <Input
                                            label="Wallet Address"
                                            name="walletAddress"
                                            value={
                                                form.walletAddress
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Wallet address"
                                        />

                                    </div>

                                </section>
                            )}

                            {/* MOBILE MONEY */}
                            {form.type ===
                                "mobile_money" && (
                                <section>

                                    <h3 className="font-semibold text-white mb-4">
                                        Mobile Money Details
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        <Input
                                            label="Account Name"
                                            name="accountName"
                                            value={
                                                form.accountName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                        <Input
                                            label="Account Number"
                                            name="accountNumber"
                                            value={
                                                form.accountNumber
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                </section>
                            )}

                            {/* INSTRUCTIONS */}
                            <section>

                                <h3 className="font-semibold text-white mb-4">
                                    Payment Instructions
                                </h3>

                                <textarea
                                    name="instructions"
                                    value={
                                        form.instructions
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows={5}
                                    placeholder="Tell users exactly what they should do after selecting this payment method..."
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-500 resize-none"
                                />

                            </section>

                            {/* STATUS */}
                            <section>

                                <h3 className="font-semibold text-white mb-4">
                                    Status
                                </h3>

                                <Select
                                    label="Payment Method Status"
                                    name="status"
                                    value={form.status}
                                    onChange={
                                        handleChange
                                    }
                                    options={[
                                        {
                                            value: "active",
                                            label: "Active",
                                        },
                                        {
                                            value: "inactive",
                                            label: "Inactive",
                                        },
                                    ]}
                                />

                            </section>

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-3 pt-5 border-t border-slate-800">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold"
                                >
                                    {saving ? (
                                        <FaSpinner className="animate-spin" />
                                    ) : (
                                        <FaSave />
                                    )}

                                    {editingId
                                        ? "Save Changes"
                                        : "Create Payment Method"}
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

/*
=====================================================
INPUT
=====================================================
*/

const Input = ({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder = "",
    required = false,
    min,
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                {label}
            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                min={min}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-500"
            />
        </div>
    );
};

/*
=====================================================
SELECT
=====================================================
*/

const Select = ({
    label,
    name,
    value,
    onChange,
    options,
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                {label}
            </label>

            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

/*
=====================================================
DETAIL
=====================================================
*/

const Detail = ({ label, value }) => {
    if (!value) return null;

    return (
        <div className="flex justify-between gap-4 py-2 border-b border-slate-800 last:border-0">
            <span className="text-sm text-slate-500">
                {label}
            </span>

            <span className="text-sm text-slate-200 text-right break-all">
                {value}
            </span>
        </div>
    );
};

export default PaymentMethods;