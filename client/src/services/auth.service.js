import axios from "axios";
import { toast } from "react-hot-toast";
import {
  loginFailed,
  loginRequest,
  loginSuccess,
  logoutSuccess,
  profileFailed,
  profileRequest,
  profileSuccess,
  registerRequest,
} from "../slices/authSlice";

import { setConfig } from "./setConfig";

const API_URL = "http://localhost:5000/api/v1/auth";

export const login = (email, password) => async (dispatch) => {
  dispatch(loginRequest());
  try {
    await toast.promise(axios.post(`${API_URL}/login`, { email, password }), {
      loading: "Logging in…",
      success: (res) => {
        console.log("TOKEN : ", res.data.token);
        dispatch(loginSuccess(res.data.user));
        localStorage.setItem("token", res.data.token);
        return <b>Login successful!</b>;
      },
      error: (err) => {
        dispatch(loginFailed(err.response.data.message));
        return <b>{err.response.data.message}</b>;
      },
    });
  } catch (e) {}
};

export const register = (name, email, password) => async (dispatch) => {
  dispatch(registerRequest());
  try {
    await toast.promise(
      axios.post(`${API_URL}/register`, { name, email, password }),
      {
        loading: "Signing you up...",
        success: (res) => {
          console.log("TOKEN : ", res.data.token);
          dispatch(loginSuccess(res.data.user));
          localStorage.setItem("token", res.data.token);
          return <b>Signup successful!</b>;
        },
        error: (err) => {
          dispatch(loginFailed(err.response.data.message));
          return <b>{err.response.data.message}</b>;
        },
      }
    );
  } catch (e) {}
};

export const userProfile = async (dispatch) => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  dispatch(profileRequest());

  try {
    const { data } = await axios.get(`${API_URL}/profile`, setConfig(token));
    dispatch(profileSuccess(data.user));
    return true;
  } catch (error) {
    dispatch(profileFailed(error.response.data.message || "Session expired"));
    localStorage.clear();
    return false;
  }
};

export const logout = async (dispatch) => {
  try {
    localStorage.clear();
    dispatch(logoutSuccess());
    toast.success("You have been logged out.");
  } catch (error) {
    dispatch(loginFailed());
    toast.error("Logout failed. Please try again.");
  }
};
