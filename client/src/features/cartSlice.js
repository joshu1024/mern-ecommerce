import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.withCredentials = true;

const API_URL = "http://localhost:4000/api/cart";

const addToCartAsync = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/addToCart`,
        { productId, quantity }, // ✅ removed user
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.cart;
      console.log(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🟡 Fetch cart from backend
const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/getCart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const clearCartAsync = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/clearCart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
// features/cartSlice.js

// ✅ Checkout thunk
export const checkoutCart = createAsyncThunk(
  "cart/checkoutCart",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { cart } = getState();
      const items = cart.items.map((item) => ({
        productId: item.productId?._id || item._id,
        name: item.productId?.name,
        price: item.productId?.newPrice,
        quantity: item.quantity,
      }));
      const total = cart.totalPrice;

      const { data } = await axios.post("http://localhost:4000/api/order", {
        items,
        total,
      });

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Checkout failed"
      );
    }
  }
);

const initialState = {
  items: JSON.parse(localStorage.getItem("cartItems")) || [],
  totalPrice: 0,
  loading: false,
  error: null,
};

// 💾 Helper: Save cart to localStorage
const saveCart = (items) => {
  localStorage.setItem("cartItems", JSON.stringify(items));
};

// 💰 Calculate total price (if prices exist)
// OLD (Incorrect)
const calculateTotal = (items) => {
  return items.reduce(
    (sum, item) =>
      sum +
      (item.productId?.newPrice || item.productId?.price || 0) * item.quantity,
    0
  );
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.productId?._id !== action.payload
      );
      state.totalPrice = calculateTotal(state.items);
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
      saveCart(state.items);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
        state.totalPrice = calculateTotal(state.items);
        saveCart(state.items);
      })

      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
        state.totalPrice = calculateTotal(state.items);
        saveCart(state.items);
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
        state.totalPrice = 0;
        saveCart(state.items);
      });
  },
});

export const { removeFromCart, clearCart } = cartSlice.actions;
export { addToCartAsync, fetchCart };
export default cartSlice.reducer;
