import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ConfigProvider, Spin } from 'antd';
import { loadUser } from './redux/slices/authSlice';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Institution from './pages/Institution';
import Program from './pages/Program';
import Applicant from './pages/Applicant';
import Admission from './pages/Admission';
import UserManagement from './pages/UserManagement';

// Components
import Layout from './components/Layout';

// Styles
import '../src/styles/App.css';

const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
  },
  components: {
    Layout: {
      colorBgHeader: '#1890ff',
    },
  },
};

function ProtectedRoute({ children, isAuthenticated, loading }) {
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        {/* ✅ Fixed: Added fullscreen={true} */}
        <Spin 
          size="large" 
          tip="Loading..." 
          fullscreen 
        />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const dispatch = useDispatch();
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !user) {
      dispatch(loadUser(storedToken));
    }
  }, [dispatch, user]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        {/* ✅ Fixed: Added fullscreen={true} */}
        <Spin 
          size="large" 
          tip="Initializing Application..." 
          fullscreen 
        />
      </div>
    );
  }

  return (
    <ConfigProvider theme={theme}>
      <Router>
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/institution" element={<Institution />} />
            <Route path="/program" element={<Program />} />
            <Route path="/applicant" element={<Applicant />} />
            <Route path="/admission" element={<Admission />} />
            <Route path="/users" element={<UserManagement />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;