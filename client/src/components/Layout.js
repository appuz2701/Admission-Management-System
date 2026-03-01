 import React, { useState } from "react";
import { Layout, Menu, Dropdown, Avatar, Button, Drawer } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import "../styles/Layout.css";

const { Header, Sider, Content } = Layout;

function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems = [
    {
      key: "/",
      label: "Dashboard",
    },
    ...(user?.role === "admin"
      ? [
          { key: "/institution", label: "Institution Setup" },
          { key: "/program", label: "Programs & Quotas" },
          { key: "/users", label: "User Management" },
        ]
      : []),
    ...(user?.role === "admin" || user?.role === "admission_officer"
      ? [
          { key: "/applicant", label: "Applicants" },
          { key: "/admission", label: "Admission" },
        ]
      : []),
  ];

  const userMenuItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
        collapsedWidth={80}
      >
        <div className="logo">AMS</div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => {
            navigate(key);
            setDrawerOpen(false);
          }}
        />
      </Drawer>

      <Layout>
        <Header className="app-header">
          <div className="header-left">
            <Button
              type="text"
              icon={
                collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
              }
              onClick={() => setCollapsed(!collapsed)}
              className="desktop-toggle"
            />

            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setDrawerOpen(true)}
              className="mobile-toggle"
            />
          </div>

          <div className="header-right">
            <span className="user-info">
              {user?.name} ({user?.role})
            </span>

            <Dropdown menu={{ items: userMenuItems }}>
              <Avatar style={{ cursor: "pointer" }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: "16px" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;