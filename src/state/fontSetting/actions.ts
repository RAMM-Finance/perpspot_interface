import { createAction } from '@reduxjs/toolkit';

export const SET_FONT_FAMILY = 'font/SET_FONT_FAMILY';

export const setFontFamily = createAction<string>(SET_FONT_FAMILY);