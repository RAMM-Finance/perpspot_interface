import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import MuiInput from '@mui/material/Input'
import Slider from '@mui/material/Slider'
import { styled } from '@mui/material/styles'
import * as React from 'react'
import { useTheme } from 'styled-components'

interface DiscreteSliderMarksProps {
  initialValue: number
  onChange: (val: number) => void
}

interface DiscreteSliderInputMarksProps {
  initialValue: string
  onSlideChange: (val: number) => void
  onInputChange: (val: string) => void
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
  {
    value: 25,
    label: '25x',
  },
  {
    value: 50,
    label: '50x',
  },
  {
    value: 75,
    label: '75x',
  },
  {
    value: 100,
    label: '100x',
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
        step={0.001}
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

export function PercentSlider({ initialValue, onSlideChange, onInputChange }: DiscreteSliderInputMarksProps) {
  const handleSlideChange = (event: Event, newValue: number | number[]) => {
    onSlideChange(newValue as number)
  }
  // const [inputValue, setInputValue] = React.useState<string>(initialValue)
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // setInputValue(event.target.value)
    onInputChange(event.target.value)
  }

  const theme = useTheme()

  return (
    <Box sx={{ width: 400 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item></Grid>
        <Grid item xs>
          <Slider
            size="small"
            value={initialValue === '' ? 0 : Number(initialValue)}
            onChange={handleSlideChange}
            aria-labelledby="input-slider"
            marks={percentMarks}
            sx={{
              color: theme.accentActive,
            }}
          />
        </Grid>
        <Grid item>
          <Input
            placeholder="0"
            value={initialValue}
            size="small"
            onChange={handleInputChange}
            sx={{
              input: {
                color: 'white',
              },
              justifyContent: 'right',
              width: '40px',
            }}
            inputProps={{
              min: 0,
              max: 100,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
          />
          %
        </Grid>
      </Grid>
    </Box>
  )
}

const Input = styled(MuiInput)`
  width: 42px;
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`
