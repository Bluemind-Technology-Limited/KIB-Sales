import { configureStore } from '@reduxjs/toolkit';
import type { Action, ThunkAction } from '@reduxjs/toolkit';
import { authReducer } from './slices/authSlice';
import { distributorReducer } from './slices/distributorSlice';
import { salesUserReducer } from './slices/salesUserSlice';
import { productReducer } from './slices/productSlice';
import { requestReducer } from './slices/requestSlice';

/** Root store for the merged KIB SFA app (Super Admin + Distributor). */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    distributors: distributorReducer,
    salesUsers: salesUserReducer,
    products: productReducer,
    requests: requestReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
