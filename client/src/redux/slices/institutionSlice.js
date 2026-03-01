import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const createInstitution = createAsyncThunk(
  'institution/create',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/institution/create`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.institution;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getInstitutions = createAsyncThunk(
  'institution/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/institution/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.institutions;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createCampus = createAsyncThunk(
  'institution/createCampus',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/institution/campus/create`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.campus;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getCampuses = createAsyncThunk(
  'institution/getCampuses',
  async (institutionId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/institution/campus/list`, {
        params: { institution: institutionId },
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.campuses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createDepartment = createAsyncThunk(
  'institution/createDepartment',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/institution/department/create`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.department;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getDepartments = createAsyncThunk(
  'institution/getDepartments',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/institution/department/list`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.departments;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  institutions: [],
  campuses: [],
  departments: [],
  loading: false,
  error: null,
};

const institutionSlice = createSlice({
  name: 'institution',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInstitution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInstitution.fulfilled, (state, action) => {
        state.loading = false;
        state.institutions.push(action.payload);
      })
      .addCase(createInstitution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getInstitutions.fulfilled, (state, action) => {
        state.institutions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getInstitutions.rejected, (state, action) => {
        state.error = action.payload;
        state.institutions = [];
      })
      .addCase(createCampus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCampus.fulfilled, (state, action) => {
        state.loading = false;
        state.campuses.push(action.payload);
      })
      .addCase(createCampus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCampuses.fulfilled, (state, action) => {
        state.campuses = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getCampuses.rejected, (state, action) => {
        state.error = action.payload;
        state.campuses = [];
      })
      .addCase(createDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.departments.push(action.payload);
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getDepartments.fulfilled, (state, action) => {
        state.departments = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getDepartments.rejected, (state, action) => {
        state.error = action.payload;
        state.departments = [];
      });
  },
});

export const { clearError } = institutionSlice.actions;
export default institutionSlice.reducer;