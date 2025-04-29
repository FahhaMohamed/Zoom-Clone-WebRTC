import axios from 'axios';

const API_URL =
  "http://localhost:5000/api/v1";

const createRoom = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.post(`${API_URL}/rooms`, {}, config);
  return response.data;
};

const getRoomInfo = async (roomId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.get(`${API_URL}/rooms/${roomId}`, config);
  return response.data;
};

const joinRoom = async (roomId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.post(`${API_URL}/rooms/${roomId}/join`, {}, config);
  return response.data;
};

const roomService = {
  createRoom,
  getRoomInfo,
  joinRoom
};

export default roomService;