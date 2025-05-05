import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginRequest(state) {
      state.loading = true;
      state.error = null;
    },

    loginSuccess(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logoutUser(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
    verifyRequest(state) {
      state.loading = true;
      state.error = null;
    },
    varifySuccess(state) {
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    verifyFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    checkAuthState: (state) => {
      const user = JSON.parse(localStorage.getItem("user"));
      

      if (user?.token) {
        state.user = user;
        state.isAuthenticated = true;
      } else {
        state.user = null;
        state.isAuthenticated = false;
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  loginFailed,
  loginRequest,
  loginSuccess,
  logoutUser,
  clearError,
  checkAuthState,
  varifySuccess,
  verifyFailed,
  verifyRequest,
} = authSlice.actions;

export default authSlice.reducer;
