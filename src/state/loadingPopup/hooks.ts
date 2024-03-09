import { useDispatch, useSelector } from 'react-redux'

import { hideLoadingPopup, showLoadingPopup } from './reducer'

export const useLoadingPopup = () => {
  const dispatch = useDispatch()

  const isVisible = useSelector((state: any) => state.loadingPopup.isVisible)
  const text = useSelector((state: any) => state.loadingPopup.text)

  const showPopup = (text: string) => {
    dispatch(showLoadingPopup(text))
  }

  const hidePopup = () => {
    dispatch(hideLoadingPopup())
  }

  return {
    isVisible,
    showPopup,
    hidePopup,
    text,
  }
}
