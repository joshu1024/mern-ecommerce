import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.withCredentials = true;

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const registerUser = createAsyncThunk(
  "user/register",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/user/register`, userData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Registration failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/login",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/user/login`, userData, {
        withCredentials: true,
      });

      const token = res.data.token;
      localStorage.setItem("token", token);
      if (savedUser?.token) {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${savedUser.token}`;
      }

      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Login failed");
    }
  }
);

export const logOutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axios.get(`${BASE_URL}/api/user/logout`);
    } catch (error) {
      return rejectWithValue("Could not log out user");
    }
  }
);

const savedUserData = localStorage.getItem("user");
const savedUser = savedUserData ? JSON.parse(savedUserData) : null;

const initialState = {
  user: savedUser?.user || null,
  token: savedUser?.token || null,
  isLoggedIn: !!savedUser,
  loading: false,
  error: null,
};

if (savedUser?.token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${savedUser.token}`;
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        (state.loading = true), (state.error = null);
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isLoggedIn = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        (state.loading = true), (state.error = null);
      })
      // login fulfilled
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user; // store user object
        state.token = action.payload.token; // store token separately
        state.isLoggedIn = true;

        localStorage.setItem(
          "user",
          JSON.stringify({
            user: action.payload.user,
            token: action.payload.token,
          })
        );
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logOutUser.fulfilled, (state) => {
        (state.user = null), (state.isLoggedIn = false);
        localStorage.removeItem("user");
      });
  },
});

export default userSlice.reducer;
