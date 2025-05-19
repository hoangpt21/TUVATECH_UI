import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizeAxiosInstance from '../../utils/authorizeAxios';
// Async thunks
export const getUserCart = createAsyncThunk(
  'cart/getUserCart',
  async ({ select = '*', isAll = false, limit = 50, offset = 0 }) => {
    if(isAll) {
      let offset = 0;
      const cartItems = [];
      while(true) {
        const response = await authorizeAxiosInstance.get(`/v1/carts/user`, {
          params: {
            limit,
            offset,
            select
          }
        });
        cartItems.push(...response.data);
        if(response?.data?.length < 50) break;
        offset += 50;
      }
      return cartItems;
    }
    else {
      const response = await authorizeAxiosInstance.get(`/v1/carts/user`, {
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

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (cartData) => {
    const response = await authorizeAxiosInstance.post(`/v1/carts`, cartData);
    return response.data;
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({productId, isOrdered = false}) => {
    await authorizeAxiosInstance.delete(`/v1/carts/${productId}`, {
      params: {
        isOrdered
      }
    });
    return productId;
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async () => {
    await authorizeAxiosInstance.delete(`/v1/carts/user/clear`);
    return [];
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: []
  },
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.cart_id === action.payload.cart_id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.product_id !== action.payload);
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const { setCartItems } = cartSlice.actions;
export const selectCartItems = (state) => state.cart.items;

export const cartReducer = cartSlice.reducer;