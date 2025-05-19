import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizeAxiosInstance from '../../utils/authorizeAxios';


const API_URL = `/v1/banners`;
const initialState = {
  banners: [],
  activeBanners: []
};

// Async thunk actions
export const fetchAllBanners = createAsyncThunk(
  'banner/fetchAllBanners',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const banners = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(API_URL, {
          params: {
            limit,
            offset,
            select: select
          }
        });
        banners.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return banners;
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

export const getActiveBanners = createAsyncThunk(
  'banner/getActiveBanners',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const activeBanners = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`${API_URL}/active`, {
          params: {
            limit,
            offset,
            select: select
      }
      });
      activeBanners.push(...response.data);
      if(response?.data?.length < 50) break;
      offset += 50;
    }
    return activeBanners;
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

export const getBannerById = createAsyncThunk(
  'banner/getBannerById',
  async ({id, select = '*'}) => {
    const response = await authorizeAxiosInstance.get(`${API_URL}/${id}`, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const addBanner = createAsyncThunk(
  'banner/addBanner',
  async (bannerData) => {
    const response = await authorizeAxiosInstance.post(API_URL, bannerData);
    return response.data;
  }
);

export const updateBanner = createAsyncThunk(
  'banner/updateBanner',
  async ({ id, bannerData, select = '*'}) => {
    const response = await authorizeAxiosInstance.put(`${API_URL}/${id}`, bannerData, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const deleteBanner = createAsyncThunk(
  'banner/deleteBanner',
  async (id) => {
    await authorizeAxiosInstance.delete(`${API_URL}/${id}`);
    return id;
  }
);

const bannerSlice = createSlice({
  name: 'banner',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBanners.fulfilled, (state, action) => {
        state.banners = action.payload;
      })
      .addCase(getActiveBanners.fulfilled, (state, action) => {
        state.activeBanners = action.payload;
      })
      .addCase(addBanner.fulfilled, (state, action) => {
        state.banners = state.banners.concat(action.payload);
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        const index = state.banners.findIndex(banner => banner.banner_id === action.payload.banner_id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
        const activeIndex = state.activeBanners.findIndex(banner => banner.banner_id === action.payload.banner_id);
        if (activeIndex !== -1) {
          state.activeBanners[activeIndex] = action.payload;
        }
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.banners = state.banners.filter(banner => banner.banner_id !== action.payload);
        state.activeBanners = state.activeBanners.filter(banner => banner.banner_id !== action.payload);
      });
  },
});

export const selectBanners = (state) => state.banner.banners;
export const selectActiveBanners = (state) => state.banner.activeBanners;

export const bannerReducer = bannerSlice.reducer;