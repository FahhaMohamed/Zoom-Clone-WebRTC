import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,
    isAuthenticated: false,
    user: null,
  },
  reducers: {
    loginRequest(state) {
      return {
        ...state,
        loading: true,
      };
    },
    loginSuccess(action) {
      return {
        loading: false,
        isAuthenticated: true,
        user: action.payload,
      };
    },
    loginFailed(state, action) {
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    },
    registerRequest(state) {
      return {
        ...state,
        loading: true,
      };
    },
    registerSuccess(action) {
      return {
        loading: false,
        isAuthenticated: true,
        user: action.payload,
      };
    },
    registerFailed(state, action) {
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    },
    profileRequest(state) {
      return {
        ...state,
        loading: true,
      };
    },
    profileSuccess(action) {
      return {
        loading: false,
        isAuthenticated: true,
        user: action.payload,
      };
    },
    profileFailed(state, action) {
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    },
    logoutSuccess() {
      return {
        loading: false,
        isAuthenticated: false,
        user: null,
      };
    },

    logoutFail(state, action) {
      return {
        ...state,
        error: action.payload,
      };
    },
    clearError(state) {
      return {
        ...state,
        error: null,
      };
    },
  },
});

export const {
  loginFailed,
  loginRequest,
  loginSuccess,
  clearError,
  registerFailed,
  registerRequest,
  registerSuccess,
  profileFailed,
  profileRequest,
  profileSuccess,
  logoutFail,
  logoutSuccess
} = authSlice.actions;

export default authSlice.reducer;
