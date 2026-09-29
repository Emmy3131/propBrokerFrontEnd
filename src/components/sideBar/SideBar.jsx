import {
  FaChartLine,
  FaUsers,
  FaUserShield,
  FaMoneyBillWave,
  FaWallet,
  FaExchangeAlt,
  FaCog,
  FaBell,
  FaHome,
  FaUser,
} from "react-icons/fa";

import MenuItem from "./MenuItem";

const SidebarMenu = ({ onNavigate }) => {
  return (
    <nav className="px-4 py-5">
      {/* MAIN */}
      <p
        className="
          mb-3
          px-3
          text-xs
          font-semibold
          uppercase
          tracking-wider
          text-surface-500
        "
      >
        Main
      </p>

      <div className="space-y-1">
        <MenuItem
          to="/user/dashboard"
          title="Dashboard"
          icon={<FaHome />}
          onClick={onNavigate}
        />

        <MenuItem
          to="/trading"
          title="Trading"
          icon={<FaChartLine />}
          onClick={onNavigate}
        />

        <MenuItem
          to="/userDashboard/accounts"
          title="Accounts"
          icon={<FaUserShield />}
          onClick={onNavigate}
        />

        <MenuItem
          to="/userDashboard/positions"
          title="Positions"
          icon={<FaChartLine />}
          onClick={onNavigate}
        />

        <MenuItem
          to="/userDashboard/orders"
          title="Orders"
          icon={<FaExchangeAlt />}
          onClick={onNavigate}
        />
      </div>

      {/* MONEY */}
      <p
        className="
          mb-3
          mt-6
          px-3
          text-xs
          font-semibold
          uppercase
          tracking-wider
          text-surface-500
        "
      >
        Money
      </p>

      <div className="space-y-1">
        <MenuItem
          to="/user/deposits"
          title="Deposits"
          icon={<FaMoneyBillWave />}
          onClick={onNavigate}
        />

        <MenuItem
          to="/user/withdraw"
          title="Withdrawals"
          icon={<FaWallet />}
          onClick={onNavigate}
        />

        <MenuItem
          to="/transactions"
          title="Transactions"
          icon={<FaExchangeAlt />}
          onClick={onNavigate}
        />

        <MenuItem
          to="/userDashboard/referrals"
          title="Referrals"
          icon={<FaUsers />}
          onClick={onNavigate}
        />
      </div>

      {/* ACCOUNT */}
      <p
        className="
          mb-3
          mt-6
          px-3
          text-xs
          font-semibold
          uppercase
          tracking-wider
          text-surface-500
        "
      >
        Account
      </p>

      <div className="space-y-1">
        <MenuItem
          to="/userDashboard/notifications"
          title="Notifications"
          icon={<FaBell />}
          onClick={onNavigate}
        />

         <MenuItem
          to="/user/kyc"
          title="KYC"
          icon={<FaUser />}
          onClick={onNavigate}
        />

        <MenuItem
          to="/user/profile"
          title="Profile"
          icon={<FaUser />}
          onClick={onNavigate}
        />

      </div>
    </nav>
  );
};

export default SidebarMenu;