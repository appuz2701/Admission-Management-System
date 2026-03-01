import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const createApplicant = createAsyncThunk(
  'applicant/create',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/applicant/create`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.applicant;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getApplicants = createAsyncThunk(
  'applicant/getAll',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/applicant/list`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.applicants;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getApplicantById = createAsyncThunk(
  'applicant/getById',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/applicant/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.applicant;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateApplicant = createAsyncThunk(
  'applicant/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${API_BASE_URL}/api/applicant/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.applicant;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateDocumentStatus = createAsyncThunk(
  'applicant/updateDocumentStatus',
  async ({ id, documentStatus }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_BASE_URL}/api/applicant/${id}/document-status`,
        { documentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.applicant;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateFeeStatus = createAsyncThunk(
  'applicant/updateFeeStatus',
  async ({ id, feeStatus, feeAmount }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_BASE_URL}/api/applicant/${id}/fee-status`,
        { feeStatus, feeAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.applicant;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  applicants: [],
  currentApplicant: null,
  loading: false,
  error: null,
};

const applicantSlice = createSlice({
  name: 'applicant',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createApplicant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createApplicant.fulfilled, (state, action) => {
        state.loading = false;
        state.applicants.push(action.payload);
      })
      .addCase(createApplicant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getApplicants.pending, (state) => {
        state.loading = true;
      })
      .addCase(getApplicants.fulfilled, (state, action) => {
        state.loading = false;
        state.applicants = action.payload;
      })
      .addCase(getApplicants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getApplicantById.fulfilled, (state, action) => {
        state.currentApplicant = action.payload;
      })
      .addCase(updateApplicant.fulfilled, (state, action) => {
        const index = state.applicants.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.applicants[index] = action.payload;
        }
        state.currentApplicant = action.payload;
      })
      .addCase(updateDocumentStatus.fulfilled, (state, action) => {
        const index = state.applicants.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.applicants[index] = action.payload;
        }
        state.currentApplicant = action.payload;
      })
      .addCase(updateFeeStatus.fulfilled, (state, action) => {
        const index = state.applicants.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.applicants[index] = action.payload;
        }
        state.currentApplicant = action.payload;
      });
  },
});

export const { clearError } = applicantSlice.actions;
export default applicantSlice.reducer;