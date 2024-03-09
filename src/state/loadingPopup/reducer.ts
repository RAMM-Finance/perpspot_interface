import { createSlice } from '@reduxjs/toolkit';

export const loadingPopupSlice = createSlice({
  name: 'loadingPopup',
  initialState: {
    isVisible: false,
    text: '',
  },
  reducers: {
    showLoadingPopup: (state, action) => {
      state.isVisible = true;
      state.text = action.payload;

    },
    hideLoadingPopup: (state) => {
      state.isVisible = false;
      state.text = ''; 
    },
  },
});

export const { showLoadingPopup, hideLoadingPopup } = loadingPopupSlice.actions;

export default loadingPopupSlice.reducer;