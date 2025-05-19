import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizeAxiosInstance from '../../utils/authorizeAxios';


const API_URL = `/v1/coupons`;
const initialState = {
  coupons: [],
  activeCoupons: [],
  couponDetail: {},
};

// Async thunk actions
export const fetchAllCoupons = createAsyncThunk(
  'coupon/fetchAllCoupons',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const coupons = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(API_URL, {
          params: {
            limit,
            offset,
            select
          }
        });
        coupons.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return coupons;
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

export const getActiveCoupons = createAsyncThunk(
  'coupon/getActiveCoupons',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const activeCoupons = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`${API_URL}/active`, {
          params: {
            limit,
            offset,
            select
          }
        });
        activeCoupons.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return activeCoupons;
    }
    else {
      const response = await authorizeAxiosInstance.get(`${API_URL}/active`, {
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

export const getCouponById = createAsyncThunk(
  'coupon/getCouponById',
  async ({id, select = '*'}) => {
    const response = await authorizeAxiosInstance.get(`${API_URL}/${id}`, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const getCouponByCode = createAsyncThunk(
  'coupon/getCouponByCode',
  async ({code, select = '*'}) => {
    const response = await authorizeAxiosInstance.get(`${API_URL}/code/${code}`, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const getActiveCouponsByCode = createAsyncThunk(
  'coupon/getActiveCouponsByCode',
  async ({code, select = '*'}) => {
    const response = await authorizeAxiosInstance.get(`${API_URL}/active/code/${code}`, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const addCoupon = createAsyncThunk(
  'coupon/addCoupon',
  async (couponData) => {
    const response = await authorizeAxiosInstance.post(API_URL, couponData);
    return response.data;
  }
);

export const updateCoupon = createAsyncThunk(
  'coupon/updateCoupon',
  async ({ id, couponData, select = '*'}) => {
    const response = await authorizeAxiosInstance.put(`${API_URL}/${id}`, couponData, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const deleteCoupon = createAsyncThunk(
  'coupon/deleteCoupon',
  async (id) => {
    await authorizeAxiosInstance.delete(`${API_URL}/${id}`);
    return id;
  }
);

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCoupons.fulfilled, (state, action) => {
        state.coupons = action.payload;
      })
      .addCase(getActiveCoupons.fulfilled, (state, action) => {
        state.activeCoupons = action.payload;
      })
      .addCase(getActiveCouponsByCode.fulfilled, (state, action) => {
        state.activeCoupons = action.payload;
      })
      .addCase(getCouponByCode.fulfilled, (state, action) => {
        state.coupons = action.payload;
      })
      .addCase(getCouponById.fulfilled, (state, action) => {
        state.couponDetail = action.payload;
      })
      .addCase(addCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.concat(action.payload);
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        const index = state.coupons.findIndex(coupon => coupon.coupon_id === action.payload.coupon_id);
        if (index !== -1) {
          state.coupons[index] = action.payload;
        }
        const activeIndex = state.activeCoupons.findIndex(coupon => coupon.coupon_id === action.payload.coupon_id);
        if (activeIndex !== -1) {
          state.activeCoupons[activeIndex] = action.payload;
        }
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter(coupon => coupon.coupon_id !== action.payload);
        state.activeCoupons = state.activeCoupons.filter(coupon => coupon.coupon_id !== action.payload);
      });
  },
});

export const selectCoupons = (state) => state.coupon.coupons;
export const selectActiveCoupons = (state) => state.coupon.activeCoupons;
export const selectCouponDetail = (state) => state.coupon.couponDetail;
export const couponReducer = couponSlice.reducer; 