import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/domain';
import { salesUserService, type SalesUserInput } from '../../services/salesUserService';
import type { RootState } from '../index';

interface SalesUserState {
  list: User[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  saving: boolean;
  error: string | null;
}

const initialState: SalesUserState = {
  list: [],
  status: 'idle',
  saving: false,
  error: null,
};

export const loadSalesUsers = createAsyncThunk('salesUsers/load', () => salesUserService.list());

export const saveSalesUser = createAsyncThunk<User, { id?: string; input: SalesUserInput }>(
  'salesUsers/save',
  async ({ id, input }) => (id ? salesUserService.update(id, input) : salesUserService.create(input))
);

export const toggleSalesUser = createAsyncThunk<User, string>(
  'salesUsers/toggle',
  (id) => salesUserService.toggleActive(id)
);

export const assignDistributor = createAsyncThunk<User, { id: string; distributorId: string | null }>(
  'salesUsers/assign',
  ({ id, distributorId }) => salesUserService.assignDistributor(id, distributorId)
);

const salesUserSlice = createSlice({
  name: 'salesUsers',
  initialState,
  reducers: {
    clearSalesUserError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSalesUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadSalesUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(loadSalesUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load sales users.';
      })
      .addCase(saveSalesUser.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveSalesUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.saving = false;
        const idx = state.list.findIndex((u) => u.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
        else state.list.unshift(action.payload);
      })
      .addCase(saveSalesUser.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Failed to save sales user.';
      })
      .addCase(toggleSalesUser.fulfilled, (state, action: PayloadAction<User>) => {
        const idx = state.list.findIndex((u) => u.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(assignDistributor.fulfilled, (state, action: PayloadAction<User>) => {
        const idx = state.list.findIndex((u) => u.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      });
  },
});

export const { clearSalesUserError } = salesUserSlice.actions;
export const salesUserReducer = salesUserSlice.reducer;

export const selectSalesUsers = (state: RootState) => state.salesUsers.list;
export const selectSalesUsersStatus = (state: RootState) => state.salesUsers.status;
export const selectSalesUserSaving = (state: RootState) => state.salesUsers.saving;
export const selectSalesUserError = (state: RootState) => state.salesUsers.error;
