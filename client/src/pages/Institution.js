import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Form,
  Input,
  Button,
  Table,
  Modal,
  Select,
  Space,
  Tag,
  Alert,
  Spin,
  Tabs,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  createInstitution,
  getInstitutions,
  createCampus,
  getCampuses,
  createDepartment,
  getDepartments,
} from '../redux/slices/institutionSlice';
import '../styles/Institution.css';

function Institution() {
  const dispatch = useDispatch();
  const { institutions, campuses, departments, loading, error } = useSelector(
    (state) => state.institution
  );
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('institution');
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState(null);

  // Ensure data is always an array
  const safeInstitutions = Array.isArray(institutions) ? institutions : [];
  const safeCampuses = Array.isArray(campuses) ? campuses : [];
  const safeDepartments = Array.isArray(departments) ? departments : [];

  useEffect(() => {
    dispatch(getInstitutions());
  }, [dispatch]);

  useEffect(() => {
    if (selectedInstitution) {
      dispatch(getCampuses({ institution: selectedInstitution }));
      dispatch(getDepartments({ institution: selectedInstitution }));
    }
  }, [dispatch, selectedInstitution]);

  const handleAddInstitution = (values) => {
    dispatch(createInstitution(values)).then(() => {
      form.resetFields();
      setModalVisible(false);
      dispatch(getInstitutions());
    });
  };

  const handleAddCampus = (values) => {
    dispatch(createCampus({ ...values, institution: selectedInstitution })).then(() => {
      form.resetFields();
      setModalVisible(false);
      dispatch(getCampuses({ institution: selectedInstitution }));
    });
  };

  const handleAddDepartment = (values) => {
    dispatch(
      createDepartment({
        ...values,
        institution: selectedInstitution,
        campus: selectedCampus,
      })
    ).then(() => {
      form.resetFields();
      setModalVisible(false);
      dispatch(getDepartments({ institution: selectedInstitution }));
    });
  };

  const institutionColumns = [
    {
      title: 'Institution Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Contact Email',
      dataIndex: 'contactEmail',
      key: 'contactEmail',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            onClick={() => {
              setSelectedInstitution(record._id);
              setSelectedCampus(null);
            }}
          >
            Select
          </Button>
        </Space>
      ),
    },
  ];

  const campusColumns = [
    {
      title: 'Campus Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="green">{text}</Tag>,
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
    },
  ];

  const departmentColumns = [
    {
      title: 'Department Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="orange">{text}</Tag>,
    },
    {
      title: 'Campus',
      dataIndex: ['campus', 'name'],
      key: 'campus',
    },
    {
      title: 'Head',
      dataIndex: 'head',
      key: 'head',
    },
  ];

  return (
    <div className="institution-container">
      <h1>Master Setup - Institution Management</h1>

      {error && <Alert message={error} type="error" closable style={{ marginBottom: 20 }} />}

      <Card style={{ marginBottom: 20 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>
              Select Institution
            </label>
            <Select
              placeholder="Select an institution"
              value={selectedInstitution}
              onChange={(value) => {
                setSelectedInstitution(value);
                setSelectedCampus(null);
              }}
              options={safeInstitutions.map((inst) => ({
                label: inst.name,
                value: inst._id,
              }))}
              style={{ width: '100%' }}
              allowClear
            />
          </div>
          {selectedInstitution && (
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>
                Select Campus
              </label>
              <Select
                placeholder="Select a campus"
                value={selectedCampus}
                onChange={setSelectedCampus}
                options={safeCampuses.map((campus) => ({
                  label: campus.name,
                  value: campus._id,
                }))}
                style={{ width: '100%' }}
                allowClear
              />
            </div>
          )}
        </Space>
      </Card>

      <Tabs
        items={[
          {
            key: '1',
            label: 'Institutions',
            children: (
              <Card>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setModalType('institution');
                    setModalVisible(true);
                  }}
                  style={{ marginBottom: 16 }}
                >
                  Create Institution
                </Button>

                <Table
                  columns={institutionColumns}
                  dataSource={safeInstitutions}
                  rowKey="_id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              </Card>
            ),
          },
          {
            key: '2',
            label: 'Campuses',
            children: (
              <Card>
                {selectedInstitution ? (
                  <>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setModalType('campus');
                        setModalVisible(true);
                      }}
                      style={{ marginBottom: 16 }}
                    >
                      Create Campus
                    </Button>

                    <Table
                      columns={campusColumns}
                      dataSource={safeCampuses}
                      rowKey="_id"
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 800 }}
                    />
                  </>
                ) : (
                  <Alert message="Please select an institution first" type="info" />
                )}
              </Card>
            ),
          },
          {
            key: '3',
            label: 'Departments',
            children: (
              <Card>
                {selectedInstitution ? (
                  <>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        if (!selectedCampus) {
                          message.error('Please select a campus first');
                          return;
                        }
                        setModalType('department');
                        setModalVisible(true);
                      }}
                      style={{ marginBottom: 16 }}
                    >
                      Create Department
                    </Button>

                    <Table
                      columns={departmentColumns}
                      dataSource={safeDepartments}
                      rowKey="_id"
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 800 }}
                    />
                  </>
                ) : (
                  <Alert message="Please select an institution first" type="info" />
                )}
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title={`Create ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={
              modalType === 'institution'
                ? handleAddInstitution
                : modalType === 'campus'
                  ? handleAddCampus
                  : handleAddDepartment
            }
          >
            {modalType === 'institution' && (
              <>
                <Form.Item label="Institution Name" name="name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Code" name="code" rules={[{ required: true }]}>
                  <Input placeholder="e.g., KU" />
                </Form.Item>
                <Form.Item label="Address" name="address">
                  <Input />
                </Form.Item>
                <Form.Item label="City" name="city">
                  <Input />
                </Form.Item>
                <Form.Item label="State" name="state">
                  <Input />
                </Form.Item>
                <Form.Item label="Contact Email" name="contactEmail" rules={[{ type: 'email' }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Contact Phone" name="contactPhone">
                  <Input />
                </Form.Item>
              </>
            )}

            {modalType === 'campus' && (
              <>
                <Form.Item label="Campus Name" name="name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Code" name="code" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Address" name="address">
                  <Input />
                </Form.Item>
                <Form.Item label="City" name="city">
                  <Input />
                </Form.Item>
                <Form.Item label="Contact Person" name="contactPerson">
                  <Input />
                </Form.Item>
              </>
            )}

            {modalType === 'department' && (
              <>
                <Form.Item label="Department Name" name="name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Code" name="code" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Campus" name="campus" rules={[{ required: true }]}>
                  <Select
                    placeholder="Select Campus"
                    value={selectedCampus}
                    options={safeCampuses.map((c) => ({
                      label: c.name,
                      value: c._id,
                    }))}
                    onChange={setSelectedCampus}
                  />
                </Form.Item>
                <Form.Item label="Department Head" name="head">
                  <Input />
                </Form.Item>
              </>
            )}

            <Form.Item>
              <Button type="primary" block htmlType="submit" loading={loading}>
                Create
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}

export default Institution;