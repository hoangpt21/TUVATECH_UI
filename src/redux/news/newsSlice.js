import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizeAxiosInstance from '../../utils/authorizeAxios';


const API_URL = `/v1/news`;
const initialState = {
  news: [],
  activeNews: [],
  newsDetail: null,
};

// Async thunk actions
export const fetchAllNews = createAsyncThunk(
  'news/fetchAllNews',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const news = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(API_URL, {
          params: {
            limit,
            offset,
            select: select
          }
        }); 
        news.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return news;
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

export const fetchActiveNews = createAsyncThunk(
  'news/fetchActiveNews',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const news = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`${API_URL}/active`, {
          params: {
            limit,
            offset,
            select
          }
        });
        news.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return news;
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

export const getNewsById = createAsyncThunk(
  'news/getNewsById',
  async ({newsId, select = '*'}) => {
    const response = await authorizeAxiosInstance.get(`${API_URL}/${newsId}`, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const addNews = createAsyncThunk(
  'news/addNews',
  async (newsData) => {
    const response = await authorizeAxiosInstance.post(API_URL, newsData);
    return response.data;
  }
);

export const updateNews = createAsyncThunk(
  'news/updateNews',
  async ({ id, newsData, select = '*'}) => {
    const response = await authorizeAxiosInstance.put(`${API_URL}/${id}`, newsData, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const deleteNews = createAsyncThunk(
  'news/deleteNews',
  async (id) => {
    await authorizeAxiosInstance.delete(`${API_URL}/${id}`);
    return id;
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setNewsDetail: (state, action) => {
      state.newsDetail = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAllNews.fulfilled, (state, action) => {
        state.news = action.payload;
      })
    builder.addCase(fetchActiveNews.fulfilled, (state, action) => {
        state.activeNews = action.payload;
      })
    builder.addCase(getNewsById.fulfilled, (state, action) => {
        state.newsDetail = action.payload;
      })
    builder.addCase(addNews.fulfilled, (state, action) => {
        state.news = state.news.concat(action.payload);
      })
    builder.addCase(updateNews.fulfilled, (state, action) => {
        const index = state.news.findIndex(item => item.news_id === action.payload.news_id);
        if (index !== -1) {
          state.news[index] = action.payload;
        }
        const activeIndex = state.activeNews.findIndex(item => item.news_id === action.payload.news_id);
        if (activeIndex !== -1) {
          state.activeNews[activeIndex] = action.payload;
        }
        state.newsDetail = action.payload;
      })
    builder.addCase(deleteNews.fulfilled, (state, action) => {
        state.news = state.news.filter(item => item.news_id !== action.payload);
        state.activeNews = state.activeNews.filter(item => item.news_id !== action.payload);
    });
  },
});

export const { setNewsDetail } = newsSlice.actions;
export const selectNews = (state) => state.news.news;
export const selectActiveNews = (state) => state.news.activeNews;
export const selectNewsDetail = (state) => state.news.newsDetail;

export const newsReducer = newsSlice.reducer; 