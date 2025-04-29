import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuthState } from '../slices/authSlice';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);

  return children;
};

export default AuthInitializer;