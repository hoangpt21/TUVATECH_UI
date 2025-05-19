import { message, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { verifyUserAPI } from '../../apis';

function AccountVerification() {
    const [searchParams] = useSearchParams();
    const {email, token} = Object.fromEntries([...searchParams]);
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        if(email && token) {
            verifyUserAPI({email, token})
            .then(() => setVerified(true))
        }
    },[email, token])

    if(!email || !token) {
        return <Navigate to="/404"/>
    }

    if(!verified) {
        return  <Spin tip="Verifying your account..." size="large" fullscreen/>
    }
       
    return <Navigate to={`/login?verifiedEmail=${email}`}/>
}

export default AccountVerification;
