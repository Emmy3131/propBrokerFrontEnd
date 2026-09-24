import {
  FaChartLine,
  FaUsers,
  FaUserShield,
  FaMoneyBillWave,
  FaWallet,
  FaExchangeAlt,
  FaCog,
  FaBell,
  FaCheckCircle,
  FaFileAlt,
} from "react-icons/fa";

import MenuItem from "./MenuItem";

const AdminSidebarMenu = ({ onNavigate }) => {
  return (
    <nav className="px-4 py-5">
      {/* OVERVIEW */}
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Overview
      </p>

      <div className="space-y-1">
        <MenuItem
          to="/adminDashboard"
          title="Dashboard"
          icon={<FaChartLine />}
          onClick={onNavigate}
        />

        <MenuItem
          to="/userManagement"
          title="Users"
          icon={<FaUsers />}
          onClick={onNavigate}
        />

        <MenuItem
          to="/adminDashboard/accounts"
          title="Trading Accounts"
          icon={<FaUserShield />}
          onClick={onNavigate}
        />
      </div>

      {/* FINANCE */}
      <p className="mb-3 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Finance
      </p>

      <div className="space-y-1">
        <MenuItem
          to="/adminDashboard/deposits"
          title="Deposits"
          icon={<FaMoneyBillWave />}
          onClick={onNavigate}
        />

        <MenuItem
          to="/adminDashboard/withdrawals"
          title="Withdrawals"
          icon={<FaWallet />}
          onClick={onNavigate}
        />

        <MenuItem
          to="/adminDashboard/transactions"
          title="Transactions"
          icon={<FaExchangeAlt />}
          onClick={onNavigate}
        />
      </div>

      {/* MANAGEMENT */}
      <p className="mb-3 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Management
      </p>

      <div className="space-y-1">
        <MenuItem
          to="/adminDashboard/reports"
          title="Reports"
          icon={<FaFileAlt />}
          onClick={onNavigate}
        />

        <MenuItem
          to="/adminDashboard/notifications"
          title="Notifications"
          icon={<FaBell />}
          onClick={onNavigate}
        />

        <MenuItem
          to="/adminDashboard/settings"
          title="Settings"
          icon={<FaCog />}
          onClick={onNavigate}
        />
      </div>
    </nav>
  );
};

export default AdminSidebarMenu;