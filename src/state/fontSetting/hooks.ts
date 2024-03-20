import { useDispatch, useSelector } from 'react-redux';
import { setFontFamily } from './actions';
import { fontsTheme, FontsTheme } from 'theme/colors';

export function useFontFamily() {
  const dispatch = useDispatch();
  const fontFamily = useSelector((state: any) => state.font.fontFamily)

  const setFont = (font: keyof FontsTheme) => {
    const fontFamily = fontsTheme[font];
    dispatch(setFontFamily(fontFamily));
  };

  return {
    fontFamily,
    setFont,
  }
}