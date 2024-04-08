import * as React from 'react'
import styled from 'styled-components'

import GenericModal from '../GenericModal'
import { ApplyButton, SimpleButton } from '../styled'
import { useCallback } from 'react'

export interface IGraphLayoutState {
  rankdir: string
  align: string | undefined
  nodesep: number
  ranksep: number
}
interface IProps {
  isOpen: boolean
  onClose: () => void
  onAccept: (props: IGraphLayoutState) => void
}
const Wrapper = styled.div`
  color: black;
`
const key = 'GraphLayoutModalState'
const defaultVal: IGraphLayoutState = {
  rankdir: 'TB',
  align: undefined,
  nodesep: 50,
  ranksep: 50
}
function getDefaultState(): IGraphLayoutState {
  const saved = localStorage.getItem(key)
  let parsed = {}
  if (saved) {
    try {
      parsed = JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
  }
  return {
    ...defaultVal,
    ...parsed
  }
}
const GraphLayoutModal: React.FC<IProps> = ({ isOpen, onAccept, onClose }) => {
  const defaultState: IGraphLayoutState = getDefaultState()
  return (
    <GenericModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={'Layout setup'}
    >
      <form
        onSubmit={useCallback(
          (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            event.stopPropagation()

            const formData = new FormData(event.currentTarget)
            const state: IGraphLayoutState = {
              ...defaultVal
            }
            for (const [key, value] of formData.entries()) {
              const parsedValue = (
                value === 'undefined' ? undefined : value
              ) as string | undefined
              state[key as 'align'] = parsedValue
            }
            localStorage.setItem(key, JSON.stringify(state))
            onAccept(state)
          },
          [onAccept]
        )}
      >
        <Wrapper>
          <div>
            <SmallMarginDiv>
              <label>
                Direction for rank nodes. Can be TB, BT, LR, or RL, where T =
                top, B = bottom, L = left, and R = right
                <select defaultValue={defaultState.rankdir} name={'rankdir'}>
                  {['TB', 'BT', 'LR', 'RL'].map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </SmallMarginDiv>
            <SmallMarginDiv>
              <label>
                Alignment for rank nodes. Can be UL, UR, DL, or DR, where U =
                up, D = down, L = left, and R = right.
                <select defaultValue={defaultState.align + ''} name={'align'}>
                  {['undefined', 'UL', 'UR', 'DL', 'DR'].map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </SmallMarginDiv>
            <SmallMarginDiv>
              <label>
                Number of pixels that separate nodes horizontally in the layout.
                <input
                  type={'number'}
                  defaultValue={defaultState.nodesep}
                  name={'nodesep'}
                />
              </label>
            </SmallMarginDiv>
            <SmallMarginDiv>
              <label>
                Number of pixels between each rank in the layout.
                <input
                  type={'number'}
                  defaultValue={defaultState.ranksep}
                  name={'ranksep'}
                />
              </label>
            </SmallMarginDiv>
          </div>
          <ButtonsContainer>
            <ApplyButton type={'submit'}>Apply</ApplyButton>
            <SimpleButton onClick={onClose}>Cancel</SimpleButton>
          </ButtonsContainer>
        </Wrapper>
      </form>
    </GenericModal>
  )
}
const ButtonsContainer = styled.div`
  margin: 20px 0;
`
const SmallMarginDiv = styled.div`
  margin: 5px 0;

  input,
  select {
    margin-left: 10px;
  }
`
export default GraphLayoutModal
