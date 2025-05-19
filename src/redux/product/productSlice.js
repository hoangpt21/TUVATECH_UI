import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizeAxiosInstance from '../../utils/authorizeAxios';


const API_URL = `/v1/products`;

const initialState = {
  products: [],
  activeProducts: [],
  productDetail: null,
  totalProducts: 0
};

// Async thunks

export const fetchTotalProducts = createAsyncThunk(
  'product/fetchTotalProducts',
  async () => {
    const response = await authorizeAxiosInstance.get(`${API_URL}/total`);
    return response.data;
  }
);

export const fetchAllProducts = createAsyncThunk(
  'product/fetchAllProducts',
  async ({ limit = 50, offset = 0, select = '*' , isAll = false}) => {
    if(isAll) {
      let offset = 0;
      const products = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(API_URL, {
          params: {
            limit,
            offset,
            select
          }
        });
        products.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return products;
    } else {
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


export const fetchProductById = createAsyncThunk(
  'product/fetchProductById',
  async ({id, select= '*'}) => {
    const response = await authorizeAxiosInstance.get(`${API_URL}/${id}`,{
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (productData) => {
    const response = await authorizeAxiosInstance.post(API_URL, productData);
    return response.data;
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, productData, select = '*' }) => {
    const response = await authorizeAxiosInstance.put(`${API_URL}/${id}`, productData, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id) => {
    await authorizeAxiosInstance.delete(`${API_URL}/${id}`);
    return id;
  }
);

// Add new thunk for filtered active products
export const fetchFilteredActiveProducts = createAsyncThunk(
  'product/fetchFilteredActiveProducts',
  async ({ 
    searchKeyword = '',
    sortBy = '',
    minPrice = null,
    maxPrice = null,
    categoryId = null,
    brandId = null,
    select = '*',
    limit = 50,
    offset = 0
  }) => {
    const params = {
      sKw: searchKeyword,
      srt: sortBy,
      minP: minPrice,
      maxP: maxPrice,
      ctgId: categoryId,
      brId: brandId,
      select,
      limit,
      offset
    };
    const response = await authorizeAxiosInstance.get(`${API_URL}/active/filter`, { params });
    return { products: response.data.products, total: response.data.total,  offset};
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProductDetail: (state, action) => {
      state.productDetail = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
    .addCase (fetchTotalProducts.fulfilled, (state, action) => {
      state.totalProducts = action.payload;
    })
    .addCase(fetchAllProducts.fulfilled, (state, action) => {
      state.products = action.payload;
    })
    .addCase(fetchFilteredActiveProducts.fulfilled, (state, action) => {
      if(action.payload.offset === 0) {
        state.activeProducts = action.payload.products;
        state.totalProducts = action.payload.total;
      } else {
        state.activeProducts = state.activeProducts.concat(action.payload.products);
        state.totalProducts = action.payload.total;
      }
    })
    .addCase(fetchProductById.fulfilled, (state, action) => {
      state.productDetail = action.payload;
    })
    .addCase(createProduct.fulfilled, (state, action) => {
      state.products = state.products.concat(action.payload);
    })
    .addCase(updateProduct.fulfilled, (state, action) => {
      const index = state.products.findIndex(p => p.product_id === action.payload.product_id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
      const activeIndex = state.activeProducts.findIndex(p => p.product_id === action.payload.product_id);
      if (activeIndex !== -1) {
        state.activeProducts[activeIndex] = action.payload;
      }
    })
    .addCase(deleteProduct.fulfilled, (state, action) => {
      state.products = state.products.filter(p => p.product_id !== action.payload);
      state.activeProducts = state.activeProducts.filter(p => p.product_id !== action.payload);
      state.totalProducts = state.totalProducts - 1;
    });
  }
});
export const { setProductDetail } = productSlice.actions;
export const selectProducts = (state) => state.product.products;
export const selectActiveProducts = (state) => state.product.activeProducts;
export const selectProductDetail = (state) => state.product.productDetail;
export const selectTotalProducts = (state) => state.product.totalProducts;
export const productReducer = productSlice.reducer;