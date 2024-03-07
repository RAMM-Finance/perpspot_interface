import { useDispatch, useSelector } from 'react-redux';
import { showLoadingPopup, hideLoadingPopup } from './reducer'; 

export const useLoadingPopup = () => {
  const dispatch = useDispatch();

  const isVisible = useSelector((state:any) => state.loadingPopup.isVisible);

  const showPopup = () => {
    dispatch(showLoadingPopup());
  };

  const hidePopup = () => {
    dispatch(hideLoadingPopup());
  };

  return {
    isVisible,
    showPopup,
    hidePopup,
  };
};