import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ProductRequest } from '../../types/domain';
import { requestService, type ReviewDecision } from '../../services/requestService';
import type { RootState } from '../index';

interface RequestState {
  list: ProductRequest[];
  selected: ProductRequest | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  reviewingId: string | null;
  error: string | null;
}

const initialState: RequestState = {
  list: [],
  selected: null,
  status: 'idle',
  reviewingId: null,
  error: null,
};

/**
 * Load requests. The Super Admin loads everything; a distributor passes their
 * distributorId so only their own requests are returned.
 */
export const loadRequests = createAsyncThunk(
  'requests/load',
  (distributorId?: string) => requestService.list(distributorId)
);

export const openRequest = createAsyncThunk('requests/open', (id: string) => requestService.getById(id));

export const reviewRequest = createAsyncThunk<ProductRequest, { id: string; decision: ReviewDecision }>(
  'requests/review',
  async ({ id, decision }) => requestService.review(id, decision)
);

const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearSelected(state) {
      state.selected = null;
    },
    clearRequestError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadRequests.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadRequests.fulfilled, (state, action: PayloadAction<ProductRequest[]>) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(loadRequests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load requests.';
      })
      .addCase(openRequest.pending, (state) => {
        state.error = null;
      })
      .addCase(openRequest.fulfilled, (state, action: PayloadAction<ProductRequest | undefined>) => {
        state.selected = action.payload ?? null;
      })
      .addCase(openRequest.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to load request.';
      })
      .addCase(reviewRequest.pending, (state, action) => {
        state.reviewingId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(reviewRequest.fulfilled, (state, action: PayloadAction<ProductRequest>) => {
        state.reviewingId = null;
        state.list = state.list.map((r) => (r.id === action.payload.id ? action.payload : r));
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(reviewRequest.rejected, (state, action) => {
        state.reviewingId = null;
        state.error = action.error.message || 'Failed to review request.';
      });
  },
});

export const { clearSelected, clearRequestError } = requestSlice.actions;
export const requestReducer = requestSlice.reducer;

export const selectRequests = (state: RootState) => state.requests.list;
export const selectRequestsStatus = (state: RootState) => state.requests.status;
export const selectSelectedRequest = (state: RootState) => state.requests.selected;
export const selectReviewingId = (state: RootState) => state.requests.reviewingId;
export const selectRequestError = (state: RootState) => state.requests.error;
