import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, Layout, Typography } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const { Title } = Typography;

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setError("");
      setLoading(true);
      await login(values.username, values.password);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="h-screen w-screen bg-[#f0f2f5]">
      <div className="w-[500px] mx-auto mt-50 px-5">
        <Card>
          <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
            Event Manager
          </Title>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your username!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Username"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
              >
                Log in
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              Don't have an account? <Link to="/register">Register now!</Link>
            </div>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
