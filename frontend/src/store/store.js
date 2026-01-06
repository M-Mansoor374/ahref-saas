import { configureStore } from '@reduxjs/toolkit';

const authReducer = (state = {}, action) => state;
const userReducer = (state = {}, action) => state;
const adminReducer = (state = {}, action) => state;
const resellerReducer = (state = {}, action) => state;
const dashboardReducer = (state = {}, action) => state;
const toolReducer = (state = {}, action) => state;

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    admin: adminReducer,
    reseller: resellerReducer,
    dashboard: dashboardReducer,
    tool: toolReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export default store;
