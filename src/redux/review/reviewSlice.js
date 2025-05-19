import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizeAxiosInstance from '../../utils/authorizeAxios';


export const getAllReviews = createAsyncThunk(
  'review/getAllReviews',
  async ({ limit = 50, offset = 0, select = '*' , isAll = false}) => {
    if(isAll) {
      let offset = 0;
      const reviews = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`/v1/reviews`, {
          params: {
            limit,
            offset,
            select
          }
        });
        reviews.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return reviews;
    }
    else {
      const response = await authorizeAxiosInstance.get(`/v1/reviews`, {
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

export const getReviewsByProduct = createAsyncThunk(
  'review/getReviewsByProduct',
  async ({ productId, select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const reviews = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`/v1/reviews/product/${productId}`, {
          params: {
            limit,
            offset,
            select
          }
        });
        reviews.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return reviews;
    }
    else {
      const response = await authorizeAxiosInstance.get(`/v1/reviews/product/${productId}`, {
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

export const getReviewsByUser = createAsyncThunk(
  'review/getReviewsByUser',
  async ({ userId, select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const reviews = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`/v1/reviews/user/${userId}`, {
          params: {
            limit,
            offset,
            select
          }
        });
        reviews.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return reviews;
    }
    else {
      const response = await authorizeAxiosInstance.get(`/v1/reviews/user/${userId}`, {
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

export const createReview = createAsyncThunk(
  'review/createReview',
  async (reviewData) => {
    const response = await authorizeAxiosInstance.post(`/v1/reviews`, reviewData);
    return response.data;
  }
);

export const updateReview = createAsyncThunk(
  'review/updateReview',
  async ({ reviewId, reviewData }) => {
    const response = await authorizeAxiosInstance.put(`/v1/reviews/${reviewId}`, reviewData);
    return response.data;
  }
);

export const deleteReview = createAsyncThunk(
  'review/deleteReview',
  async (productId) => {
    await authorizeAxiosInstance.delete(`/v1/reviews/product/${productId}`);
    return productId;
  }
);

const reviewSlice = createSlice({
  name: 'review',
  initialState: {
    reviews: []
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllReviews.fulfilled, (state, action) => {
        state.reviews = action.payload;
      })
      .addCase(getReviewsByProduct.fulfilled, (state, action) => {
        state.reviews = action.payload;
      })
      .addCase(getReviewsByUser.fulfilled, (state, action) => {
        state.reviews = action.payload;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        if(action.payload?.moderation_status === 'approved') state.reviews.push(action.payload);
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        const updateReviewInArray = (array) => {
          const index = array.findIndex(r => r.review_id === action.payload.review_id);
          if (index !== -1) {
            array[index] = action.payload;
          }
        };
        updateReviewInArray(state.reviews);
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        const filterReviewFromArray = (array) => {
          return array.filter(r => r.product_id !== action.payload);
        };
        state.reviews = filterReviewFromArray(state.reviews);
      });
  },
});

export const selectReviews = state => state.review.reviews;
export const reviewReducer = reviewSlice.reducer;