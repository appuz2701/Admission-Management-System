import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Table,
  Button,
  Modal,
  Select,
  Space,
  Tag,
  Alert,
  Spin,
  Row,
  Col,
  Statistic,
  Divider,
} from 'antd';
import { CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { getApplicants } from '../redux/slices/applicantSlice';
import {
  allocateSeat,
  generateAdmissionNumber,
  confirmAdmission,
} from '../redux/slices/admissionSlice';
import { getInstitutions } from '../redux/slices/institutionSlice';
import '../styles/Admission.css';

function Admission() {
  const dispatch = useDispatch();
  const { applicants, loading: applicantLoading } = useSelector((state) => state.applicant);
  const { institutions } = useSelector((state) => state.institution);
  const { loading: admissionLoading, error, success, message } = useSelector(
    (state) => state.admission
  );
  const { user } = useSelector((state) => state.auth);

  // Ensure data is always an array to prevent crashes
  const safeInstitutions = Array.isArray(institutions) ? institutions : [];
  const safeApplicants = Array.isArray(applicants) ? applicants : [];

  const [selectedInstitution, setSelectedInstitution] = useState(user?.institution?._id);
  // eslint-disable-next-line no-unused-vars
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [allocateModalVisible, setAllocateModalVisible] = useState(false);
  const [admitModalVisible, setAdmitModalVisible] = useState(false);

  useEffect(() => {
    dispatch(getInstitutions());
  }, [dispatch]);

  useEffect(() => {
    if (selectedInstitution) {
      dispatch(getApplicants({ institution: selectedInstitution, status: 'Applied' }));
    }
  }, [dispatch, selectedInstitution]);

  const handleAllocateSeat = () => {
    dispatch(
      allocateSeat({ applicantId: selectedApplicant._id, programId: selectedApplicant.program._id })
    ).then(() => {
      setAllocateModalVisible(false);
      dispatch(getApplicants({ institution: selectedInstitution }));
    });
  };

  const handleGenerateAdmissionNumber = () => {
    dispatch(generateAdmissionNumber(selectedApplicant._id)).then(() => {
      dispatch(getApplicants({ institution: selectedInstitution }));
      setModalVisible(false);
    });
  };

  const handleConfirmAdmission = () => {
    dispatch(confirmAdmission(selectedApplicant._id)).then(() => {
      dispatch(getApplicants({ institution: selectedInstitution }));
      setAdmitModalVisible(false);
    });
  };

  const applicantColumns = [
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
      title: 'Quota',
      dataIndex: 'quotaType',
      key: 'quotaType',
      render: (text) => <Tag color="blue">{text}</Tag>,
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
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Admission #',
      dataIndex: 'admissionNumber',
      key: 'admissionNumber',
      render: (text) => (text ? <Tag color="green">{text}</Tag> : <Tag>Pending</Tag>),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'Applied' && (
            <Button
              size="small"
              onClick={() => {
                setSelectedApplicant(record);
                setAllocateModalVisible(true);
              }}
            >
              Allocate
            </Button>
          )}
          {record.status === 'Allotted' && !record.admissionNumber && (
            <Button
              size="small"
              onClick={() => {
                setSelectedApplicant(record);
                setModalVisible(true);
              }}
            >
              Generate No.
            </Button>
          )}
          {record.admissionNumber && record.status !== 'Admitted' && (
            <Button
              size="small"
              type="primary"
              onClick={() => {
                setSelectedApplicant(record);
                setAdmitModalVisible(true);
              }}
            >
              Confirm
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="admission-container">
      <h1>Admission Management</h1>

      {error && <Alert message={error} type="error" closable style={{ marginBottom: 20 }} />}
      {success && <Alert message={message} type="success" closable style={{ marginBottom: 20 }} />}

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Total Applicants"
              value={safeApplicants.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Admitted"
              value={safeApplicants.filter((a) => a.status === 'Admitted').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Select
          placeholder="Select Institution"
          value={selectedInstitution}
          onChange={setSelectedInstitution}
          options={safeInstitutions.map((inst) => ({
            label: inst.name,
            value: inst._id,
          }))}
          style={{ width: 200, marginBottom: 16 }}
        />

        <Table
          columns={applicantColumns}
          dataSource={safeApplicants}
          rowKey="_id"
          loading={applicantLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="Allocate Seat"
        open={allocateModalVisible}
        onCancel={() => setAllocateModalVisible(false)}
        footer={null}
      >
        <Spin spinning={admissionLoading}>
          {selectedApplicant && (
            <div>
              <p>
                <strong>Applicant:</strong> {selectedApplicant.firstName}{' '}
                {selectedApplicant.lastName}
              </p>
              <p>
                <strong>Program:</strong> {selectedApplicant.program.name}
              </p>
              <p>
                <strong>Quota:</strong> {selectedApplicant.quotaType}
              </p>
              <Divider />
              <Button
                type="primary"
                block
                onClick={handleAllocateSeat}
                loading={admissionLoading}
              >
                Confirm Seat Allocation
              </Button>
            </div>
          )}
        </Spin>
      </Modal>

      <Modal
        title="Generate Admission Number"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Spin spinning={admissionLoading}>
          {selectedApplicant && (
            <div>
              <p>
                <strong>Applicant:</strong> {selectedApplicant.firstName}{' '}
                {selectedApplicant.lastName}
              </p>
              <p>
                <strong>Status:</strong> {selectedApplicant.status}
              </p>
              <p style={{ color: '#faad14' }}>
                Once generated, the admission number cannot be changed.
              </p>
              <Divider />
              <Button
                type="primary"
                block
                onClick={handleGenerateAdmissionNumber}
                loading={admissionLoading}
              >
                Generate Admission Number
              </Button>
            </div>
          )}
        </Spin>
      </Modal>

      <Modal
        title="Confirm Admission"
        open={admitModalVisible}
        onCancel={() => setAdmitModalVisible(false)}
        footer={null}
      >
        <Spin spinning={admissionLoading}>
          {selectedApplicant && (
            <div>
              <p>
                <strong>Applicant:</strong> {selectedApplicant.firstName}{' '}
                {selectedApplicant.lastName}
              </p>
              <p>
                <strong>Admission #:</strong> {selectedApplicant.admissionNumber}
              </p>
              <p>
                <strong>Documents:</strong>{' '}
                <Tag
                  color={selectedApplicant.documentStatus === 'Verified' ? 'green' : 'red'}
                >
                  {selectedApplicant.documentStatus}
                </Tag>
              </p>
              <p>
                <strong>Fee Status:</strong>{' '}
                <Tag color={selectedApplicant.feeStatus === 'Paid' ? 'green' : 'red'}>
                  {selectedApplicant.feeStatus}
                </Tag>
              </p>

              {selectedApplicant.feeStatus !== 'Paid' && (
                <Alert message="Fee must be paid before confirming admission" type="warning" />
              )}
              {selectedApplicant.documentStatus !== 'Verified' && (
                <Alert
                  message="All documents must be verified before confirming admission"
                  type="warning"
                />
              )}

              <Divider />
              <Button
                type="primary"
                block
                onClick={handleConfirmAdmission}
                loading={admissionLoading}
                disabled={
                  selectedApplicant.feeStatus !== 'Paid' ||
                  selectedApplicant.documentStatus !== 'Verified'
                }
              >
                Confirm Admission
              </Button>
            </div>
          )}
        </Spin>
      </Modal>
    </div>
  );
}

export default Admission;