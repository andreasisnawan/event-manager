import {
  CalendarOutlined,
  CompassOutlined,
  HomeOutlined,
  LogoutOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Space, Typography } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const { Header, Content } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const items = [
      {
        key: "/",
        icon: <HomeOutlined />,
        label: "Home",
      },
      {
        key: "/explore",
        icon: <CompassOutlined />,
        label: "Explore",
      },
    ];

    // Conditional menu item based on user role
    if (user?.role === "attendee") {
      items.push({
        key: "/registrations",
        icon: <ScheduleOutlined />,
        label: "My Registrations",
      });
    } else if (user?.role === "admin" || user?.role === "organizer") {
      items.push({
        key: "/manage-events",
        icon: <CalendarOutlined />,
        label: "Manage Events",
      });
    }

    return items;
  };

  return (
    <Layout className="min-h-screen! w-screen">
      <Header
        style={{
          padding: "0 24px",
          background: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Space align="center" size={24}>
          <Title level={4} style={{ margin: 0 }}>
            Tech Events
          </Title>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={getMenuItems()}
            onClick={({ key }) => navigate(key)}
            style={{ border: "none", minWidth: 400 }}
          />
        </Space>
        <Space>
          <span style={{ marginRight: 16 }}>
            Welcome, {user?.first_name || user?.username}
          </span>
          <Button type="text" icon={<LogoutOutlined />} onClick={logout}>
            Logout
          </Button>
        </Space>
      </Header>
      <Content className="pb-10">
        <Outlet />
      </Content>
    </Layout>
  );
};

export default MainLayout;
