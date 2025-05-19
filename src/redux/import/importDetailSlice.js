import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizeAxiosInstance from '../../utils/authorizeAxios';


// Async thunks
export const fetchAllImportDetails = createAsyncThunk(
  'importDetail/fetchAllImportDetails',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const importDetails = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`/v1/import-details`, {
          params: {
            limit,
            offset,
            select
          }
        });
        importDetails.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return importDetails;
    }
    else {
      const response = await authorizeAxiosInstance.get(`/v1/import-details`, {
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

export const fetchImportDetailById = createAsyncThunk(
  'importDetail/fetchImportDetailById',
  async (id) => {
    const response = await authorizeAxiosInstance.get(`/v1/import-details/${id}`);
    return response.data
  }
);

export const fetchDetailsByImport = createAsyncThunk(
  'importDetail/fetchDetailsByImport',
  async ({ importId, select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const importDetails = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`/v1/import-details/import/${importId}`, {
          params: {
            limit,
            offset,
            select
          }
        });
        importDetails.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return importDetails;
    }
    else {
      const response = await authorizeAxiosInstance.get(`/v1/import-details/import/${importId}`, {
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

export const createImportDetail = createAsyncThunk(
  'importDetail/createImportDetail',
  async (detailData) => {
    const response = await authorizeAxiosInstance.post(`/v1/import-details`, detailData);
    return response.data
  }
);

export const updateImportDetail = createAsyncThunk(
  'importDetail/updateImportDetail',
  async ({ id, detailData }) => {
    const response = await authorizeAxiosInstance.put(`/v1/import-details/${id}`, detailData);
    return response.data
  }
);

export const deleteImportDetail = createAsyncThunk(
  'importDetail/deleteImportDetail',
  async (id) => {
    await authorizeAxiosInstance.delete(`/v1/import-details/${id}`);
    return id
  }
);

export const deleteImportDetailByImportId = createAsyncThunk(
  'importDetail/deleteImportDetailByImportId',
  async (importId) => {
    await authorizeAxiosInstance.delete(`/v1/import-details/import/${importId}`);
    return importId
  }
);

// Slice
const importDetailSlice = createSlice({
  name: 'importDetail',
  initialState: {
    importDetails: []
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllImportDetails.fulfilled, (state, action) => {
        state.importDetails = action.payload;
      })
      // .addCase(fetchImportDetailById.fulfilled, (state, action) => {
      //   state.currentImportDetail = action.payload;
      // })
      .addCase(fetchDetailsByImport.fulfilled, (state, action) => {
        state.importDetails = action.payload;
      })
      .addCase(createImportDetail.fulfilled, (state, action) => {
        state.importDetails.push(action.payload);
      })
      .addCase(updateImportDetail.fulfilled, (state, action) => {
        const index = state.importDetails.findIndex(detail => detail.import_detail_id === action.payload.import_detail_id);
        if (index !== -1) {
          state.importDetails[index] = action.payload;
        }
      })
      .addCase(deleteImportDetail.fulfilled, (state, action) => {
        state.importDetails = state.importDetails.filter(detail => detail.import_detail_id !== action.payload);
      })
     .addCase(deleteImportDetailByImportId.fulfilled, (state, action) => {
        state.importDetails = state.importDetails.filter(detail => detail.import_id!== action.payload);
      });
  }
});

// Selectors
export const selectImportDetails = state => state.importDetail.importDetails;

export const importDetailReducer = importDetailSlice.reducer;