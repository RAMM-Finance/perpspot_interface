import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import * as React from 'react'

interface DiscreteSliderMarksProps {
  initialValue: number
  onChange: (val: number) => void
}

const marks = [
  // {
  //   value: 2,
  //   label: '2',
  // },
  {
    value: 10,
    label: '10x',
  },
  // {
  //   value: 20,
  //   label: '20x',
  // },
  {
    value: 50,
    label: '50x',
  },
  {
    value: 100,
    label: '100x',
  },
  {
    value: 200,
    label: '200x',
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
        max={200}
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

const percentMarks = [
  {
    value: 10,
    // label: '10x',
  },
  {
    value: 20,
    // label: '20x',
  },
  {
    value: 30,
    // label: '30x',
  },
  {
    value: 40,
    // label: '40x',
  },
  {
    value: 50,
    // label: '50x',
  },
  {
    value: 60,
    // label: '60x',
  },
  {
    value: 70,
    // label: '70x',
  },
  {
    value: 80,
    // label: '80x',
  },
  {
    value: 90,
    // label: '90x',
  },
  {
    value: 100,
    // label: '100x',
  },
]

export function PercentSlider({ initialValue, onChange }: DiscreteSliderMarksProps) {
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
        marks={percentMarks}
        step={0.1}
        min={0}
        max={100}
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
