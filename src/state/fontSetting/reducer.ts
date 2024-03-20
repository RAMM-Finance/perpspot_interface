import { fontsTheme } from 'theme/colors';
import { SET_FONT_FAMILY } from './actions';
import { createReducer } from '@reduxjs/toolkit';

const initialState = {
  fontFamily: fontsTheme.primary,
};

const fontReducer = createReducer(initialState, {
  [SET_FONT_FAMILY]: (state, action) => {
    state.fontFamily = action.payload
  },
})

export default fontReducer