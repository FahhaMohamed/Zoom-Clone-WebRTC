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
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
    checkAuthState: (state) => {
      const user = JSON.parse(localStorage.getItem("user"));
      console.log(user?.token);
      
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
  logout,
  clearError,
  checkAuthState,
} = authSlice.actions;

export default authSlice.reducer;
