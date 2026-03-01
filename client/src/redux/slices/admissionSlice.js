import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const allocateSeat = createAsyncThunk(
  'admission/allocateSeat',
  async ({ applicantId, programId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/admission/allocate-seat`,
        { applicantId, programId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const generateAdmissionNumber = createAsyncThunk(
  'admission/generateNumber',
  async (applicantId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/admission/generate-number`,
        { applicantId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const confirmAdmission = createAsyncThunk(
  'admission/confirm',
  async (applicantId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/admission/confirm`,
        { applicantId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  success: false,
  message: '',
};

const admissionSlice = createSlice({
  name: 'admission',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(allocateSeat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(allocateSeat.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(allocateSeat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(generateAdmissionNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateAdmissionNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(generateAdmissionNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(confirmAdmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmAdmission.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(confirmAdmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = admissionSlice.actions;
export default admissionSlice.reducer;