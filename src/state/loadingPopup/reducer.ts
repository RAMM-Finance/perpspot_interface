import { createSlice } from '@reduxjs/toolkit';

export const loadingPopupSlice = createSlice({
  name: 'loadingPopup',
  initialState: {
    isVisible: false,
  },
  reducers: {
    showLoadingPopup: (state) => {
      state.isVisible = true;
    },
    hideLoadingPopup: (state) => {
      state.isVisible = false;
    },
  },
});

export const { showLoadingPopup, hideLoadingPopup } = loadingPopupSlice.actions;

export default loadingPopupSlice.reducer;