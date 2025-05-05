import axios from "axios";
import {
  verifyRequest,
  varifySuccess,
  verifyFailed,
  logoutUser
} from "../slices/authSlice";

const API_URL = "http://localhost:5000/api/v1";

const register = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/login`, userData);
  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const verifyUser = (token) => async ( dispatch) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    dispatch(verifyRequest());
    await axios.get(`${API_URL}/auth/verifyUser`, config);
    dispatch(varifySuccess());
  } catch (error) {
    dispatch(verifyFailed(error.response.data.message));
  }
};

const logout = () => {
  localStorage.removeItem("user");
  logoutUser();
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  verifyUser,
};

export default authService;
