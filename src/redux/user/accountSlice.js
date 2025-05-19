import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizeAxiosInstance from '../../utils/authorizeAxios';

import { message } from 'antd';

const initialState = {
  currentAccount: null,
}

export const loginAccountAPI = createAsyncThunk(
    'account/loginAccountAPI',
    async (data) => {
        const response = await authorizeAxiosInstance.post(`/v1/users/login`, data);
        return response.data;
    }
)

export const logoutAccountAPI = createAsyncThunk(
    "account/logoutAccountAPI",
    async (showSuccessMessage = true) => {
        const response = await authorizeAxiosInstance.delete(`/v1/users/logout`);
        if(showSuccessMessage) {
            message.success("Đã đăng xuất thành công!");
        }
        return response.data;
    }
)

export const updateAccountAPI = createAsyncThunk(
    "account/updateAccountAPI",
    async (data) => {
        const response = await authorizeAxiosInstance.put(`/v1/users/update`, data);
        return response.data;
    }
)

export const listAccountDetail = createAsyncThunk(
    'account/listUserDetail',
    async (userId) => {
        const response = await authorizeAxiosInstance.get(`/v1/users/userdetail/${userId}`);
        return response.data;
    }
)

export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        // updatecurrentAccount: (state, action) => {
        //     let account = action.payload
        //     //xử lý logic

        //     state.currentAccount = user
        // },
    },
    extraReducers:(builder) =>{
        builder.addCase(loginAccountAPI.fulfilled, (state, action) => {
            let account = action.payload;
            state.currentAccount = account;
        });
        builder.addCase(logoutAccountAPI.fulfilled, (state) => {
            state.currentAccount = null;
        });
        builder.addCase(listAccountDetail.fulfilled, (state, action) => {
            const account = action.payload;
            state.currentAccount = account;
        })
        builder.addCase(updateAccountAPI.fulfilled, (state, action) => {
            const account = action.payload;
            state.currentAccount = account;
        })
    }
})

// Action creators are generated for each case reducer function
// export const { updatecurrentAccount } = userSlice.actions
export const selectCurrentAccount = (state) => state.account.currentAccount;
// export userSlice.reducer
export const accountReducer = accountSlice.reducer

// khi muốn tác động vào state tại một component nào đó
// B1: import { useDispatch, useSelector } from 'react-redux'
// B2: import { updatecurrentAccount , fetchUserDetailsAPI , selectCurrentAccount } from '. userSlice' 
//import các action creator (bao gồm sync và async) và selector cần thiết
// B3: const dispatch = useDispatch()
// B4: const currentAccount = useSelector(selectCurrentAccount)
// B5: dispatch(updatecurrentAccount(user))
// B6: dispatch(fetchUserDetailsAPI(userId))
