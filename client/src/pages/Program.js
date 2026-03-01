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
  Tag,
  Alert,
  Spin,
  Row,
  Col,
  InputNumber,
  Tabs,
  Divider,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  createProgram,
  getPrograms,
  createAcademicYear,
  getAcademicYears,
} from '../redux/slices/programSlice';
import { getInstitutions, getDepartments } from '../redux/slices/institutionSlice';
import '../styles/Program.css';

function Program() {
  const dispatch = useDispatch();
  const { programs, academicYears, loading, error } = useSelector((state) => state.program);
  const { institutions, departments } = useSelector((state) => state.institution);
  const { user } = useSelector((state) => state.auth);
  
  // Ensure data is always an array to prevent crashes
  const safeInstitutions = Array.isArray(institutions) ? institutions : [];
  const safeDepartments = Array.isArray(departments) ? departments : [];
  const safePrograms = Array.isArray(programs) ? programs : [];
  const safeAcademicYears = Array.isArray(academicYears) ? academicYears : [];
  
  const [form] = Form.useForm();
  const [academicYearForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [academicYearModalVisible, setAcademicYearModalVisible] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(user?.institution?._id || null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [quotas, setQuotas] = useState([
    { name: 'KCET', seats: 0 },
    { name: 'COMEDK', seats: 0 },
    { name: 'Management', seats: 0 },
  ]);
  const [totalIntake, setTotalIntake] = useState(0);

  useEffect(() => {
    dispatch(getInstitutions());
  }, [dispatch]);

  useEffect(() => {
    if (selectedInstitution) {
      dispatch(getDepartments({ institution: selectedInstitution }));
      dispatch(getAcademicYears(selectedInstitution));
      dispatch(getPrograms({ institution: selectedInstitution }));
    }
  }, [dispatch, selectedInstitution]);

  const handleAddAcademicYear = (values) => {
    if (!selectedInstitution) {
      message.error('Please select an institution first');
      return;
    }

    const academicYearData = {
      year: parseInt(values.year),
      startDate: values.startDate ? new Date(values.startDate).toISOString() : null,
      endDate: values.endDate ? new Date(values.endDate).toISOString() : null,
      admissionStartDate: values.admissionStartDate ? new Date(values.admissionStartDate).toISOString() : null,
      admissionEndDate: values.admissionEndDate ? new Date(values.admissionEndDate).toISOString() : null,
      institution: selectedInstitution,
    };

    dispatch(createAcademicYear(academicYearData))
      .unwrap()
      .then(() => {
        message.success('Academic Year created successfully');
        academicYearForm.resetFields();
        setAcademicYearModalVisible(false);
        dispatch(getAcademicYears(selectedInstitution));
      })
      .catch((err) => {
        message.error(err || 'Failed to create academic year');
      });
  };

  const handleAddProgram = (values) => {
    const totalQuotaSeats = quotas.reduce((sum, q) => sum + parseInt(q.seats || 0), 0);
    
    if (totalQuotaSeats !== parseInt(totalIntake)) {
      message.error(
        `Total quota seats (${totalQuotaSeats}) must equal total intake (${totalIntake})`
      );
      return;
    }

    if (!selectedDepartment) {
      message.error('Please select a department');
      return;
    }

    if (!values.academicYear) {
      message.error('Please select an academic year');
      return;
    }

    const programData = {
      name: values.name,
      code: values.code,
      department: selectedDepartment,
      institution: selectedInstitution,
      academicYear: values.academicYear,
      courseType: values.courseType,
      entryType: values.entryType,
      admissionMode: values.admissionMode,
      totalIntake: parseInt(totalIntake),
      quotas: quotas.map((q) => ({
        name: q.name,
        seats: parseInt(q.seats || 0),
      })),
    };

    dispatch(createProgram(programData))
      .unwrap()
      .then(() => {
        message.success('Program created successfully');
        form.resetFields();
        setModalVisible(false);
        setQuotas([
          { name: 'KCET', seats: 0 },
          { name: 'COMEDK', seats: 0 },
          { name: 'Management', seats: 0 },
        ]);
        setTotalIntake(0);
        setSelectedDepartment(null);
        dispatch(getPrograms({ institution: selectedInstitution }));
      })
      .catch((err) => {
        message.error(err || 'Failed to create program');
      });
  };

  const handleQuotaChange = (index, seats) => {
    const updatedQuotas = [...quotas];
    updatedQuotas[index].seats = seats || 0;
    setQuotas(updatedQuotas);
  };

  const programColumns = [
    {
      title: 'Program Name',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="blue">{text}</Tag>,
      width: '10%',
    },
    {
      title: 'Department',
      dataIndex: ['department', 'name'],
      key: 'department',
      width: '15%',
    },
    {
      title: 'Course Type',
      dataIndex: 'courseType',
      key: 'courseType',
      render: (text) => <Tag color="green">{text}</Tag>,
      width: '10%',
    },
    {
      title: 'Entry Type',
      dataIndex: 'entryType',
      key: 'entryType',
      render: (text) => <Tag color="orange">{text}</Tag>,
      width: '10%',
    },
    {
      title: 'Intake',
      dataIndex: 'totalIntake',
      key: 'totalIntake',
      width: '8%',
    },
    {
      title: 'Filled',
      dataIndex: 'totalFilled',
      key: 'totalFilled',
      width: '8%',
    },
    {
      title: 'Remaining',
      key: 'remaining',
      render: (_, record) => record.totalIntake - record.totalFilled,
      width: '8%',
    },
  ];

  const academicYearColumns = [
    {
      title: 'Academic Year',
      dataIndex: 'year',
      key: 'year',
      render: (text) => <Tag color="purple">{text}</Tag>,
      width: '15%',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (text) => (text ? dayjs(text).format('DD/MM/YYYY') : '-'),
      width: '15%',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (text) => (text ? dayjs(text).format('DD/MM/YYYY') : '-'),
      width: '15%',
    },
    {
      title: 'Admission Start',
      dataIndex: 'admissionStartDate',
      key: 'admissionStartDate',
      render: (text) => (text ? dayjs(text).format('DD/MM/YYYY') : '-'),
      width: '15%',
    },
    {
      title: 'Admission End',
      dataIndex: 'admissionEndDate',
      key: 'admissionEndDate',
      render: (text) => (text ? dayjs(text).format('DD/MM/YYYY') : '-'),
      width: '15%',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (text) => (text ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>),
      width: '10%',
    },
  ];

  const totalQuotaSeats = quotas.reduce((sum, q) => sum + parseInt(q.seats || 0), 0);
  const quotaBalance = totalIntake - totalQuotaSeats;

  return (
    <div className="program-container">
      <h1>Program & Academic Year Management</h1>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          closable
          style={{ marginBottom: 20 }}
        />
      )}

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>
              Select Institution
            </label>
            <Select
              placeholder="Select an institution"
              value={selectedInstitution}
              onChange={setSelectedInstitution}
              options={safeInstitutions.map((inst) => ({
                label: inst.name,
                value: inst._id,
              }))}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      {selectedInstitution && (
        <Tabs
          items={[
            {
              key: '1',
              label: 'Academic Years',
              children: (
                <Card>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setAcademicYearModalVisible(true)}
                    style={{ marginBottom: 16 }}
                  >
                    Create Academic Year
                  </Button>

                  <Table
                    columns={academicYearColumns}
                    dataSource={safeAcademicYears}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1000 }}
                  />
                </Card>
              ),
            },
            {
              key: '2',
              label: 'Programs',
              children: (
                <Card>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalVisible(true)}
                    style={{ marginBottom: 16 }}
                  >
                    Create Program
                  </Button>

                  <Table
                    columns={programColumns}
                    dataSource={safePrograms}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1200 }}
                  />
                </Card>
              ),
            },
          ]}
        />
      )}

      {/* Create Academic Year Modal */}
      <Modal
        title="Create Academic Year"
        open={academicYearModalVisible}
        onCancel={() => {
          setAcademicYearModalVisible(false);
          academicYearForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Spin spinning={loading}>
          <Form
            form={academicYearForm}
            layout="vertical"
            onFinish={handleAddAcademicYear}
          >
            <Form.Item
              label="Academic Year"
              name="year"
              rules={[
                { required: true, message: 'Please enter academic year' },
                {
                  pattern: /^\d{4}$/,
                  message: 'Please enter a valid year (4 digits)',
                },
              ]}
            >
              <Input placeholder="e.g., 2024" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Start Date"
                  name="startDate"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <input type="date" style={{ width: '100%', padding: '8px' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="End Date"
                  name="endDate"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <input type="date" style={{ width: '100%', padding: '8px' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Admission Start Date"
                  name="admissionStartDate"
                >
                  <input type="date" style={{ width: '100%', padding: '8px' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Admission End Date"
                  name="admissionEndDate"
                >
                  <input type="date" style={{ width: '100%', padding: '8px' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" block htmlType="submit" loading={loading}>
                Create Academic Year
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* Create Program Modal */}
      <Modal
        title="Create Program"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setQuotas([
            { name: 'KCET', seats: 0 },
            { name: 'COMEDK', seats: 0 },
            { name: 'Management', seats: 0 },
          ]);
          setTotalIntake(0);
          setSelectedDepartment(null);
        }}
        footer={null}
        width={700}
      >
        <Spin spinning={loading}>
          <Form form={form} layout="vertical" onFinish={handleAddProgram}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Program Name"
                  name="name"
                  rules={[{ required: true, message: 'Program name is required' }]}
                >
                  <Input placeholder="e.g., Computer Science" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Program Code"
                  name="code"
                  rules={[{ required: true, message: 'Program code is required' }]}
                >
                  <Input placeholder="e.g., CSE" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Department"
                  name="department"
                  rules={[{ required: true, message: 'Department is required' }]}
                >
                  <Select
                    placeholder="Select Department"
                    onChange={setSelectedDepartment}
                    options={safeDepartments.map((dept) => ({
                      label: dept.name,
                      value: dept._id,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Academic Year"
                  name="academicYear"
                  rules={[{ required: true, message: 'Academic year is required' }]}
                >
                  <Select
                    placeholder="Select Academic Year"
                    options={safeAcademicYears.map((ay) => ({
                      label: ay.year.toString(),
                      value: ay._id,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Course Type"
                  name="courseType"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Select
                    options={[
                      { label: 'UG (Under Graduate)', value: 'UG' },
                      { label: 'PG (Post Graduate)', value: 'PG' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Entry Type"
                  name="entryType"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Select
                    options={[
                      { label: 'Regular', value: 'Regular' },
                      { label: 'Lateral', value: 'Lateral' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Admission Mode"
                  name="admissionMode"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Select
                    options={[
                      { label: 'Government', value: 'Government' },
                      { label: 'Management', value: 'Management' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Form.Item label="Total Intake" required>
              <InputNumber
                min={1}
                value={totalIntake}
                onChange={setTotalIntake}
                style={{ width: '100%' }}
                placeholder="e.g., 100"
              />
            </Form.Item>

            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 12 }}>
              Quota Configuration
            </label>

            {quotas.map((quota, index) => (
              <Row gutter={16} key={quota.name} style={{ marginBottom: 12 }}>
                <Col xs={12} sm={8}>
                  <span>{quota.name}</span>
                </Col>
                <Col xs={12} sm={16}>
                  <InputNumber
                    min={0}
                    max={totalIntake}
                    value={quota.seats}
                    onChange={(val) => handleQuotaChange(index, val)}
                    style={{ width: '100%' }}
                    placeholder="Seats"
                  />
                </Col>
              </Row>
            ))}

            <Alert
              message={
                quotaBalance === 0
                  ? `✓ Quota configuration is correct (Total: ${totalQuotaSeats})`
                  : `⚠ Quota balance: ${quotaBalance > 0 ? '+' : ''}${quotaBalance} (Total: ${totalQuotaSeats})`
              }
              type={quotaBalance === 0 ? 'success' : 'warning'}
              style={{ marginTop: 12, marginBottom: 16 }}
            />

            <Form.Item>
              <Button
                type="primary"
                block
                htmlType="submit"
                loading={loading}
                disabled={quotaBalance !== 0}
              >
                Create Program
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}

export default Program;
