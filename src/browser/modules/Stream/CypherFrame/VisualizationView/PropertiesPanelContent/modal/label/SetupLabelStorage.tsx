import { cloneDeep } from 'lodash-es'
import * as React from 'react'
import {
  allLabelPositions,
  ICaptionSettings,
  LabelPosition
} from './SetupLabelModal'
import SetupLabelModalBody from './SetupLabelModalBody'
import SetupLabelRelArrowSVG, {
  RelArrowCaptionPosition
} from './SetupLabelRelArrowSVG'

const getInitialCaptionSettings: (props: {
  settings?: ICaptionSettings
  template?: any
  copyMiddleCaption?: boolean
}) => ICaptionSettings = ({
  settings,
  template = {},
  copyMiddleCaption = false
}) => {
  if (settings) {
    return cloneDeep(settings)
  } else {
    const middle = cloneDeep(template)
    if (!copyMiddleCaption) {
      delete middle.caption
    }
    const top = cloneDeep(template)
    delete top.caption
    const bottom = cloneDeep(top)
    return {
      [LabelPosition.top]: top,
      [LabelPosition.middle]: middle,
      [LabelPosition.bottom]: bottom
    }
  }
}

export interface ICaptionSettingsStore {
  [RelArrowCaptionPosition.startAbove]: ICaptionSettings
  [RelArrowCaptionPosition.startBelow]: ICaptionSettings
  [RelArrowCaptionPosition.endAbove]: ICaptionSettings
  [RelArrowCaptionPosition.endBelow]: ICaptionSettings
  [RelArrowCaptionPosition.center]: ICaptionSettings
}

export interface ISetupLabelStorageProps {
  selector: {
    classes: string[]
    tag: string
  }
  itemStyleProps: {
    itemStyle?: {
      caption: string
      'border-color': string
      'border-width': string
      color: string
      diameter: string
      'font-size': string
      'text-color-internal': string
    }
    captionSettings?: ICaptionSettings
    extraCaptionSettings?: {
      [RelArrowCaptionPosition.startAbove]?: ICaptionSettings
      [RelArrowCaptionPosition.startBelow]?: ICaptionSettings
      [RelArrowCaptionPosition.endAbove]?: ICaptionSettings
      [RelArrowCaptionPosition.endBelow]?: ICaptionSettings
    }
    [key: string]: any
  }
  propertyKeys: string[]
  showTypeSelector: boolean
  updateStyle: (props?: Partial<ICaptionSettingsStore>) => void
  isNode: boolean
  doClose: () => void
  typeList: string[]
}

const SetupLabelStorage: React.FC<ISetupLabelStorageProps> = props => {
  const { itemStyleProps, isNode, updateStyle, doClose, typeList } = props
  const { extraCaptionSettings } = itemStyleProps
  const itemStyle = itemStyleProps
  const [selectedRelPosition, setRelPosition] = React.useState(
    RelArrowCaptionPosition.center
  )
  const currentRelPosition = isNode
    ? RelArrowCaptionPosition.center
    : selectedRelPosition
  const [captionSettingsStore, setCaptionSettingsStore] =
    React.useState<ICaptionSettingsStore>({
      [RelArrowCaptionPosition.center]: getInitialCaptionSettings({
        settings: itemStyleProps.captionSettings,
        template: itemStyle,
        copyMiddleCaption: true
      }),
      [RelArrowCaptionPosition.startAbove]: getInitialCaptionSettings({
        settings: extraCaptionSettings?.[RelArrowCaptionPosition.startAbove],
        template: itemStyle
      }),
      [RelArrowCaptionPosition.startBelow]: getInitialCaptionSettings({
        settings: extraCaptionSettings?.[RelArrowCaptionPosition.startBelow],
        template: itemStyle
      }),
      [RelArrowCaptionPosition.endAbove]: getInitialCaptionSettings({
        settings: extraCaptionSettings?.[RelArrowCaptionPosition.endAbove],
        template: itemStyle
      }),
      [RelArrowCaptionPosition.endBelow]: getInitialCaptionSettings({
        settings: extraCaptionSettings?.[RelArrowCaptionPosition.endBelow],
        template: itemStyle
      })
    })
  const updateCaptionSettingsStore: (props: {
    position: LabelPosition
    key: string
    value: string | null
  }) => void = React.useCallback(
    ({ position, key, value }) => {
      setCaptionSettingsStore(x => {
        const cloned = cloneDeep(x)
        if (value === null || value.length === 0) {
          delete cloned[currentRelPosition][position][key]
        } else {
          cloned[currentRelPosition][position][key] = value
        }
        return cloned
      })
    },
    [setCaptionSettingsStore, currentRelPosition]
  )

  const handleSubmit = React.useCallback(() => {
    const result: Partial<ICaptionSettingsStore> = {}
    const keys = Object.keys(captionSettingsStore)
    for (const key of keys) {
      if (captionSettingsStore.hasOwnProperty(key)) {
        const parsedKey = key as unknown as RelArrowCaptionPosition
        const value: ICaptionSettings = captionSettingsStore[parsedKey]
        if (
          allLabelPositions.some(
            position => value[position].caption != undefined
          )
        ) {
          result[parsedKey] = value
        }
      }
    }
    updateStyle(result)
    doClose()
  }, [updateStyle, captionSettingsStore, doClose])

  const handleReset = React.useCallback(() => {
    updateStyle(undefined)
    doClose()
  }, [updateStyle, doClose])

  return (
    <>
      {!isNode && (
        <SetupLabelRelArrowSVG
          position={selectedRelPosition}
          setPosition={setRelPosition}
          store={captionSettingsStore}
        />
      )}
      <SetupLabelModalBody
        doClose={doClose}
        selector={props.selector}
        typeList={typeList}
        captionSettings={captionSettingsStore[currentRelPosition]}
        propertyKeys={props.propertyKeys}
        showTypeSelector={props.showTypeSelector}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onUpdate={updateCaptionSettingsStore}
        isNode={isNode}
      />
    </>
  )
}

export default SetupLabelStorage
