import { ConfigProvider } from "antd";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import MainLayout from "./layouts/MainLayout";

// Import pages
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from "./features/dashboard/Dashboard";
import Explore from "./features/explore/Explore";
import Home from "./features/home/Home";
import RegistrationList from "./features/registrations/RegistrationList";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
        },
      }}
    >
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />

            <Route path="/registrations" element={<RegistrationList />} />
            <Route path="/manage-events" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
    </ConfigProvider>
  );
}

export default App;
