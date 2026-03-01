import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const createAcademicYear = createAsyncThunk(
  'program/createAcademicYear',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/program/academic-year/create`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.academicYear;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAcademicYears = createAsyncThunk(
  'program/getAcademicYears',
  async (institutionId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/program/academic-year/list`, {
        params: { institution: institutionId },
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.academicYears;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createProgram = createAsyncThunk(
  'program/create',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/program/create`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.program;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getPrograms = createAsyncThunk(
  'program/getAll',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/program/list`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.programs;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getProgramById = createAsyncThunk(
  'program/getById',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/program/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.program;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateProgram = createAsyncThunk(
  'program/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/api/program/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.program;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  programs: [],
  academicYears: [],
  currentProgram: null,
  loading: false,
  error: null,
};

const programSlice = createSlice({
  name: 'program',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProgram.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProgram.fulfilled, (state, action) => {
        state.loading = false;
        state.programs.push(action.payload);
      })
      .addCase(createProgram.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getPrograms.fulfilled, (state, action) => {
        state.programs = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getPrograms.rejected, (state, action) => {
        state.error = action.payload;
        state.programs = [];
      })
      .addCase(getProgramById.fulfilled, (state, action) => {
        state.currentProgram = action.payload;
      })
      .addCase(createAcademicYear.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAcademicYear.fulfilled, (state, action) => {
        state.loading = false;
        state.academicYears.push(action.payload);
      })
      .addCase(createAcademicYear.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAcademicYears.fulfilled, (state, action) => {
        state.academicYears = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAcademicYears.rejected, (state, action) => {
        state.error = action.payload;
        state.academicYears = [];
      })
      .addCase(updateProgram.fulfilled, (state, action) => {
        const index = state.programs.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.programs[index] = action.payload;
        }
      });
  },
});

export const { clearError } = programSlice.actions;
export default programSlice.reducer;