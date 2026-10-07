import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    FaArrowLeft,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
} from "react-icons/fa";
import api from "../../library/api";

const DepositDetails = () => {
    const { depositId } = useParams();

    const [deposit, setDeposit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDeposit = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `/deposits/${depositId}`
                );

                setDeposit(
                    response?.data?.data || null
                );
            } catch (err) {
                console.error(
                    "Fetch deposit error:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Unable to load this deposit."
                );
            } finally {
                setLoading(false);
            }
        };

        if (depositId) {
            fetchDeposit();
        }
    }, [depositId]);

    const getStatusIcon = () => {
        switch (deposit?.status) {
            case "successful":
                return (
                    <FaCheckCircle className="text-green-400" />
                );

            case "rejected":
            case "cancelled":
                return (
                    <FaTimesCircle className="text-red-400" />
                );

            default:
                return (
                    <FaClock className="text-yellow-400" />
                );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 p-6 text-white">
                Loading deposit...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 p-6 text-white">
                <Link
                    to="/user/deposits"
                    className="mb-6 inline-flex items-center gap-2 text-cyan-400"
                >
                    <FaArrowLeft />
                    Back to Deposits
                </Link>

                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
                    {error}
                </div>
            </div>
        );
    }

    if (!deposit) {
        return (
            <div className="min-h-screen bg-slate-950 p-6 text-white">
                Deposit not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 text-white">
            <div className="mx-auto max-w-5xl">
                <Link
                    to="/user/deposits"
                    className="mb-6 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                >
                    <FaArrowLeft />
                    Back to Deposits
                </Link>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold">
                        Deposit Details
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Reference: {deposit.reference}
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="mb-5 text-lg font-semibold">
                            Deposit Information
                        </h2>

                        <div className="space-y-4">
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-400">
                                    Amount
                                </span>

                                <span className="font-semibold">
                                    {deposit.amount}{" "}
                                    {deposit.currency}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-slate-400">
                                    Status
                                </span>

                                <span className="flex items-center gap-2 capitalize">
                                    {getStatusIcon()}
                                    {deposit.status?.replace(
                                        /_/g,
                                        " "
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-slate-400">
                                    Payment Type
                                </span>

                                <span className="capitalize">
                                    {deposit.paymentType?.replace(
                                        /_/g,
                                        " "
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-slate-400">
                                    Created
                                </span>

                                <span>
                                    {deposit.createdAt
                                        ? new Date(
                                            deposit.createdAt
                                        ).toLocaleString()
                                        : "-"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="mb-5 text-lg font-semibold">
                            Payment Information
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-400">
                                    Payment Method
                                </p>

                                <p className="mt-1">
                                    {deposit.paymentMethod
                                        ?.name || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">
                                    Transaction Reference
                                </p>

                                <p className="mt-1 break-all">
                                    {deposit.transactionReference ||
                                        "Not submitted"}
                                </p>
                            </div>

                            {deposit.userNote && (
                                <div>
                                    <p className="text-sm text-slate-400">
                                        Note
                                    </p>

                                    <p className="mt-1">
                                        {deposit.userNote}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepositDetails;