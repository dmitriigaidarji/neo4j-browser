import { cloneDeep } from 'lodash-es'
import * as React from 'react'
import styled from 'styled-components'

import { usePrevious } from 'browser-hooks/hooks'
import {
  IStyleForLabelProps,
  stringSorter,
  stringSorterDesc
} from 'project-root/src/browser/modules/D3Visualization/components/GrassEditor'
import SetupColorPreview, {
  generateColorsForBase
} from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorPreview'
import SetupColorScheme, {
  getColorSchemeAtIndex
} from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorScheme'
import { IColorSettings } from 'project-root/src/browser/modules/D3Visualization/components/modal/color/SetupColorStorage'
import {
  ApplyButton,
  SimpleButton
} from 'project-root/src/browser/modules/D3Visualization/components/modal/styled'

const MarginDiv = styled.div`
  margin: 10px 0;
`
type IRawColorSettings = IColorSettings['settings']
const SetupColorPicker: React.FC<{
  values: string[]
  initialColorSettings: IRawColorSettings
  onSubmit: (settings?: IRawColorSettings) => void
  onClose: () => void
  withLineWidth: boolean
}> = ({ values, initialColorSettings, onClose, onSubmit, withLineWidth }) => {
  const [currentColorSettings, setCurrentColorSettings] =
    React.useState<IRawColorSettings>(initialColorSettings)
  React.useEffect(() => {
    setCurrentColorSettings(initialColorSettings)
  }, [initialColorSettings])

  const defaultScheme = React.useMemo(() => {
    const itemStyle: Partial<IStyleForLabelProps> | undefined =
      currentColorSettings[Object.keys(currentColorSettings)[0]]
    const colorSchemeIndex = itemStyle?.colorSchemeIndex ?? 1
    return {
      defaultColorSchemeIndex: colorSchemeIndex,
      defaultColor: itemStyle?.color ?? 'rgb(42,76,119)'
    }
  }, [currentColorSettings])
  const [colorSchemeIndex, setColorSchemeIndex] = React.useState<number>(
    defaultScheme.defaultColorSchemeIndex
  )
  const [colorScheme, setColorScheme] = React.useState<(t: number) => string>(
    () =>
      colorSchemeIndex >= 0
        ? getColorSchemeAtIndex(colorSchemeIndex)
        : () => defaultScheme.defaultColor
  )
  const handleColorSchemeChange = React.useCallback(
    (scheme: (t: number) => string, index: number) => {
      setColorScheme(() => scheme)
      setColorSchemeIndex(index)
    },
    []
  )
  const handleColorChange = React.useCallback(
    ({ value, color }: { value: string; color: string }) => {
      setCurrentColorSettings(t => {
        const cloned = cloneDeep(t)
        cloned[value] = Object.assign(
          {},
          t[value],
          generateColorsForBase(color)
        )
        return cloned
      })
    },
    []
  )
  const [sortVal, setSortVal] = React.useState<'ASC' | 'DESC'>('ASC')
  const sortedValues = React.useMemo(
    () =>
      sortVal === 'ASC'
        ? values.sort(stringSorter)
        : values.sort(stringSorterDesc),
    [values, sortVal]
  )
  const oldColorScheme = usePrevious(colorScheme)
  const oldSort = usePrevious(sortVal)
  React.useEffect(() => {
    setCurrentColorSettings(old => {
      if (
        sortedValues.every(value => old[value] != undefined) &&
        oldColorScheme === colorScheme &&
        oldSort === sortVal
      ) {
        return old
      } else {
        const newSettings: IRawColorSettings = {}
        const length = sortedValues.length - 1
        const isScaled = length < 20
        sortedValues.forEach((value, i) => {
          const color = colorScheme(
            isScaled ? (i / length) * 0.8 + 0.1 : i / length
          )
          newSettings[value] = Object.assign(
            {},
            old[value],
            generateColorsForBase(color),
            { colorSchemeIndex }
          )
        })
        return newSettings
      }
    })
  }, [
    sortedValues,
    colorScheme,
    colorSchemeIndex,
    initialColorSettings,
    oldColorScheme,
    sortVal,
    oldSort
  ])

  const handleSubmit = React.useCallback(() => {
    onSubmit(cloneDeep(currentColorSettings))
    onClose()
  }, [onSubmit, currentColorSettings, onClose])
  const onReset = React.useCallback(() => {
    onSubmit(undefined)
    onClose()
  }, [onSubmit, onClose])

  const lineWidthIsSet: boolean = React.useMemo(() => {
    const keys = Object.keys(initialColorSettings)
    return (
      keys.length > 0 &&
      keys.every(key => initialColorSettings[key].hasOwnProperty('shaft-width'))
    )
  }, [initialColorSettings])
  const [doesAffectLineWidth, setAffectLineWidth] =
    React.useState<boolean>(lineWidthIsSet)
  React.useEffect(() => {
    setAffectLineWidth(lineWidthIsSet)
  }, [lineWidthIsSet])
  const handleAffectLineWidthChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(() => {
      setAffectLineWidth(wasChecked => {
        const checked = !wasChecked
        setCurrentColorSettings(oldSettings => {
          const newSettings = cloneDeep(oldSettings)
          if (checked) {
            sortedValues.forEach(
              (key, i) => (newSettings[key]['shaft-width'] = `${i + 1}px`)
            )
          } else {
            sortedValues.forEach(key => delete newSettings[key]['shaft-width'])
          }
          return newSettings
        })
        return checked
      })
    }, [sortedValues])

  const handleLineWidthChange = React.useCallback(
    (key: string, value: string) => {
      setCurrentColorSettings(current => {
        const newSettings = cloneDeep(current)
        newSettings[key]['shaft-width'] = value
        return newSettings
      })
    },
    []
  )
  return (
    <>
      <h3>Color map</h3>
      <SetupColorScheme
        selectedIndex={colorSchemeIndex}
        selected={colorScheme}
        onChange={handleColorSchemeChange}
      />
      <MarginDiv>
        <div>
          <SortButton onClick={React.useCallback(() => setSortVal('ASC'), [])}>
            Ascending
          </SortButton>
          <SortButton onClick={React.useCallback(() => setSortVal('DESC'), [])}>
            Descending
          </SortButton>
          {withLineWidth && (
            <LineWidthLabel>
              <input
                type={'checkbox'}
                checked={doesAffectLineWidth}
                onChange={handleAffectLineWidthChange}
              />{' '}
              Affects line width
            </LineWidthLabel>
          )}
        </div>
        {sortedValues.map(t => (
          <SetupColorPreview
            key={t}
            value={t}
            style={currentColorSettings[t]}
            onChange={handleColorChange}
            onLineWidthChange={handleLineWidthChange}
          />
        ))}
      </MarginDiv>
      <div>
        <ApplyButton onClick={handleSubmit}>Apply</ApplyButton>
        <SimpleButton onClick={onClose}>Cancel</SimpleButton>
        <SimpleButton onClick={onReset}>Reset to default</SimpleButton>
      </div>
    </>
  )
}

const SortButton = styled.button`
  margin-right: 20px;
  background: transparent;
  padding: 5px 2px;
  margin-bottom: 10px;
`

const LineWidthLabel = styled.label`
  background: transparent;
  padding: 5px 2px;
  margin-bottom: 10px;
  float: right;
`
export default SetupColorPicker
