import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../types/domain';
import { productService, type ProductInput } from '../../services/productService';
import type { RootState } from '../index';

interface ProductState {
  list: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  saving: boolean;
  error: string | null;
}

const initialState: ProductState = {
  list: [],
  status: 'idle',
  saving: false,
  error: null,
};

export const loadProducts = createAsyncThunk('products/load', () => productService.list());

export const saveProduct = createAsyncThunk<Product, { id?: string; input: ProductInput }>(
  'products/save',
  async ({ id, input }) => (id ? productService.update(id, input) : productService.create(input))
);

export const toggleProduct = createAsyncThunk<Product, string>(
  'products/toggle',
  (id) => productService.toggleActive(id)
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load products.';
      })
      .addCase(saveProduct.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.saving = false;
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
        else state.list.unshift(action.payload);
      })
      .addCase(saveProduct.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Failed to save product.';
      })
      .addCase(toggleProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      });
  },
});

export const { clearProductError } = productSlice.actions;
export const productReducer = productSlice.reducer;

export const selectProducts = (state: RootState) => state.products.list;
export const selectProductsStatus = (state: RootState) => state.products.status;
export const selectProductSaving = (state: RootState) => state.products.saving;
export const selectProductError = (state: RootState) => state.products.error;
