import {
  LockOutlined,
  MailOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Layout,
  Select,
  Typography,
} from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const { Title } = Typography;
const { Option } = Select;

const Register = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setError("");
      setLoading(true);
      await register({
        username: values.username,
        password: values.password,
        password2: values.confirmPassword,
        email: values.email,
        first_name: values.firstName,
        last_name: values.lastName,
        role: values.role,
      });
      navigate("/login", {
        state: { message: "Registration successful! Please log in." },
      });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          Object.values(err.response?.data || {})[0]?.[0] ||
          "Failed to register"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="w-screen min-h-screen bg-[#f0f2f5]">
      <div className="w-[500px] mx-auto my-10 px-5">
        <Card>
          <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
            Create Account
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
            name="register"
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
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please input a valid email!",
                },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="firstName"
              rules={[
                {
                  required: true,
                  message: "Please input your first name!",
                },
              ]}
            >
              <Input
                prefix={<UserAddOutlined />}
                placeholder="First Name"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              rules={[
                {
                  required: true,
                  message: "Please input your last name!",
                },
              ]}
            >
              <Input
                prefix={<UserAddOutlined />}
                placeholder="Last Name"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="role"
              rules={[
                {
                  required: true,
                  message: "Please select a role!",
                },
              ]}
            >
              <Select placeholder="Select a role" size="large">
                <Option value="attendee">Attendee</Option>
                <Option value="organizer">Organizer</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
                {
                  min: 8,
                  message: "Password must be at least 8 characters!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
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
                Register
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              Already have an account? <Link to="/login">Login now!</Link>
            </div>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
