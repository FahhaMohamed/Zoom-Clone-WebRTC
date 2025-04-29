import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentRoom: null,
  participants: [],
  messages: [],
  loading: false,
  error: null,
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    joinRoomRequest(state) {
      state.loading = true;
      state.error = null;
    },
    joinRoomSuccess(state, action) {
      state.currentRoom = action.payload.roomId;
      state.participants = action.payload.participants;
      state.loading = false;
      state.error = null;
    },
    joinRoomFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    leaveRoom(state) {
      state.currentRoom = null;
      state.participants = [];
      state.messages = [];
    },
    addMessage(state, action) {
      state.messages.push(state.payload);
    },
    updateParticipants(state, action) {
      state.participants = action.payload;
    },
  },
});

export const {
  joinRoomFailed,
  joinRoomRequest,
  joinRoomSuccess,
  leaveRoom,
  addMessage,
  updateParticipants,
} = roomSlice.actions;

export default roomSlice.reducer;
