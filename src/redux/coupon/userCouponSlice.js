import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizeAxiosInstance from '../../utils/authorizeAxios';

const API_URL = `/v1/user-coupons`;
const initialState = {
  userCoupons: [],
  currentUserCoupon: null
};

export const getAllUserCoupons = createAsyncThunk(
  'userCoupon/getAllUserCoupons',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const userCoupons = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(API_URL, {
          params: {
            limit,
            offset,
            select
          }
        });
        userCoupons.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return userCoupons;
    }
    else {
      const response = await authorizeAxiosInstance.get(API_URL, {
        params: {
          limit,
          offset,
          select
        }
      });
      return response.data;
    }
  }
);

export const getUserCoupons = createAsyncThunk(
  'userCoupon/getUserCoupons',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const userCoupons = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`${API_URL}/user`, {
          params: {
            limit,
            offset,
            select
          }
        });
        userCoupons.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return userCoupons;
    }
    else {
      const response = await authorizeAxiosInstance.get(`${API_URL}/user`, {
        params: {
          limit,
          offset,
          select
        }
      });
      return response.data;
    }
  }
);

export const getSpecificUserCoupon = createAsyncThunk(
  'userCoupon/getSpecificUserCoupon',
  async ({id, select = '*'}) => {
    const response = await authorizeAxiosInstance.get(`${API_URL}/${id}`, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const createUserCoupon = createAsyncThunk(
  'userCoupon/createUserCoupon',
  async (couponData) => {
    const response = await authorizeAxiosInstance.post(API_URL, couponData);
    return response.data;
  }
);

export const updateUserCoupon = createAsyncThunk(
  'userCoupon/updateUserCoupon',
  async ({ couponId, userCouponData, select = '*'}) => {
    const response = await authorizeAxiosInstance.put(`${API_URL}/${couponId}`, userCouponData, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const deleteUserCoupon = createAsyncThunk(
  'userCoupon/deleteUserCoupon',
  async (id) => {
    await authorizeAxiosInstance.delete(`${API_URL}/${id}`);
    return id;
  }
);

const userCouponSlice = createSlice({
  name: 'userCoupon',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllUserCoupons.fulfilled, (state, action) => {
        state.userCoupons = action.payload;
      })
      .addCase(getUserCoupons.fulfilled, (state, action) => {
        state.userCoupons = action.payload;
      })
      .addCase(getSpecificUserCoupon.fulfilled, (state, action) => {
        state.currentUserCoupon = action.payload;
      })
      .addCase(createUserCoupon.fulfilled, (state, action) => {
        state.userCoupons = state.userCoupons.concat(action.payload);
      })
      .addCase(updateUserCoupon.fulfilled, (state, action) => {
        const index = state.userCoupons.findIndex(userCoupon => userCoupon.id === action.payload.id);
        if (index !== -1) {
          state.userCoupons[index] = action.payload;
        }
        if(state.currentUserCoupon?.id === action.payload.id)
        state.currentUserCoupon = action.payload;
      })
      .addCase(deleteUserCoupon.fulfilled, (state, action) => {
        state.userCoupons = state.userCoupons.filter(coupon => coupon.id !== action.payload);
      });
  }
});

export const selectUserCoupons = (state) => state.userCoupon.userCoupons;
export const selectCurrentUserCoupon = (state) => state.userCoupon.currentUserCoupon;

export const userCouponReducer = userCouponSlice.reducer;
