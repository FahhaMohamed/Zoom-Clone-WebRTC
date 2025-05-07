import { createSlice } from "@reduxjs/toolkit";

const roomSlice = createSlice({
  name: "room",
  initialState: {
    loading: false,
    room: null,
  },
  reducers: {
    joinRoomRequest(state) {
      return {
        ...state,
        loading: true,
      };
    },
    joinRoomSuccess(state, action) {
      return {
        loading: false,
        room: action.payload,
      };
    },
    joinRoomFailed(state, action) {
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    },
  },
});

export const { joinRoomFailed, joinRoomRequest, joinRoomSuccess } =
  roomSlice.actions;

export default roomSlice.reducer;
