import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizeAxiosInstance from '../../utils/authorizeAxios';


const initialState = {
  addresses: [], // Store list of addresses
}

// Get all addresses
export const getAllAddressesAPI = createAsyncThunk(
  'address/getAllAddressesAPI',
  async ({ select = '*', isAll = false, limit = 50, offset = 0}) => {
    if(isAll) {
      let offset = 0;
      const addresses = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`/v1/addresses`, {
          params: {
            limit,
            offset,
            select
          }
        });
        addresses.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return addresses;
    }
    else {
      const response = await authorizeAxiosInstance.get(`/v1/addresses`, {
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

// Get all addresses
export const getAddressesAPI = createAsyncThunk(
  'address/getAddressesAPI',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const addresses = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`/v1/addresses/user`, {
          params: {
            limit,
            offset,
            select
          }
        });
        addresses.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return addresses;
    }
    const response = await authorizeAxiosInstance.get(`/v1/addresses/user`, {
      params: {
        limit,
        offset,
        select
      }
    });
    return response.data;
  }
)

// Create new address
export const createAddressAPI = createAsyncThunk(
  'address/createAddressAPI',
  async (data) => {
    const response = await authorizeAxiosInstance.post(`/v1/addresses`, data);
    return response.data;
  }
)

// Update address
export const updateAddressAPI = createAsyncThunk(
  'address/updateAddressAPI',
  async ({id, data}) => {
    const response = await authorizeAxiosInstance.put(`/v1/addresses/${id}`, data);
    return response.data;
  }
)

// Delete address
export const deleteAddressAPI = createAsyncThunk(
  'address/deleteAddressAPI',
  async (id) => {
    await authorizeAxiosInstance.delete(`/v1/addresses/${id}`);
    return id;
  }
)

export const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    sortAddresses: (state) => {
      state.addresses.sort((a, b) => {
        if (a.is_default === b.is_default) return 0;
        return a.is_default ? -1 : 1;
      });
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getAllAddressesAPI.fulfilled, (state, action) => {
      state.addresses = action.payload;
    });

    builder.addCase(getAddressesAPI.fulfilled, (state, action) => {
      state.addresses = action.payload;
    });

    builder.addCase(createAddressAPI.fulfilled, (state, action) => {
      const newAddress = action.payload;
      if (newAddress.is_default) {
        // Nếu địa chỉ mới là mặc định, cập nhật tất cả địa chỉ khác thành không mặc định
        state.addresses = state.addresses.map(addr => ({
          ...addr,
          is_default: false
        }));
      }
      state.addresses.push(newAddress);
    });

    builder.addCase(updateAddressAPI.fulfilled, (state, action) => {
      const updatedAddress = action.payload;
      if (updatedAddress.is_default) {
        // Nếu địa chỉ được cập nhật là mặc định, cập nhật tất cả địa chỉ khác thành không mặc định
        state.addresses = state.addresses.map(addr => ({
          ...addr,
          is_default: false
        }));
      }
      const index = state.addresses.findIndex(addr => addr.address_id === updatedAddress.address_id);
      if (index !== -1) {
        state.addresses[index] = updatedAddress;
      }
    });

    builder.addCase(deleteAddressAPI.fulfilled, (state, action) => {
      state.addresses = state.addresses.filter(addr => addr.address_id !== action.payload);
    });
  }
});

// Remove setDefaultAddress from exports
export const { sortAddresses } = addressSlice.actions

// Selector
export const selectAddresses = (state) => state.address.addresses;

// Reducer
export const addressReducer = addressSlice.reducer
