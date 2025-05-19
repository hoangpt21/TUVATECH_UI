import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizeAxiosInstance from '../../utils/authorizeAxios';


const API_URL = `/v1/images`;

const initialState = {
  productImages: [],
  reviewImages: [],
};

// Async thunks
export const fetchProductImages = createAsyncThunk(
  'image/fetchProductImages',
  async ({ productId, select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const productImages = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`${API_URL}/entity/product/${productId}`, {
          params: {
            limit,
            offset,
            select
          }
        });
        productImages.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return productImages;
    }
    else {
      const response = await authorizeAxiosInstance.get(`${API_URL}/entity/product/${productId}`, {
        params: {
          select,
          limit,
          offset
        }
      });
      return response.data;
    }
  }
);

export const fetchReviewImages = createAsyncThunk(
  'image/fetchReviewImages',
  async ({ reviewId, select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const reviewImages = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`${API_URL}/entity/review/${reviewId}`, {
          params: {
            limit,
            offset,
            select
          }
        });
        reviewImages.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return {data: reviewImages, reviewId};
    }
    else {
      const response = await authorizeAxiosInstance.get(`${API_URL}/entity/review/${reviewId}`, {
        params: {
          select,
          limit,
          offset
        }
      });
      return {data:response.data, reviewId};
    }
  }
);

export const createImage = createAsyncThunk(
  'image/createImage',
  async (imageData) => {
    const response = await authorizeAxiosInstance.post(API_URL, imageData);
    return response.data;
  }
);

export const updateImage = createAsyncThunk(
  'image/updateImage',
  async ({ id, imageData, select = '*' }) => {
    const response = await authorizeAxiosInstance.put(`${API_URL}/${id}`, imageData, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const deleteImage = createAsyncThunk(
  'image/deleteImage',
  async (id) => {
    await authorizeAxiosInstance.delete(`${API_URL}/${id}`);
    return id;
  }
);

export const deleteProductImages = createAsyncThunk(
  'image/deleteProductImages',
  async (productId) => {
    await authorizeAxiosInstance.delete(`${API_URL}/entity/product/${productId}`);
    return productId;
  }
);

export const deleteReviewImagesByReview = createAsyncThunk(
  'image/deleteReviewImagesByReview',
  async (reviewId) => {
    await authorizeAxiosInstance.delete(`${API_URL}/entity/review/${reviewId}`);
    return reviewId;
  }
);  


const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductImages.fulfilled, (state, action) => {
        state.productImages = action.payload;
      })
      .addCase(fetchReviewImages.fulfilled, (state, action) => {
        const reviewId = action.payload.reviewId;
        const index = state.reviewImages.findIndex(i => i?.review_id === reviewId);
        if (index === -1 && reviewId !==  true) {
          state.reviewImages = state.reviewImages.concat(action.payload.data);
        } else {
          state.reviewImages = action.payload.data;
        }
      })
      .addCase(createImage.fulfilled, (state, action) => {
        if(action.payload.product_id) {
          state.productImages = state.productImages.concat(action.payload);
        } else if(action.payload.review_id) {
          state.reviewImages = state.reviewImages.concat(action.payload);
        }
      })
      .addCase(updateImage.fulfilled, (state, action) => {
        if(action.payload.product_id) {
          const index = state.productImages.findIndex(i => i.image_id === action.payload.image_id);
          if (index !== -1) {
            state.productImages[index] = action.payload;
          }
        } else if(action.payload.review_id) {
          const index = state.reviewImages.findIndex(i => i.image_id === action.payload.image_id);
          if (index !== -1) {
            state.reviewImages[index] = action.payload;
          }
        }
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.productImages = state.productImages.filter(i => i.image_id !== action.payload);
        state.reviewImages = state.reviewImages.filter(i => i.image_id !== action.payload);
      })
      .addCase(deleteProductImages.fulfilled, (state, action) => {
        state.productImages = state.productImages.filter(i => i.product_id !== action.payload);
      })
      .addCase(deleteReviewImagesByReview.fulfilled, (state, action) => {
        state.reviewImages = state.reviewImages.filter(i => i.review_id !== action.payload);
      })
  }
});

export const selectProductImages = (state) => state.image.productImages;
export const selectReviewImages = (state) => state.image.reviewImages;


export const imageReducer = imageSlice.reducer; 