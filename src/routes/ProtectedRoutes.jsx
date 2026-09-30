import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const {
        user,
        loading,
        isAuthenticated,
    } = useAuth();

    const location = useLocation();

    /*
    =====================================================
    AUTHENTICATION IS STILL LOADING
    =====================================================
    */

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-4 border-surface-700 border-t-brand-500 animate-spin" />

                    <p className="text-surface-300 text-sm">
                        Checking your session...
                    </p>
                </div>
            </div>
        );
    }

    /*
    =====================================================
    USER IS NOT AUTHENTICATED
    =====================================================
    */

    if (!isAuthenticated || !user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location,
                    message:
                        "Your session has expired. Please log in again.",
                }}
            />
        );
    }

    /*
    =====================================================
    ROLE PROTECTION
    =====================================================
    */

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user.role)
    ) {
        /*
        If an authenticated user tries to access a route
        that does not belong to their role, send them to
        their own dashboard.
        */

        if (user.role === "admin") {
            return (
                <Navigate
                    to="/adminDashboard"
                    replace
                />
            );
        }

        if (user.role === "user") {
            return (
                <Navigate
                    to="/user/dashboard"
                    replace
                />
            );
        }

        /*
        Unknown role
        */

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    /*
    =====================================================
    AUTHENTICATED + AUTHORIZED
    =====================================================
    */

    return <Outlet />;
};

export default ProtectedRoute;