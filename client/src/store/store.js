import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./../slices/authSlice";
import roomReducer from "./../slices/roomSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    room: roomReducer,
  },
});
