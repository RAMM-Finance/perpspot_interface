import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import * as React from 'react'

interface DiscreteSliderMarksProps {
  initialValue: number
  onChange: (val: number) => void
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
    value: 200,
    label: '200x',
  },
  {
    value: 300,
    label: '300x',
  },
  {
    value: 400,
    label: '400x',
  },
  {
    value: 500,
    label: '500x',
  },
]

export default function DiscreteSliderMarks({ initialValue, onChange }: DiscreteSliderMarksProps) {
  const handleChange = (event: Event, newValue: number | number[]) => {
    onChange(newValue as number)
  }

  return (
    <Box sx={{ width: 250 }}>
      <Slider
        aria-label="Custom marks"
        value={initialValue}
        onChange={handleChange}
        valueLabelDisplay="auto"
        marks={marks}
        step={1}
        min={0}
        max={500}
        size="small"
        sx={{
          '& .MuiSlider-markLabel': {
            color: 'white',
            fontSize: '12px',
          },
        }}
      />
    </Box>
  )
}
