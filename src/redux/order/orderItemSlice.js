import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizeAxiosInstance from '../../utils/authorizeAxios';


const API_URL = `/v1/order-items`;

const initialState = {
  orderItems: [],
  orderItemsByOrder: {}
};

// Async thunk actions
export const fetchAllOrderItems = createAsyncThunk(
  'orderItem/fetchAllOrderItems',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const orderItems = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(API_URL, {
          params: {
            limit,
            offset,
            select
          }
        });
        orderItems.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return orderItems;
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

export const getOrderItemsByOrderId = createAsyncThunk(
  'orderItem/getOrderItemsByOrderId',
  async ({ orderId, select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const orderItems = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`${API_URL}/order/${orderId}`, {
          params: {
            limit,
            offset,
            select
          }
        });
        orderItems.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return orderItems;
    }
    else {
      const response = await authorizeAxiosInstance.get(`${API_URL}/order/${orderId}`, {
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

export const createOrderItem = createAsyncThunk(
  'orderItem/createOrderItem',
  async (orderItemData) => {
    const response = await authorizeAxiosInstance.post(API_URL, orderItemData);
    return response.data;
  }
);

export const updateOrderItem = createAsyncThunk(
  'orderItem/updateOrderItem',
  async ({ orderItemId, updateData, select = '*' }) => {
    const response = await authorizeAxiosInstance.put(`${API_URL}/${orderItemId}`, updateData, {
      params: {
        select: select
      }
    });
    return response.data;
  }
);

export const deleteOrderItem = createAsyncThunk(
  'orderItem/deleteOrderItem',
  async (orderItemId) => {
    await authorizeAxiosInstance.delete(`${API_URL}/${orderItemId}`);
    return orderItemId;
  }
);

export const deleteOrderItemsByOrderId = createAsyncThunk(
  'orderItem/deleteOrderItemsByOrderId',
  async (orderId) => {
    await authorizeAxiosInstance.delete(`${API_URL}/order/${orderId}`);
    return orderId;
  }
);

const orderItemSlice = createSlice({
  name: 'orderItem',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrderItems.fulfilled, (state, action) => {
        state.orderItems = action.payload;
      })
      .addCase(getOrderItemsByOrderId.fulfilled, (state, action) => {
        state.orderItemsByOrder[action.payload[0]?.order_id] = action.payload;
      })
      .addCase(createOrderItem.fulfilled, (state, action) => {
        state.orderItems = state.orderItems.concat(action.payload);
        if (state.orderItemsByOrder[action.payload.order_id]) {
          state.orderItemsByOrder[action.payload.order_id] = state.orderItemsByOrder[action.payload.order_id].concat(action.payload);
        }
      })
      .addCase(updateOrderItem.fulfilled, (state, action) => {
        const index = state.orderItems.findIndex(item => item.order_item_id === action.payload.order_item_id);
        if (index !== -1) {
          state.orderItems[index] = action.payload;
        }
        
        const orderItems = state.orderItemsByOrder[action.payload.order_id];
        if (orderItems) {
          const orderItemIndex = orderItems.findIndex(item => item.order_item_id === action.payload.order_item_id);
          if (orderItemIndex !== -1) {
            orderItems[orderItemIndex] = action.payload;
          }
        }
      })
      .addCase(deleteOrderItem.fulfilled, (state, action) => {
        state.orderItems = state.orderItems.filter(item => item.order_item_id !== action.payload);
        
        const orderItems = state.orderItemsByOrder[action.payload.orderId];
        if (orderItems) {
          state.orderItemsByOrder[action.payload.orderId] = orderItems.filter(
            item => item.order_item_id !== action.payload
          );
        }
      })
      .addCase(deleteOrderItemsByOrderId.fulfilled, (state, action) => {
        state.orderItems = state.orderItems.filter(item => item.order_id !== action.payload);
        delete state.orderItemsByOrder[action.payload];
      });
  }
});

// Selectors
export const selectAllOrderItems = (state) => state.orderItem.orderItems;

// Base selector for the map
export const selectOrderItemsByOrder = (state) => state.orderItem.orderItemsByOrder;

// Note: The original selectOrderItemsByOrderId is removed as it's replaced by the factory.
// Components will need to use the factory like:
// const selectMemoized = useMemo(makeSelectOrderItemsByOrderId, []);
// const items = useSelector(state => selectMemoized(state, orderId));

export const orderItemReducer = orderItemSlice.reducer; 