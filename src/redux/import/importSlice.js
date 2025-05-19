import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizeAxiosInstance from '../../utils/authorizeAxios';


// Async thunks
export const fetchAllImports = createAsyncThunk(
  'import/fetchAllImports',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const imports = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`/v1/imports`, {
          params: {
            limit,
            offset,
            select
          }
        });
        imports.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return imports;
    }
    else {
      const response = await authorizeAxiosInstance.get(`/v1/imports`, {
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

export const fetchImportById = createAsyncThunk(
  'import/fetchImportById',
  async (id) => {
    const response = await authorizeAxiosInstance.get(`/v1/imports/${id}`);
    return response.data;
  }
);

export const createImport = createAsyncThunk(
  'import/createImport',
  async (importData) => {
    const response = await authorizeAxiosInstance.post(`/v1/imports`, importData);
    return response.data;
  }
);

export const updateImport = createAsyncThunk(
  'import/updateImport',
  async ({ id, importData }) => {
    const response = await authorizeAxiosInstance.put(`/v1/imports/${id}`, importData);
    return response.data;
  }
);

export const deleteImport = createAsyncThunk(
  'import/deleteImport',
  async (id) => {
    await authorizeAxiosInstance.delete(`/v1/imports/${id}`);
    return id;
  }
);

// Slice
const importSlice = createSlice({
  name: 'import',
  initialState: {
    imports: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllImports.fulfilled, (state, action) => {
        state.imports = action.payload;
      })
      .addCase(createImport.fulfilled, (state, action) => {
        state.imports.push(action.payload);
      })
      .addCase(updateImport.fulfilled, (state, action) => {
        const index = state.imports.findIndex(imp => imp.import_id === action.payload.import_id);
        if (index !== -1) {
          state.imports[index] = action.payload;
        }
      })
      .addCase(deleteImport.fulfilled, (state, action) => {
        state.imports = state.imports.filter(imp => imp.import_id !== action.payload);
      });
  }
});

// Selectors
export const selectImports = state => state.import.imports;

export const importReducer = importSlice.reducer;