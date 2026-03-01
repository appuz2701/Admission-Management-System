// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Alert,
  Spin,
  Checkbox,
  Divider,
  Typography,
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '../redux/slices/authSlice';
import '../styles/Login.css';

const { Title, Text } = Typography;

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      form.setFieldsValue({ email: savedEmail });
      setRememberMe(true);
    }
  }, [form]);

  const handleSubmit = async (values) => {
    try {
      await dispatch(login(values)).unwrap();

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', values.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleDemoLogin = () => {
    form.setFieldsValue({
      email: 'admin@college.com',
      password: 'admin123',
    });
    setTimeout(() => {
      form.submit();
    }, 100);
  };

  return (
    <div className="login-container">
      <Row
        justify="center"
        align="middle"
        style={{ minHeight: '100vh', width: '100%' }}
      >
        <Col xs={22} sm={20} md={12} lg={8}>
          <Card
            className="login-card"
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Header */}
            <div className="login-header">
              <Title level={2} style={{ marginBottom: 8 }}>
                Admission Management System
              </Title>
              <Text type="secondary">Sign in to your account</Text>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert
                message="Login Failed"
                description={error}
                type="error"
                showIcon
                closable
                style={{ marginBottom: 20 }}
              />
            )}

            {/* Loading Spinner */}
            <Spin spinning={loading}>
              <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
                autoComplete="off"
              >
                {/* Email Field */}
                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter your email address',
                    },
                    {
                      type: 'email',
                      message: 'Please enter a valid email address',
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="admin@college.com"
                    size="large"
                    autoComplete="email"
                  />
                </Form.Item>

                {/* Password Field */}
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter your password',
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter your password"
                    size="large"
                    autoComplete="current-password"
                  />
                </Form.Item>

                {/* Remember Me */}
                <Form.Item>
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  >
                    Remember me
                  </Checkbox>
                </Form.Item>

                {/* Sign In Button */}
                <Form.Item>
                  <Button
                    type="primary"
                    block
                    htmlType="submit"
                    size="large"
                    loading={loading}
                  >
                    Sign In
                  </Button>
                </Form.Item>

                {/* Divider */}
                <Divider>OR</Divider>

                {/* Demo Button */}
                <Form.Item>
                  <Button
                    block
                    size="large"
                    onClick={handleDemoLogin}
                    disabled={loading}
                  >
                    Use Demo Credentials
                  </Button>
                </Form.Item>

                {/* Footer Info */}
                <div className="login-footer">
                  <p style={{ marginBottom: 8, fontWeight: 'bold', fontSize: 12 }}>
                    Demo Account:
                  </p>
                  <p style={{ margin: '4px 0', fontSize: 12 }}>
                    Email: <code>admin@college.com</code>
                  </p>
                  <p style={{ margin: '4px 0', fontSize: 12 }}>
                    Password: <code>admin123</code>
                  </p>
                  <p style={{ marginTop: 12, color: '#999', fontSize: '11px' }}>
                    This is a demo account for testing purposes.
                  </p>
                </div>
              </Form>
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Login;