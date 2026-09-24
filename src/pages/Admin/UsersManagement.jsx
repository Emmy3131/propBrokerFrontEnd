import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaUserShield,
  FaSearch,
  FaFilter,
  FaEye,
  FaEllipsisV,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBan,
  FaUserLock,
  FaChevronLeft,
  FaChevronRight,
  FaIdCard,
  FaRedo,
  FaShieldAlt,
} from "react-icons/fa";

import api from "../../library/api";

const AdminUserManagement = () => {
  const navigate = useNavigate();

  // =====================================================
  // USERS
  // =====================================================

  const [users, setUsers] = useState([]);

  // =====================================================
  // LOADING / ERROR
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FILTERS
  // =====================================================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [kycFilter, setKycFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    totalUsers: 0,
    currentPage: 1,
    perPage: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // =====================================================
  // STATISTICS
  // =====================================================

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    suspendedUsers: 0,
    blockedUsers: 0,
    closedUsers: 0,
    verifiedEmails: 0,
    usersWith2FA: 0,
  });

  // =====================================================
  // MENU
  // =====================================================

  const [openMenu, setOpenMenu] = useState(null);

  // =====================================================
  // FETCH USERS
  // =====================================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 20,
      };

      // Search
      if (search.trim()) {
        params.search = search.trim();
      }

      // Status
      if (statusFilter) {
        params.status = statusFilter;
      }

      // Role
      if (roleFilter) {
        params.role = roleFilter;
      }

      // KYC
      if (kycFilter) {
        params.kycStatus = kycFilter;
      }

      // Email verification
      if (emailFilter !== "") {
        params.emailVerified = emailFilter;
      }

      const response = await api.get("/admin/users", {
        params,
      });

      const responseData = response.data;

      setUsers(responseData?.data?.users || []);

      setPagination(
        responseData?.pagination || {
          totalUsers: 0,
          currentPage: 1,
          perPage: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (error) {
      console.error("Failed to fetch users:", error);

      setError(
        error.response?.data?.message ||
        "Failed to load users. Please try again."
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH USER STATISTICS
  // =====================================================

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/users/stats");

      setStats(
        response.data?.data || {
          totalUsers: 0,
          activeUsers: 0,
          pendingUsers: 0,
          suspendedUsers: 0,
          blockedUsers: 0,
          closedUsers: 0,
          verifiedEmails: 0,
          usersWith2FA: 0,
        }
      );
    } catch (error) {
      console.error("Failed to fetch user statistics:", error);
    }
  };

  // =====================================================
  // INITIAL / FILTER FETCH
  // =====================================================

  useEffect(() => {
    fetchUsers();
  }, [
    page,
    statusFilter,
    roleFilter,
    kycFilter,
    emailFilter,
  ]);

  // =====================================================
  // USER STATISTICS
  // =====================================================

  useEffect(() => {
    fetchStats();
  }, []);

  // =====================================================
  // SEARCH DEBOUNCE
  // =====================================================

  useEffect(() => {
    const timeout = setTimeout(() => {
      // When search changes, start from page 1
      setPage(1);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  // =====================================================
  // FETCH AFTER SEARCH PAGE RESET
  // =====================================================

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const StatusBadge = ({ status }) => {
    const styles = {
      active:
        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",

      pending:
        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",

      suspended:
        "bg-orange-500/10 text-orange-400 border-orange-500/20",

      blocked:
        "bg-red-500/10 text-red-400 border-red-500/20",

      closed:
        "bg-surface-700 text-surface-400 border-surface-600",
    };

    const labels = {
      active: "Active",
      pending: "Pending",
      suspended: "Suspended",
      blocked: "Blocked",
      closed: "Closed",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status] ||
          "bg-surface-700 text-surface-400 border-surface-600"
          }`}
      >
        {labels[status] || status || "Unknown"}
      </span>
    );
  };

  // =====================================================
  // KYC BADGE
  // =====================================================

  const KycBadge = ({ status }) => {
    const styles = {
      verified:
        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",

      pending:
        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",

      rejected:
        "bg-red-500/10 text-red-400 border-red-500/20",

      not_submitted:
        "bg-surface-700 text-surface-400 border-surface-600",
    };

    const labels = {
      verified: "Verified",
      pending: "Pending",
      rejected: "Rejected",
      not_submitted: "Not Submitted",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status] ||
          "bg-surface-700 text-surface-400 border-surface-600"
          }`}
      >
        {labels[status] || status || "Unknown"}
      </span>
    );
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "Never";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // =====================================================
  // FORMAT LAST LOGIN
  // =====================================================

  const formatLastLogin = (date) => {
    if (!date) return "Never";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown";
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // =====================================================
  // VIEW USER
  // =====================================================

  const handleViewUser = (userId) => {
    setOpenMenu(null);

    navigate(`/admin/users/${userId}/details`);
  };

  // =====================================================
  // VIEW KYC
  // =====================================================

  const handleViewKyc = (userId) => {
    setOpenMenu(null);

    navigate(`/admin/users/${userId}/kyc`);
  };

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setRoleFilter("");
    setKycFilter("");
    setEmailFilter("");
    setPage(1);
  };

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = () => {
    fetchUsers();
    fetchStats();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading && users.length === 0) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-surface-700 border-t-brand-500" />

          <p className="mt-4 text-sm text-surface-400">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      onClick={() => setOpenMenu(null)}
    >
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              User Management
            </h1>

            <p className="mt-1 text-sm text-surface-400">
              Manage platform users, accounts, verification and
              access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh */}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleRefresh();
              }}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm text-surface-300 transition hover:bg-surface-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaRedo
                className={loading ? "animate-spin" : ""}
              />

              Refresh
            </button>

            {/* Total */}

            <div className="flex items-center gap-2 rounded-xl border border-surface-700 bg-surface-900 px-4 py-2.5">
              <FaUsers className="text-brand-400" />

              <span className="text-sm text-surface-300">
                {pagination.totalUsers.toLocaleString()} users
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex items-start gap-3">
            <FaTimesCircle className="mt-0.5 shrink-0 text-red-400" />

            <div className="flex-1">
              <h3 className="font-semibold text-white">
                Unable to load users
              </h3>

              <p className="mt-1 text-sm text-surface-400">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-lg border border-surface-700 px-3 py-2 text-xs text-surface-300 hover:bg-surface-800 hover:text-white"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<FaUsers />}
          label="Total Users"
          value={stats.totalUsers}
        />

        <StatCard
          icon={<FaUserCheck />}
          label="Active Users"
          value={stats.activeUsers}
          iconClass="text-emerald-400"
        />

        <StatCard
          icon={<FaUserClock />}
          label="Pending Users"
          value={stats.pendingUsers}
          iconClass="text-yellow-400"
        />

        <StatCard
          icon={<FaUserLock />}
          label="Suspended Users"
          value={stats.suspendedUsers}
          iconClass="text-orange-400"
        />

        <StatCard
          icon={<FaBan />}
          label="Blocked Users"
          value={stats.blockedUsers}
          iconClass="text-red-400"
        />

        <StatCard
          icon={<FaUserShield />}
          label="Admin Accounts"
          value={0}
          iconClass="text-purple-400"
        />

        <StatCard
          icon={<FaCheckCircle />}
          label="Verified Emails"
          value={stats.verifiedEmails}
          iconClass="text-cyan-400"
        />

        <StatCard
          icon={<FaShieldAlt />}
          label="2FA Enabled"
          value={stats.usersWith2FA}
          iconClass="text-indigo-400"
        />

      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="rounded-2xl border border-surface-700 bg-surface-900 p-4">

        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <FaFilter className="text-brand-400" />

            <h2 className="text-sm font-semibold text-white">
              Search & Filters
            </h2>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-surface-400 transition hover:text-brand-400"
          >
            Clear filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">

          {/* Search */}

          <div className="relative xl:col-span-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />

            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-surface-700 bg-surface-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-surface-600 focus:border-brand-500"
            />
          </div>

          {/* Status */}

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-surface-700 bg-surface-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
            <option value="closed">Closed</option>
          </select>

          {/* Role */}

          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-surface-700 bg-surface-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          {/* KYC */}

          <select
            value={kycFilter}
            onChange={(event) => {
              setKycFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-surface-700 bg-surface-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
          >
            <option value="">All KYC</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="not_submitted">
              Not Submitted
            </option>
          </select>

          {/* Email */}

          <select
            value={emailFilter}
            onChange={(event) => {
              setEmailFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-surface-700 bg-surface-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
          >
            <option value="">All Email Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>

        </div>
      </div>

      {/* =================================================
          USER TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-surface-700 bg-surface-900">

        {/* Header */}

        <div className="flex flex-col justify-between gap-3 border-b border-surface-700 px-5 py-4 sm:flex-row sm:items-center">

          <div>
            <h2 className="font-semibold text-white">
              Platform Users
            </h2>

            <p className="mt-1 text-xs text-surface-500">
              Showing {users.length} of{" "}
              {pagination.totalUsers.toLocaleString()} users
            </p>
          </div>

          <div className="text-xs text-surface-500">
            Page {pagination.currentPage} of{" "}
            {pagination.totalPages}
          </div>

        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <div className="hidden overflow-x-auto lg:block">

          <table className="w-full">

            <thead>
              <tr className="border-b border-surface-700 text-left">

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-surface-500">
                  User
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-surface-500">
                  Role
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-surface-500">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-surface-500">
                  KYC
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-surface-500">
                  Security
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-surface-500">
                  Last Login
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-surface-500">
                  Joined
                </th>

                <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wider text-surface-500">
                  Action
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-surface-700">

              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-16 text-center"
                  >
                    <FaUsers className="mx-auto text-3xl text-surface-600" />

                    <p className="mt-3 text-sm text-surface-400">
                      No users found.
                    </p>

                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-3 text-xs text-brand-400 hover:text-brand-300"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                users.map((user) => (

                  <tr
                    key={user._id}
                    className="transition hover:bg-surface-800/40"
                  >

                    {/* USER */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.name || "User"}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-400">
                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>
                        )}

                        <div className="min-w-0">

                          <p className="truncate font-medium text-white">
                            {user.name || "Unnamed User"}
                          </p>

                          <p className="truncate text-xs text-surface-500">
                            {user.email}
                          </p>

                          {user.referralCode && (
                            <p className="mt-0.5 text-[11px] text-surface-600">
                              Ref: {user.referralCode}
                            </p>
                          )}

                        </div>

                      </div>

                    </td>

                    {/* ROLE */}

                    <td className="px-5 py-4">

                      <span className="text-sm capitalize text-surface-300">
                        {user.role || "user"}
                      </span>

                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <StatusBadge status={user.status} />
                    </td>

                    {/* KYC */}

                    <td className="px-5 py-4">
                      <KycBadge status={user.kycStatus} />
                    </td>

                    {/* SECURITY */}

                    <td className="px-5 py-4">

                      <div className="space-y-1">

                        {user.emailVerified ? (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                            <FaCheckCircle />
                            Email verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-yellow-400">
                            <FaClock />
                            Email unverified
                          </span>
                        )}

                        {user.twoFactorEnabled && (
                          <span className="flex items-center gap-1.5 text-xs text-cyan-400">
                            <FaShieldAlt />
                            2FA enabled
                          </span>
                        )}

                      </div>

                    </td>

                    {/* LAST LOGIN */}

                    <td className="px-5 py-4 text-sm text-surface-400">
                      {formatLastLogin(user.lastLoginAt)}
                    </td>

                    {/* JOINED */}

                    <td className="px-5 py-4 text-sm text-surface-400">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* ACTION */}

                    <td
                      className="relative px-5 py-4 text-right"
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >

                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu(
                            openMenu === user._id
                              ? null
                              : user._id
                          )
                        }
                        className="rounded-lg p-2 text-surface-400 transition hover:bg-surface-700 hover:text-white"
                      >
                        <FaEllipsisV />
                      </button>

                      {openMenu === user._id && (
                        <div className="absolute right-5 top-12 z-30 w-48 rounded-xl border border-surface-700 bg-surface-800 p-1 text-left shadow-2xl">

                          <button
                            type="button"
                            onClick={() =>
                              handleViewUser(user._id)
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-surface-300 hover:bg-surface-700 hover:text-white"
                          >
                            <FaEye />
                            View User
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleViewKyc(user._id)
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-surface-300 hover:bg-surface-700 hover:text-white"
                          >
                            <FaIdCard />
                            View KYC
                          </button>

                          <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                          >
                            <FaBan />
                            Suspend User
                          </button>

                        </div>
                      )}

                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>

        {/* =================================================
            MOBILE USERS
        ================================================= */}

        <div className="divide-y divide-surface-700 lg:hidden">

          {users.length === 0 ? (
            <div className="px-5 py-16 text-center">

              <FaUsers className="mx-auto text-3xl text-surface-600" />

              <p className="mt-3 text-sm text-surface-400">
                No users found.
              </p>

              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 text-xs text-brand-400 hover:text-brand-300"
              >
                Clear filters
              </button>

            </div>
          ) : (
            users.map((user) => (

              <div
                key={user._id}
                className="p-4"
              >

                {/* User header */}

                <div className="flex items-start justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name || "User"}
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
                        {user.name
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </div>
                    )}

                    <div className="min-w-0">

                      <p className="truncate font-medium text-white">
                        {user.name || "Unnamed User"}
                      </p>

                      <p className="truncate text-xs text-surface-500">
                        {user.email}
                      </p>

                    </div>

                  </div>

                  <StatusBadge status={user.status} />

                </div>

                {/* User information */}

                <div className="mt-4 grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-surface-500">
                      Role
                    </p>

                    <p className="mt-1 text-sm capitalize text-surface-300">
                      {user.role || "user"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-surface-500">
                      KYC
                    </p>

                    <div className="mt-1">
                      <KycBadge status={user.kycStatus} />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-surface-500">
                      Email
                    </p>

                    <p
                      className={`mt-1 text-sm ${user.emailVerified
                          ? "text-emerald-400"
                          : "text-yellow-400"
                        }`}
                    >
                      {user.emailVerified
                        ? "Verified"
                        : "Unverified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-surface-500">
                      2FA
                    </p>

                    <p
                      className={`mt-1 text-sm ${user.twoFactorEnabled
                          ? "text-cyan-400"
                          : "text-surface-400"
                        }`}
                    >
                      {user.twoFactorEnabled
                        ? "Enabled"
                        : "Disabled"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-surface-500">
                      Last Login
                    </p>

                    <p className="mt-1 text-sm text-surface-300">
                      {formatLastLogin(user.lastLoginAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-surface-500">
                      Joined
                    </p>

                    <p className="mt-1 text-sm text-surface-300">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>

                </div>

                {/* Actions */}

                <div className="mt-4 grid grid-cols-2 gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      handleViewUser(user._id)
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-surface-700 py-2.5 text-sm text-surface-300 transition hover:bg-surface-800 hover:text-white"
                  >
                    <FaEye />
                    View User
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleViewKyc(user._id)
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-surface-700 py-2.5 text-sm text-surface-300 transition hover:bg-surface-800 hover:text-white"
                  >
                    <FaIdCard />
                    KYC
                  </button>

                </div>

              </div>

            ))
          )}

        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        <div className="flex flex-col gap-3 border-t border-surface-700 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-surface-500">
            Showing{" "}
            <span className="text-surface-300">
              {users.length}
            </span>{" "}
            of{" "}
            <span className="text-surface-300">
              {pagination.totalUsers.toLocaleString()}
            </span>{" "}
            users
          </p>

          <div className="flex items-center justify-between gap-3">

            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() => {
                setPage((previous) =>
                  Math.max(previous - 1, 1)
                );

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="flex h-9 items-center gap-2 rounded-lg border border-surface-700 px-3 text-sm text-surface-300 transition hover:bg-surface-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronLeft />

              <span className="hidden sm:inline">
                Previous
              </span>
            </button>

            <span className="whitespace-nowrap text-sm text-surface-300">
              Page {pagination.currentPage} of{" "}
              {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => {
                setPage((previous) =>
                  previous + 1
                );

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="flex h-9 items-center gap-2 rounded-lg border border-surface-700 px-3 text-sm text-surface-300 transition hover:bg-surface-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden sm:inline">
                Next
              </span>

              <FaChevronRight />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

// =========================================================
// STAT CARD
// =========================================================

const StatCard = ({
  icon,
  label,
  value,
  iconClass = "text-brand-400",
}) => {
  return (
    <div className="rounded-2xl border border-surface-700 bg-surface-900 p-5">

      <div className="flex items-center justify-between gap-3">

        <div className="min-w-0">

          <p className="text-xs font-medium uppercase tracking-wide text-surface-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {Number(value || 0).toLocaleString()}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-800 ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
};

export default AdminUserManagement;