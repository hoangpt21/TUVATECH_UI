import { useEffect } from "react";
import { listAccountDetail } from '../../redux/user/accountSlice'
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const AuthCallback = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        (async () => {
            const params = new URLSearchParams(window.location.search);
            const userId = params.get('userIdLogin');
            if (userId) {
              const res = await dispatch(listAccountDetail(userId));
              if (!res.error) {
                navigate('/', { replace: true });
              }
            } else navigate('/', { replace: true });
        })()
    }, []);
  }

  export default AuthCallback;