/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { getBrowserName } from 'services/utils'
import { APP_START } from 'shared/modules/app/appDuck'
import { setItem } from 'services/localstorage'

export const NAME = 'grass'
export const UPDATE_GRAPH_STYLE_DATA = 'grass/UPDATE_GRAPH_STYLE_DATA'
export const SYNC_GRASS = 'grass/SYNC_GRASS'

export const getGraphStyleData = (state: any) => state[NAME]

const versionSize = 20
const initialState: any = null

export const composeGrassToSync = (store: any, syncValue: any) => {
  const grassFromSync = syncValue.syncObj.grass || []
  const grassFromState = getGraphStyleData(store.getState())
  const stringifyedGrassFromState = JSON.stringify(grassFromState)

  if (
    grassFromSync.length < 1 ||
    (grassFromSync[0].data &&
      grassFromSync[0].data !== stringifyedGrassFromState &&
      grassFromSync[0].data !== grassFromState)
  ) {
    return [
      {
        client: getBrowserName(),
        data: stringifyedGrassFromState,
        syncedAt: Date.now()
      }
    ].concat(grassFromSync.slice(0, versionSize))
  }

  return grassFromSync
}

function updateStyleData(_state: any, styleData: any) {
  return styleData
}

export default function visualization(state = initialState, action: any) {
  switch (action.type) {
    case APP_START:
      return !state ? state : { ...initialState, ...state }
    case UPDATE_GRAPH_STYLE_DATA:
      if (action.styleData === null) {
        setItem('lastGrassUrl', null)
      }
      return updateStyleData(state, action.styleData)
    default:
      return state
  }
}

export const updateGraphStyleData = (graphStyleData: any) => {
  return {
    type: UPDATE_GRAPH_STYLE_DATA,
    styleData: graphStyleData
  }
}
export function syncGrass(grass: any) {
  return {
    type: SYNC_GRASS,
    grass
  }
}

export const grassToLoad = (action: any, store: any) => {
  const grassFromSync =
    action.obj.syncObj &&
    action.obj.syncObj.grass &&
    action.obj.syncObj.grass.length > 0
      ? action.obj.syncObj.grass[0].data || {}
      : null

  const existingGrass = getGraphStyleData(store.getState())
  const grassHasChanged = grassFromSync !== JSON.stringify(existingGrass)

  if (grassFromSync) {
    if (grassHasChanged) {
      return {
        grass: grassFromSync,
        syncGrass: false,
        loadGrass: true
      }
    } else {
      return {
        grass: existingGrass,
        syncGrass: false,
        loadGrass: false
      }
    }
  } else {
    return {
      grass: existingGrass,
      syncGrass: true,
      loadGrass: false
    }
  }
}
