import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  quizzes: [],
  responses: [],
  loading: false,
  error: null,
};

const quizSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {
    setQuizzes: (state, action) => {
      state.quizzes = action.payload;
    },
    setResponses: (state, action) => {
      state.responses = action.payload;
    },
    addResponse: (state, action) => {
      state.responses.push(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setQuizzes, setResponses, addResponse, setLoading, setError } = quizSlice.actions;
export default quizSlice.reducer;