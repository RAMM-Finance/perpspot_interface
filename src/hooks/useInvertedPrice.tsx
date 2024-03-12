import { useState } from 'react';
import { MouseoverTooltip } from 'components/Tooltip'
import { ReversedArrowsIcon } from 'nft/components/icons'

export const useInvertedPrice = (initialState = false) => {
  const [isInverted, setIsInverted] = useState(initialState);

  const handleClick = () => {
    setIsInverted(!isInverted)
  };

  const invertedTooltipLogo   = (
    <MouseoverTooltip text="invert" placement="right">
      <div
        onClick={(e) => {
          e.stopPropagation()
          handleClick()
        }}
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
      >
        <ReversedArrowsIcon width='16' height='16'/>
      </div>
    </MouseoverTooltip>
  );

  return { isInverted, handleClick, invertedTooltipLogo }
};
