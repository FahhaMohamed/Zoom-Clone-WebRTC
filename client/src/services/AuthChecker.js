import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { userProfile } from "../services/auth.service";

export default function AuthChecker({ setLoading }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const valid = await userProfile(dispatch);
      setLoading(false);
      if (!valid) {
        navigate("/login", { replace: true });
      }
      console.log("ISAUTH :: ", valid);
    })();
  }, [dispatch, navigate, setLoading]);

  return null;
}
