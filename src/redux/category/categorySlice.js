import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizeAxiosInstance from '../../utils/authorizeAxios';


const API_URL = `/v1/categories`;
const initialState = {
  categories: [],
  activeCategories: []
};

// Async thunk actions
export const fetchAllCategories = createAsyncThunk(
  'category/fetchAllCategories',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const categories = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(API_URL, {
          params: {
            limit,
            offset,
            select: select
          }
        });
        categories.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return categories;
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

export const getActiveCategories = createAsyncThunk(
  'category/getActiveCategories',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const activeCategories = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`${API_URL}/active`, {
          params: {
            limit,
            offset,
            select: select
          }
        });
        activeCategories.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return activeCategories;
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

export const fetchCategoriesByType = createAsyncThunk(
  'category/fetchCategoriesByType',
  async ({categoryType, select = '*', isAll = false, limit = 50, offset = 0}) => {
    if(isAll) {
      let offset = 0;
      const categories = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`${API_URL}/${categoryType}`, {
          params: {
            limit,
            offset,
            select: select
          }
        });
        categories.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return categories;
    }
    else {
      const response = await authorizeAxiosInstance.get(`${API_URL}/${categoryType}`, {
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

export const fetchActiveCategoriesByType = createAsyncThunk(
  'category/fetchActiveCategoriesByType',
  async ({categoryType, select = '*', isAll = false, limit = 50, offset = 0}) => {
    if(isAll) {
      let offset = 0;
      const activeCategories = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`${API_URL}/active/${categoryType}`, {
          params: {
            limit,
            offset,
            select: select
          }
        });
        activeCategories.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return activeCategories;
    }
    else {
      const response = await authorizeAxiosInstance.get(`${API_URL}/active/${categoryType}`, {
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

export const getCategoryById = createAsyncThunk(
  'category/getCategoryById',
  async ({id, select = '*'}) => {
    const response = await authorizeAxiosInstance.get(`${API_URL}/${id}`, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const addCategory = createAsyncThunk(
  'category/addCategory',
  async (categoryData) => {
    const response = await authorizeAxiosInstance.post(API_URL, categoryData);
    return response.data;
  }
);

export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ id, categoryData, select = '*'}) => {
    const response = await authorizeAxiosInstance.put(`${API_URL}/${id}`, categoryData, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (id) => {
    await authorizeAxiosInstance.delete(`${API_URL}/${id}`);
    return id;
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
    builder.addCase(getActiveCategories.fulfilled, (state, action) => {
        state.activeCategories = action.payload;
      })
    builder.addCase(fetchActiveCategoriesByType.fulfilled, (state, action) => {
        state.activeCategories = action.payload;
      })
    builder.addCase(fetchCategoriesByType.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
    builder.addCase(addCategory.fulfilled, (state, action) => {
        state.categories = state.categories.concat(action.payload);
      })
    builder.addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(cat => cat.category_id === action.payload.category_id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        const activeIndex = state.activeCategories.findIndex(cat => cat.category_id === action.payload.category_id);
        if (activeIndex !== -1) {
          state.activeCategories[activeIndex] = action.payload;
        }
      })
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(cat => cat.category_id !== action.payload);
        state.activeCategories = state.activeCategories.filter(cat => cat.category_id !== action.payload);
      });
  },
});

export const selectCategories = (state) => state.category.categories;
export const selectActiveCategories = (state) => state.category.activeCategories;

export const categoryReducer = categorySlice.reducer;