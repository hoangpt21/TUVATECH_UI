import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizeAxiosInstance from '../../utils/authorizeAxios';


const API_URL = `/v1/brands`;
const initialState = {
  brands: [],
  currentBrand: null,
  activeBrands: []
};

// Async thunk actions
export const fetchAllBrands = createAsyncThunk(
  'brand/fetchAllBrands',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const brands = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(API_URL, {
          params: {
            limit,
            offset,
            select
          }
        });
        brands.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return brands;
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

export const getActiveBrands = createAsyncThunk(
  'brand/getActiveBrands',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const activeBrands = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`${API_URL}/active`, {
          params: {
            limit,
            offset,
            select: select
      }
      });
      activeBrands.push(...response.data);
      if(response?.data?.length < 50) break;
      offset += 50;
    }
    return activeBrands;
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

export const getBrandById = createAsyncThunk(
  'brand/getBrandById',
  async ({id, select = '*'}) => {
    const response = await authorizeAxiosInstance.get(`${API_URL}/${id}`, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const addBrand = createAsyncThunk(
  'brand/addBrand',
  async (brandData) => {
    const response = await authorizeAxiosInstance.post(API_URL, brandData);
    return response.data;
  }
);

export const updateBrand = createAsyncThunk(
  'brand/updateBrand',
  async ({ id, brandData, select = '*'}) => {
    const response = await authorizeAxiosInstance.put(`${API_URL}/${id}`, brandData, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const deleteBrand = createAsyncThunk(
  'brand/deleteBrand',
  async (id) => {
    await authorizeAxiosInstance.delete(`${API_URL}/${id}`);
    return id;
  }
);

const brandSlice = createSlice({
  name: 'brand',
  initialState,
  reducers: {
    setCurrentBrand: (state, action) => {
      state.currentBrand = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBrands.fulfilled, (state, action) => {
        state.brands = action.payload;
      })
      .addCase(getActiveBrands.fulfilled, (state, action) => {
        state.activeBrands = action.payload;
      })
      .addCase(getBrandById.fulfilled, (state, action) => {
        state.currentBrand = action.payload;
      })
      .addCase(addBrand.fulfilled, (state, action) => {
        state.brands = state.brands.concat(action.payload);
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        const index = state.brands.findIndex(brand => brand.brand_id === action.payload.brand_id);
        if (index !== -1) {
          state.brands[index] = action.payload;
        }
        const activeIndex = state.activeBrands.findIndex(brand => brand.brand_id === action.payload.brand_id);
        if (activeIndex !== -1) {
          state.activeBrands[activeIndex] = action.payload;
        }
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.brands = state.brands.filter(brand => brand.brand_id !== action.payload);
        state.activeBrands = state.activeBrands.filter(brand => brand.brand_id !== action.payload);
      });
  },
});

export const { setCurrentBrand } = brandSlice.actions;
export const selectBrands = (state) => state.brand.brands;
export const selectActiveBrands = (state) => state.brand.activeBrands;
export const selectCurrentBrand = (state) => state.brand.currentBrand;
export const brandReducer = brandSlice.reducer;