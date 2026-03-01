import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import institutionReducer from './slices/institutionSlice';
import programReducer from './slices/programSlice';
import applicantReducer from './slices/applicantSlice';
import admissionReducer from './slices/admissionSlice';
import dashboardReducer from './slices/dashboardSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    institution: institutionReducer,
    program: programReducer,
    applicant: applicantReducer,
    admission: admissionReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loadUser/fulfilled', 'auth/login/fulfilled'],
        ignoredPaths: ['auth.user'],
      },
    }),
});

export default store;