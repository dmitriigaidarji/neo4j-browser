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
import React from 'react'
import { Popup } from 'semantic-ui-react'

import {
  BasicNode,
  BasicRelationship,
  StyledRelationshipChip
} from 'neo4j-arc/common'
import { GraphStyleModel } from 'neo4j-arc/graph-visualization'

import { GrassEditor } from './GrassEditor'
import { usePopupControlled } from './StyleableNodeLabel'
import { useTheme } from 'styled-components'

export type StyleableRelTypeProps = {
  graphStyle: GraphStyleModel
  selectedRelType: { relType: string; propertyKeys: string[]; count?: number }
  nodes: BasicNode[]
  relationships: BasicRelationship[]
}
export function StyleableRelType({
  selectedRelType,
  graphStyle,
  nodes,
  relationships
}: StyleableRelTypeProps): JSX.Element {
  const styleForRelType = graphStyle.forRelationship({
    type: selectedRelType.relType
  })
  const [open, wrapperRef, handleClick] = usePopupControlled()
  const theme = useTheme()
  return (
    <Popup
      style={React.useMemo(
        //@ts-ignore
        () => ({ backgroundColor: theme.editorBackground }),
        []
      )}
      on="click"
      basic
      key={selectedRelType.relType}
      position="left center"
      offset={[0, 0]}
      open={open}
      trigger={
        <StyledRelationshipChip
          onClick={handleClick}
          style={{
            backgroundColor: styleForRelType.get('color'),
            color: styleForRelType.get('text-color-internal')
          }}
          data-testid={`property-details-overview-relationship-type-${selectedRelType.relType}`}
        >
          {selectedRelType.count !== undefined
            ? `${selectedRelType.relType} (${selectedRelType.count})`
            : `${selectedRelType.relType}`}
        </StyledRelationshipChip>
      }
      wide
    >
      <div ref={wrapperRef}>
        <GrassEditor
          selectedRelType={selectedRelType}
          nodes={nodes}
          relationships={relationships}
        />
      </div>
    </Popup>
  )
}
