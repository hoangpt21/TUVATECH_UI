import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizeAxiosInstance from '../../utils/authorizeAxios';


const API_URL = `/v1/orders`;

const initialState = {
  orders: [],
  userOrders: []
};

// Async thunk actions
export const fetchAllOrders = createAsyncThunk(
  'order/fetchAllOrders',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const orders = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(API_URL, {
          params: {
            limit,
            offset,
            select
          }
        });
        orders.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return orders;
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

export const getOrderById = createAsyncThunk(
  'order/getOrderById',
  async ({ orderId, select = '*' }) => {
    const response = await authorizeAxiosInstance.get(`${API_URL}/${orderId}`, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const getOrdersByUser = createAsyncThunk(
  'order/getOrdersByUser',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const orders = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`${API_URL}/user`, {
          params: {
            limit,
            offset,
            select
          }
        });
        orders.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return orders;
    }
    else {
      const response = await authorizeAxiosInstance.get(`${API_URL}/user`, {
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

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData) => {
    const response = await authorizeAxiosInstance.post(API_URL, orderData);
    return response.data;
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, status, select = '*' }) => {
    const response = await authorizeAxiosInstance.put(`${API_URL}/${orderId}/status`, { status }, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const updateOrder = createAsyncThunk(
  'order/updateOrder',
  async ({ orderId, updateData, select = '*' }) => {
    const response = await authorizeAxiosInstance.put(`${API_URL}/${orderId}`, updateData, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const deleteOrder = createAsyncThunk(
  'order/deleteOrder',
  async (orderId) => {
    await authorizeAxiosInstance.delete(`${API_URL}/${orderId}`);
    return orderId;
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      .addCase(getOrdersByUser.fulfilled, (state, action) => {
        state.userOrders = action.payload;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.userOrders = state.userOrders.concat(action.payload);
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.order_id === action.payload.order_id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        
        const userIndex = state.userOrders.findIndex(order => order.order_id === action.payload.order_id);
        if (userIndex !== -1) {
          state.userOrders[userIndex] = action.payload;
        }
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.order_id === action.payload.order_id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        
        const userIndex = state.userOrders.findIndex(order => order.order_id === action.payload.order_id);
        if (userIndex !== -1) {
          state.userOrders[userIndex] = action.payload;
        }
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(order => order.order_id !== action.payload);
        state.userOrders = state.userOrders.filter(order => order.order_id !== action.payload);
      });
  }
});
// Selectors
export const selectAllOrders = (state) => state.order.orders;
export const selectUserOrders = (state) => state.order.userOrders;

export const orderReducer = orderSlice.reducer; 