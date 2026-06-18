import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  assignments: [],
  submissions: [],
  loading: false,
  error: null,
};

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    setAssignments: (state, action) => {
      state.assignments = action.payload;
    },
    setSubmissions: (state, action) => {
      state.submissions = action.payload;
    },
    addSubmission: (state, action) => {
      state.submissions.push(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setAssignments, setSubmissions, addSubmission, setLoading, setError } = assignmentSlice.actions;
export default assignmentSlice.reducer;