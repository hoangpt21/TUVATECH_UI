import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizeAxiosInstance from '../../utils/authorizeAxios';


const initialState = {
  allUsers: [],
  totalUsers: 0,
  currentUser: null,
}

export const getTotalUsersAPI = createAsyncThunk(
    'user/getTotalUsersAPI',
    async () => {
        const response = await authorizeAxiosInstance.get(`/v1/users/total`);
        return response.data;
    }
)

export const listAllUsersAPI = createAsyncThunk(
    'user/listAllUsersAPI',
    async ({ limit = 50, offset = 0, select = '*' , isAll = false}) => {
        if(isAll) {
            let offset = 0;
            const users = [];
            while(true) {
                const response = await authorizeAxiosInstance.get(`/v1/users`, {
                    params: {
                        limit,
                        offset,
                        select
                    }
                });
                users.push(...response.data);
                if(response?.data?.length < 50) break;
                offset += 50;
            }
            return users;
        }
        else {
            const response = await authorizeAxiosInstance.get(`/v1/users`, {
                params: {
                    limit,
                    offset,
                    select
                }
            });
            return response.data;
        }
    }
)

export const listUserDetail = createAsyncThunk(
    'user/listUserDetail',
    async (userId) => {
        const response = await authorizeAxiosInstance.get(`/v1/users/userdetail/${userId}`);
        return response.data;
    }
)

export const updateUserRoleAPI = createAsyncThunk(
    "user/updateUserRoleAPI",
    async (data) => {
        const response = await authorizeAxiosInstance.put(`/v1/users/update_role/${data.user_id}`, data);
        return response.data;
    }
)

export const updateUserStatusAPI = createAsyncThunk(
    "user/updateUserStatusAPI",
    async (data) => {
        const response = await authorizeAxiosInstance.put(`/v1/users/update_status/${data.user_id}`, data);
        return response.data;
    }
)

export const deleteUserAPI = createAsyncThunk(
    "user/deleteUserAPI",
    async (userId) => {
        const response = await authorizeAxiosInstance.delete(`/v1/users/delete/${userId}`);
        return userId;
    }
)
export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
    },
    extraReducers:(builder) =>{
        builder.addCase(listUserDetail.fulfilled, (state, action) => {
            let user = action.payload;
            state.currentUser = user;
        });
        builder.addCase(getTotalUsersAPI.fulfilled, (state, action) => {
            state.totalUsers = action.payload;
        });
        builder.addCase(listAllUsersAPI.fulfilled, (state, action) => {
            state.allUsers = action.payload;
        });
        builder.addCase(updateUserRoleAPI.fulfilled, (state, action) => {
            const index = state.allUsers.findIndex(user => user.user_id === action.payload.user_id);
            if (index !== -1) {
                state.allUsers[index] = action.payload;
            }
        })
        builder.addCase(updateUserStatusAPI.fulfilled, (state, action) => {
           const index = state.allUsers.findIndex(user => user.user_id === action.payload.user_id);
            if (index !== -1) {
                state.allUsers[index] = action.payload;
            }
        })
        builder.addCase(deleteUserAPI.fulfilled, (state, action) => {
            state.allUsers = state.allUsers.filter(user => user.user_id !== action.payload);
            state.totalUsers = state.totalUsers - 1;
        })
    }
})

// Action creators are generated for each case reducer function
// export const { updatecurrentUser } = userSlice.actions
export const selectCurrentUser = (state) => state.user.currentUser;
export const selectAllUsers = (state) => state.user.allUsers;
export const selectTotalUsers = (state) => state.user.totalUsers;
// export userSlice.reducer
export const userReducer = userSlice.reducer

// khi muốn tác động vào state tại một component nào đó
// B1: import { useDispatch, useSelector } from 'react-redux'
// B2: import { updatecurrentUser , fetchUserDetailsAPI , selectcurrentUser } from '. userSlice' 
//import các action creator (bao gồm sync và async) và selector cần thiết
// B3: const dispatch = useDispatch()
// B4: const currentUser = useSelector(selectcurrentUser)
// B5: dispatch(updatecurrentUser(user))
// B6: dispatch(fetchUserDetailsAPI(userId))
