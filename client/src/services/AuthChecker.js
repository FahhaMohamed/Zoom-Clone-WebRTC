import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { userProfile } from "../services/auth.service";

export default function AuthChecker() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const valid = await userProfile(dispatch);
      if (!valid) {
        navigate("/login", { replace: true });
      }
      console.log("ISAUTH :: ", valid);
    })();
  }, [dispatch, navigate]);

  return null;
}
