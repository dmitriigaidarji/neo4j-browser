import { GraphModel } from '../../../../models/Graph'
import { GraphLabel, graphlib, layout } from '@dagrejs/dagre'
import { NodeModel } from '../../../../models/Node'
export function setGraphLayout(graph: GraphModel, props: GraphLabel) {
  const g = new graphlib.Graph()

  // Set an object for the graph label
  g.setGraph(props)

  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(function () {
    return {}
  })

  const nodeMap: { [key: string]: NodeModel } = {}
  graph.nodes().forEach(n => {
    nodeMap[n.elementId] = n
    g.setNode(n.elementId, { label: n.elementId, width: 144, height: 100 })
  })

  graph.relationships().forEach(n => {
    g.setEdge(n.source.elementId, n.target.elementId)
  })

  layout(g)

  g.nodes().forEach(function (v) {
    const node = nodeMap[v]
    const gnode = g.node(v)
    node.fx = gnode.x
    node.fy = gnode.y
    node.x = node.fx
    node.y = node.fy
  })
}
