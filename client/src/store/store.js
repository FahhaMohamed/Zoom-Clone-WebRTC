import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";
import authReducer from "./../slices/authSlice";
import roomReducer from "./../slices/roomSlice";

//  const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     room: roomReducer,
//   },
// });

const reducer = combineReducers({
  auth: authReducer,
  room: roomReducer,
});

export const store = configureStore({
  reducer,
});
