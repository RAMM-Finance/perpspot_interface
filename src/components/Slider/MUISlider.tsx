import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import MuiInput from '@mui/material/Input'
import Slider from '@mui/material/Slider'
import { styled } from '@mui/material/styles'
import * as React from 'react'
import { useTheme } from 'styled-components'
import { ThemedText } from 'theme'

interface DiscreteSliderMarksProps {
  initialValue: number
  max?: number
  maxLeverage: string | null
  onChange: (val: number) => void
  duration?: boolean
}

interface DiscreteSliderInputMarksProps {
  initialValue: string
  onSlideChange: (val: number) => void
  onInputChange: (val: string) => void
  width?: number
  readOnly?: boolean
}

export default function DiscreteSliderMarks({
  initialValue,
  onChange,
  max,
  maxLeverage,
  duration,
}: DiscreteSliderMarksProps) {
  const isMaxLeverageRounded = max && maxLeverage && Math.round(Number(maxLeverage)) > max

  const handleChange = (event: Event, newValue: number | number[]) => {
    onChange(newValue as number)
  }

  const marks = [
    {
      value: max ? max * 0.1 : 10,
      label: `${max ? Number((max * 0.1).toFixed(2)) : 10}x`,
    },
    {
      value: max ? max * 0.25 : 25,
      label: `${max ? max * 0.25 : 25}x`,
    },
    {
      value: max ? max * 0.5 : 50,
      label: `${max ? max * 0.5 : 50}x`,
    },
    {
      value: max ? max * 0.75 : 75,
      label: `${max ? max * 0.75 : 75}x`,
    },
    {
      value: max ? (isMaxLeverageRounded ? max + 1 : max) : 100,
      label: `${max ? (isMaxLeverageRounded ? max + 1 : max) : 100}x`,
    },
  ]

  return (
    <Box sx={{ width: '100%' }}>
      <Slider
        aria-label="Custom marks"
        value={initialValue}
        onChange={handleChange}
        valueLabelDisplay="auto"
        marks={marks}
        step={0.001}
        min={0}
        max={duration && maxLeverage ? Number(maxLeverage) : maxLeverage ? Number(maxLeverage) - 0.0001 : 100}
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

export function PercentSlider({
  initialValue,
  onSlideChange,
  onInputChange,
  width,
  readOnly,
}: DiscreteSliderInputMarksProps) {
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
    <Box sx={{ width: width ? width : 365 }}>
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
          {readOnly ? (
            <ThemedText.BodySecondary fontSize={16} marginBottom="4px">
              {initialValue} %
            </ThemedText.BodySecondary>
          ) : (
            <>
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
            </>
          )}
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
