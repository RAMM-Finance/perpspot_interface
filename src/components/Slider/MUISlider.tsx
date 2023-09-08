import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

interface DiscreteSliderMarksProps {
  initialValue: number;
  onChange: (val: number) => void;
}

const marks = [
  {
    value: 10,
    label: '10x',
  },
  {
    value: 100,
    label: '100x',
  },
  {
    value: 500,
    label: '500x',
  },
];

export default function DiscreteSliderMarks({ initialValue, onChange }: DiscreteSliderMarksProps) {
  const handleChange = (event: Event, newValue: number | number[]) => {
    onChange(newValue as number);
  };

  return (
    <Box sx={{ width: 350 }}>
      <Slider
        aria-label="Custom marks"
        value={initialValue}
        onChange={handleChange}
        valueLabelDisplay="auto"
        marks={marks}
        step={1}
        min={1}
        max={500}
        sx={{
          '& .MuiSlider-markLabel': {
            color: 'white'
          }
        }}
      />
    </Box>
  );
}
