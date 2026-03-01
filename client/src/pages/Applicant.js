// eslint-disable-next-line no-unused-vars
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
  DatePicker,
  InputNumber,
  Row,
  Col,
  Divider,
  message,
} from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import {
  createApplicant,
  getApplicants,
  getApplicantById,
  updateDocumentStatus,
  updateFeeStatus,
} from '../redux/slices/applicantSlice';
import { getPrograms } from '../redux/slices/programSlice';
import { getInstitutions } from '../redux/slices/institutionSlice';
import '../styles/Applicant.css';

function Applicant() {
  const dispatch = useDispatch();
  const { applicants, currentApplicant, loading, error } = useSelector(
    (state) => state.applicant
  );
  const { programs } = useSelector((state) => state.program);
  const { institutions } = useSelector((state) => state.institution);
  const { user } = useSelector((state) => state.auth);

  // Ensure data is always an array
  const safeApplicants = Array.isArray(applicants) ? applicants : [];
  const safePrograms = Array.isArray(programs) ? programs : [];
  const safeInstitutions = Array.isArray(institutions) ? institutions : [];

  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(user?.institution?._id || null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [documentStatusFilter, setDocumentStatusFilter] = useState(null);

  useEffect(() => {
    dispatch(getInstitutions());
  }, [dispatch]);

  useEffect(() => {
    if (selectedInstitution) {
      dispatch(getPrograms({ institution: selectedInstitution }));
      dispatch(
        getApplicants({
          institution: selectedInstitution,
          status: statusFilter,
        })
      );
    }
  }, [dispatch, selectedInstitution, statusFilter]);

  const handleCreateApplicant = (values) => {
    if (!selectedProgram) {
      message.error('Please select a program');
      return;
    }

    const programData = programs.find((p) => p._id === selectedProgram);

    dispatch(
      createApplicant({
        ...values,
        dateOfBirth: values.dateOfBirth.toISOString(),
        program: selectedProgram,
        institution: selectedInstitution,
        academicYear: programData?.academicYear?._id,
      })
    ).then(() => {
      form.resetFields();
      setModalVisible(false);
      dispatch(getApplicants({ institution: selectedInstitution }));
    });
  };

  const handleUpdateDocumentStatus = (applicantId, status) => {
    dispatch(updateDocumentStatus({ id: applicantId, documentStatus: status })).then(() => {
      dispatch(getApplicants({ institution: selectedInstitution }));
    });
  };

  const handleUpdateFeeStatus = (applicantId, feeStatus, feeAmount) => {
    dispatch(updateFeeStatus({ id: applicantId, feeStatus, feeAmount })).then(() => {
      dispatch(getApplicants({ institution: selectedInstitution }));
    });
  };

  const applicantColumns = [
    {
      title: 'Application #',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Program',
      dataIndex: ['program', 'name'],
      key: 'program',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        let color = 'default';
        if (text === 'Applied') color = 'blue';
        if (text === 'Allotted') color = 'cyan';
        if (text === 'Admitted') color = 'green';
        if (text === 'Rejected') color = 'red';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Documents',
      dataIndex: 'documentStatus',
      key: 'documentStatus',
      render: (text) => {
        let color = 'red';
        if (text === 'Submitted') color = 'orange';
        if (text === 'Verified') color = 'green';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Fee Status',
      dataIndex: 'feeStatus',
      key: 'feeStatus',
      render: (text) => (text === 'Paid' ? <Tag color="green">Paid</Tag> : <Tag color="red">Pending</Tag>),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              dispatch(getApplicantById(record._id));
              setDetailsModalVisible(true);
            }}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="applicant-container">
      <h1>Applicant Management</h1>

      {error && <Alert message={error} type="error" closable style={{ marginBottom: 20 }} />}

      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Select Institution"
              value={selectedInstitution}
              onChange={setSelectedInstitution}
              options={safeInstitutions.map((inst) => ({
                label: inst.name,
                value: inst._id,
              }))}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by Status"
              allowClear
              onChange={setStatusFilter}
              options={[
                { label: 'Applied', value: 'Applied' },
                { label: 'Allotted', value: 'Allotted' },
                { label: 'Admitted', value: 'Admitted' },
                { label: 'Rejected', value: 'Rejected' },
              ]}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              block
            >
              Add Applicant
            </Button>
          </Col>
        </Row>

        <Table
          columns={applicantColumns}
          dataSource={safeApplicants}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="Create Applicant"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Spin spinning={loading}>
          <Form form={form} layout="vertical" onFinish={handleCreateApplicant}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input placeholder="First Name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input placeholder="Last Name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true, type: 'email' }]}
                >
                  <Input placeholder="Email" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Phone"
                  name="phone"
                  rules={[
                    { required: true, pattern: /^\d{10}$/, message: '10 digits required' },
                  ]}
                >
                  <Input placeholder="Phone (10 digits)" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Date of Birth"
                  name="dateOfBirth"
                  rules={[{ required: true }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Gender" name="gender" rules={[{ required: true }]}>
                  <Select
                    options={[
                      { label: 'Male', value: 'Male' },
                      { label: 'Female', value: 'Female' },
                      { label: 'Other', value: 'Other' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Category" name="category" rules={[{ required: true }]}>
                  <Select
                    options={[
                      { label: 'General (GM)', value: 'GM' },
                      { label: 'SC', value: 'SC' },
                      { label: 'ST', value: 'ST' },
                      { label: 'OBC', value: 'OBC' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Address" name="address" rules={[{ required: true }]}>
                  <Input placeholder="Address" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Program" name="program" rules={[{ required: true }]}>
                  <Select
                    placeholder="Select Program"
                    onChange={setSelectedProgram}
                    options={safePrograms.map((p) => ({
                      label: p.name,
                      value: p._id,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Quota Type" name="quotaType" rules={[{ required: true }]}>
                  <Select
                    options={[
                      { label: 'KCET', value: 'KCET' },
                      { label: 'COMEDK', value: 'COMEDK' },
                      { label: 'Management', value: 'Management' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Entry Type" name="entryType" rules={[{ required: true }]}>
                  <Select
                    options={[
                      { label: 'Regular', value: 'Regular' },
                      { label: 'Lateral', value: 'Lateral' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Marks" name="marks" rules={[{ required: true }]}>
                  <InputNumber min={0} max={100} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" block htmlType="submit" loading={loading}>
                Create Applicant
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      <Modal
        title="Applicant Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={null}
        width={700}
      >
        {currentApplicant && (
          <div className="applicant-details">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <p>
                  <strong>Name:</strong> {currentApplicant.firstName} {currentApplicant.lastName}
                </p>
              </Col>
              <Col xs={24} sm={12}>
                <p>
                  <strong>Email:</strong> {currentApplicant.email}
                </p>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <p>
                  <strong>Phone:</strong> {currentApplicant.phone}
                </p>
              </Col>
              <Col xs={24} sm={12}>
                <p>
                  <strong>Category:</strong> {currentApplicant.category}
                </p>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <p>
                  <strong>Status:</strong> <Tag color="blue">{currentApplicant.status}</Tag>
                </p>
              </Col>
              <Col xs={24} sm={12}>
                <p>
                  <strong>Admission #:</strong>{' '}
                  {currentApplicant.admissionNumber || 'Not Generated'}
                </p>
              </Col>
            </Row>

            <Divider />

            <h3>Document Status</h3>
            <Select
              value={currentApplicant.documentStatus}
              onChange={(value) =>
                handleUpdateDocumentStatus(currentApplicant._id, value)
              }
              options={[
                { label: 'Pending', value: 'Pending' },
                { label: 'Submitted', value: 'Submitted' },
                { label: 'Verified', value: 'Verified' },
              ]}
              style={{ width: '100%', marginBottom: 16 }}
            />

            <h3>Fee Status</h3>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Select
                  value={currentApplicant.feeStatus}
                  onChange={(value) =>
                    handleUpdateFeeStatus(
                      currentApplicant._id,
                      value,
                      currentApplicant.feeAmount
                    )
                  }
                  options={[
                    { label: 'Pending', value: 'Pending' },
                    { label: 'Paid', value: 'Paid' },
                  ]}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} sm={12}>
                <InputNumber
                  placeholder="Fee Amount"
                  value={currentApplicant.feeAmount}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Applicant;