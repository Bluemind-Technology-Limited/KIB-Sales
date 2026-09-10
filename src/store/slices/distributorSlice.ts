import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Distributor } from '../../types/domain';
import { distributorService, type DistributorInput } from '../../services/distributorService';
import type { RootState } from '../index';

interface DistributorState {
  list: Distributor[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  saving: boolean;
  error: string | null;
}

const initialState: DistributorState = {
  list: [],
  status: 'idle',
  saving: false,
  error: null,
};

export const loadDistributors = createAsyncThunk('distributors/load', () => distributorService.list());

export const saveDistributor = createAsyncThunk<
  Distributor,
  { id?: string; input: DistributorInput }
>('distributors/save', async ({ id, input }) =>
  id ? distributorService.update(id, input) : distributorService.create(input)
);

export const toggleDistributor = createAsyncThunk<Distributor, string>(
  'distributors/toggle',
  (id) => distributorService.toggleActive(id)
);

const distributorSlice = createSlice({
  name: 'distributors',
  initialState,
  reducers: {
    clearDistributorError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDistributors.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadDistributors.fulfilled, (state, action: PayloadAction<Distributor[]>) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(loadDistributors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load distributors.';
      })
      .addCase(saveDistributor.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveDistributor.fulfilled, (state, action: PayloadAction<Distributor>) => {
        state.saving = false;
        const idx = state.list.findIndex((d) => d.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
        else state.list.unshift(action.payload);
      })
      .addCase(saveDistributor.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Failed to save distributor.';
      })
      .addCase(toggleDistributor.fulfilled, (state, action: PayloadAction<Distributor>) => {
        const idx = state.list.findIndex((d) => d.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      });
  },
});

export const { clearDistributorError } = distributorSlice.actions;
export const distributorReducer = distributorSlice.reducer;

export const selectDistributors = (state: RootState) => state.distributors.list;
export const selectDistributorsStatus = (state: RootState) => state.distributors.status;
export const selectDistributorSaving = (state: RootState) => state.distributors.saving;
export const selectDistributorError = (state: RootState) => state.distributors.error;
