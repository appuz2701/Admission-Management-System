import React, { useState, useEffect } from 'react';
import {  useSelector } from 'react-redux';
import {
  Card,
  Form,
  Input,
  Button,
  Table,
  Modal,
  Select,
  Tag,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import '../styles/Institution.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function UserManagement() {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { institutions } = useSelector((state) => state.institution);
  const { user: currentUser } = useSelector((state) => state.auth);

  const safeInstitutions = Array.isArray(institutions) ? institutions : [];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users || []);
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/auth/register`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('User created successfully');
      form.resetFields();
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colors = {
          admin: 'red',
          admission_officer: 'blue',
          management: 'green',
        };
        return <Tag color={colors[role]}>{role.replace('_', ' ').toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Institution',
      dataIndex: ['institution', 'name'],
      key: 'institution',
      render: (text) => text || '-',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
  ];

  // Only admin can access this page
  if (currentUser?.role !== 'admin') {
    return (
      <Card>
        <p>You don't have permission to access this page.</p>
      </Card>
    );
  }

  return (
    <div className="institution-container">
      <h1>User Management</h1>

      <Card>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          style={{ marginBottom: 16 }}
        >
          Create User
        </Button>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Create User"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateUser}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input placeholder="user@college.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Role is required' }]}
          >
            <Select placeholder="Select role">
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="admission_officer">Admission Officer</Select.Option>
              <Select.Option value="management">Management (View Only)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Institution" name="institution">
            <Select
              placeholder="Select institution (optional for admin)"
              allowClear
              options={safeInstitutions.map((inst) => ({
                label: inst.name,
                value: inst._id,
              }))}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" block htmlType="submit" loading={loading}>
              Create User
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserManagement;
