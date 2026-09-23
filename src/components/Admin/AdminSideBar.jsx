import MenuItem from "../MenuItem";

import {
  FaChartBar,
  FaUsers,
  FaShoppingBag,
  FaBoxOpen,
  FaTags,
  FaStar,
  FaUserFriends,
  FaMoneyBillWave,
  FaFileAlt,
  FaStore,
  FaEnvelope,
  FaCog,
  FaImage,
  FaFileCode,
} from "react-icons/fa";

const AdminMenu = () => {
  return (
    <>
      {/* Dashboard */}
      <MenuItem
        to="/admin/dashboard"
        title="Dashboard"
        icon={<FaChartBar />}
      />

      {/* Users */}
      <MenuItem
        to="/admin/users"
        title="Manage Users"
        icon={<FaUsers />}
      />

      {/* Orders */}
      <MenuItem
        to="/admin/orders"
        title="Orders"
        icon={<FaShoppingBag />}
      />

      {/* Products */}
      <MenuItem
        to="/admin/products"
        title="Products"
        icon={<FaBoxOpen />}
      />

      {/* Categories */}
      <MenuItem
        to="/admin/category"
        title="Category"
        icon={<FaTags />}
      />

      {/* Reviews */}
      <MenuItem
        to="/admin/reviews"
        title="Reviews"
        icon={<FaStar />}
      />

      {/* Referral Management */}
      <MenuItem
        to="/admin/referral"
        title="Referral Management"
        icon={<FaUserFriends />}
      />

      {/* Withdrawal Management */}
      <MenuItem
        to="/admin/withdral"
        title="Withdrawal Management"
        icon={<FaMoneyBillWave />}
      />

      {/* Reports */}
      <MenuItem
        to="/admin/report"
        title="Report"
        icon={<FaFileAlt />}
      />

      {/* Vendors */}
      <MenuItem
        to="/admin/vendors"
        title="Vendors"
        icon={<FaStore />}
      />

      {/* Newsletter */}
      <MenuItem
        to="/admin/newsletter"
        title="Newsletter"
        icon={<FaEnvelope />}
      />

      {/* Settings */}
      <MenuItem
        to="/admin/profile"
        title="Settings"
        icon={<FaCog />}
      />

      {/* Hero Banners */}
      <MenuItem
        to="/admin/hero-banners"
        title="Hero Banners"
        icon={<FaImage />}
      />

      {/* CMS Pages */}
      <MenuItem
        to="/admin/cms-pages"
        title="CMS Pages"
        icon={<FaFileCode />}
      />
    </>
  );
};

export default AdminMenu;