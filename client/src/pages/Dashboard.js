import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Spin,
  Select,
  Progress,
  Tag,
} from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { getDashboard } from '../redux/slices/dashboardSlice';
// eslint-disable-next-line no-unused-vars
import { getPrograms } from '../redux/slices/programSlice';
import { getInstitutions } from '../redux/slices/institutionSlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import '../styles/Dashboard.css';

function Dashboard() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.dashboard);
  const { institutions } = useSelector((state) => state.institution);
  const { user } = useSelector((state) => state.auth);
  
  // Ensure data is always an array to prevent crashes
  const safeInstitutions = Array.isArray(institutions) ? institutions : [];
  
  const [selectedInstitution, setSelectedInstitution] = React.useState(
    user?.institution?._id
  );

  useEffect(() => {
    dispatch(getInstitutions());
    dispatch(getDashboard({ institution: selectedInstitution }));
  }, [dispatch, selectedInstitution]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const categoryColumns = [
    {
      title: 'Category',
      dataIndex: '_id',
      key: '_id',
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: 'Total Applicants',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Admitted',
      dataIndex: 'admitted',
      key: 'admitted',
    },
  ];

  const programColumns = [
    {
      title: 'Program Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
    },
    {
      title: 'Course Type',
      dataIndex: 'courseType',
      key: 'courseType',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Total Intake',
      dataIndex: 'totalIntake',
      key: 'totalIntake',
    },
    {
      title: 'Filled',
      dataIndex: 'totalFilled',
      key: 'totalFilled',
    },
    {
      title: 'Remaining',
      dataIndex: 'remainingSeats',
      key: 'remainingSeats',
      render: (text) => <Tag color="orange">{text}</Tag>,
    },
    {
      title: 'Fill %',
      dataIndex: 'fillingPercentage',
      key: 'fillingPercentage',
      render: (percentage) => (
        <div style={{ width: '100%' }}>
          <Progress percent={parseFloat(percentage)} size="small" />
        </div>
      ),
    },
  ];

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admission Dashboard</h1>
        <Select
          style={{ width: 200 }}
          placeholder="Select Institution"
          value={selectedInstitution}
          onChange={setSelectedInstitution}
          options={safeInstitutions.map((inst) => ({
            label: inst.name,
            value: inst._id,
          }))}
        />
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Applicants"
              value={data?.overview?.totalApplicants || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Admitted"
              value={data?.overview?.totalAdmitted || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Documents"
              value={data?.status?.pendingDocuments || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Fees"
              value={data?.status?.pendingFees || 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} md={12}>
          <Card title="Capacity Utilization">
            {data?.programStats && data.programStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.programStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="code" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalIntake" fill="#1890ff" name="Total Intake" />
                  <Bar dataKey="totalFilled" fill="#52c41a" name="Filled" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No program data available</p>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Admission Status">
            {data?.statusStats && data.statusStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.statusStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, count }) => `${_id}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.statusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p>No status data available</p>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24}>
          <Card title="Quota-wise Statistics">
            <Row gutter={[16, 16]}>
              {data?.quotaStats &&
                Object.entries(data.quotaStats).map(([quota, stats]) => (
                  <Col xs={24} sm={12} md={8} key={quota}>
                    <Card size="small">
                      <p style={{ fontWeight: 'bold', marginBottom: 10 }}>
                        {quota} Quota
                      </p>
                      <p>Total Seats: {stats.total}</p>
                      <p>Filled: {stats.filled}</p>
                      <p>Remaining: {stats.remaining}</p>
                      <Progress
                        percent={((stats.filled / stats.total) * 100).toFixed(2)}
                        size="small"
                      />
                    </Card>
                  </Col>
                ))}
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24}>
          <Card title="Program-wise Admission Details">
            <Table
              columns={programColumns}
              dataSource={data?.programStats || []}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
      </Row>

      {data?.categoryStats && Array.isArray(data.categoryStats) && data.categoryStats.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          <Col xs={24}>
            <Card title="Category-wise Distribution">
              <Table
                columns={categoryColumns}
                dataSource={data.categoryStats}
                rowKey="_id"
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default Dashboard;