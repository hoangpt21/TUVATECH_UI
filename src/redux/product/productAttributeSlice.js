import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizeAxiosInstance from '../../utils/authorizeAxios';


const API_URL = `/v1/product-attributes`;

const initialState = {
  productAttributes: []
};

// Async thunks
export const fetchAllAttributes = createAsyncThunk(
  'productAttribute/fetchAllAttributes',
  async ({ limit = 50, offset = 0, select = '*' , isAll = false}) => {
    if(isAll) {
      let offset = 0;
      const productAttributes = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`${API_URL}`, {
          params: {
            limit,
            offset,
            select
          }
        });
        productAttributes.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return productAttributes;
    }
    else {
      const response = await authorizeAxiosInstance.get(`${API_URL}`, {
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

export const fetchProductAttributesByProductId = createAsyncThunk(
  'productAttribute/fetchProductAttributesByProductId',
  async ({productId, select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const productAttributes = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`${API_URL}/product/${productId}`, {
          params: {
            limit,
            offset,
            select
          }
        });
        productAttributes.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return productAttributes;
    }
    else {
      const response = await authorizeAxiosInstance.get(`${API_URL}/product/${productId}`, {
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

export const createProductAttribute = createAsyncThunk(
  'productAttribute/createProductAttribute',
  async (attributeData) => {
    const response = await authorizeAxiosInstance.post(API_URL, attributeData);
    return response.data;
  }
);

export const updateProductAttribute = createAsyncThunk(
  'productAttribute/updateProductAttribute',
  async ({ id, attributeData, select = '*' }) => {
    const response = await authorizeAxiosInstance.put(`${API_URL}/${id}`, attributeData, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const deleteProductAttribute = createAsyncThunk(
  'productAttribute/deleteProductAttribute',
  async (id) => {
    await authorizeAxiosInstance.delete(`${API_URL}/${id}`);
    return id;
  }
);

export const deleteProductAttributesByProductId = createAsyncThunk(
  'productAttribute/deleteProductAttributesByProductId',
  async (productId) => {
    await authorizeAxiosInstance.delete(`${API_URL}/product/${productId}`);
    return productId;
  }
);

const productAttributeSlice = createSlice({
  name: 'productAttribute',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAttributes.fulfilled, (state, action) => {
        state.productAttributes = action.payload;
      })
      .addCase(fetchProductAttributesByProductId.fulfilled, (state, action) => {
        state.productAttributes = action.payload;
      })
      .addCase(createProductAttribute.fulfilled, (state, action) => {
        state.productAttributes = state.productAttributes.concat(action.payload);
      })
      .addCase(updateProductAttribute.fulfilled, (state, action) => {
        const index = state.productAttributes.findIndex(a => a.attribute_id === action.payload.attribute_id);
        if (index !== -1) {
          state.productAttributes[index] = action.payload;
        }
      })
      .addCase(deleteProductAttribute.fulfilled, (state, action) => {
        state.productAttributes = state.productAttributes.filter(a => a.attribute_id !== action.payload);
      })
      .addCase(deleteProductAttributesByProductId.fulfilled, (state, action) => {
        state.productAttributes = state.productAttributes.filter(a => a.product_id !== action.payload);
      });
  }
});

export const selectProductAttributes = (state) => state.productAttribute.productAttributes;

export const productAttributeReducer = productAttributeSlice.reducer; 