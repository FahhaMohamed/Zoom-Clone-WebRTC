import axios from "axios";
import { toast } from "react-hot-toast";
import {
  joinRoomFailed,
  joinRoomRequest,
  joinRoomSuccess,
} from "../slices/roomSlice";
import { setConfig } from "./setConfig";

const API_URL = "https://videoconnectserver-production.up.railway.app/api/v1/room";

export const createRoom =
  (roomId, participantsCount, navigate) => async (dispatch) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to create a room.");
      return;
    }

    dispatch(joinRoomRequest());

    // const user = localStorage.getItem("user");

    try {
      await toast.promise(
        axios.post(
          `${API_URL}/create`,
          { roomId, participantsCount },
          setConfig(token)
        ),
        {
          loading: "Creating room...",
          success: (res) => {
            dispatch(joinRoomSuccess(res.data.room));
            navigate(`/room/${res.data.room.roomId}&${res.data.username}`);
            return <b>Room created successfully!</b>;
          },
          error: (err) => {
            dispatch(
              joinRoomFailed(
                err.response?.data?.message || "Failed to create room"
              )
            );
            return (
              <b>{err.response?.data?.message || "Failed to create room"}</b>
            );
          },
        }
      );
    } catch (error) {}
  };

export const joinRoom = (roomId, navigate) => async (dispatch) => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("You must be logged in to create a room.");
    return;
  }

  dispatch(joinRoomRequest());
  // const user = localStorage.getItem("user");

  try {
    await toast.promise(
      axios.get(`${API_URL}/${roomId}/join`, setConfig(token)),
      {
        loading: "Joining to room...",
        success: (res) => {
          console.log("JOIN :: ", res.data);

          dispatch(joinRoomSuccess(res.data.room));
          navigate(`/room/${res.data.room.roomId}&${res.data.username}`);
          return <b>Room joined successfully!</b>;
        },
        error: (err) => {
          dispatch(
            joinRoomFailed(err.response?.data?.message || "Failed to join room")
          );
          return <b>{err.response?.data?.message || "Failed to join room"}</b>;
        },
      }
    );
  } catch (error) {}
};
