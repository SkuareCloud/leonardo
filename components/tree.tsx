"use client"

import {
    addEdge,
    Edge,
    Node,
    NodeTypes,
    ReactFlow,
    useEdgesState,
    useNodesState,
} from "@xyflow/react"
import { useRouter } from "next/navigation"
import { useCallback, useMemo } from "react"

import "@xyflow/react/dist/style.css"

export type TreeNode<T = Record<string, any>> = {
    id: string
    type: string
    children?: TreeNode[]
    data: T
}

/**
 * Recursively traverse the tree and generate nodes and edges for ReactFlow.
 * Positions nodes in a vertical tree layout.
 */
function treeToFlow(
    root: TreeNode,
    startX = 0,
    startY = 0,
    levelGap = 120,
    siblingGap = 240,
): { nodes: Node[]; edges: Edge[] } {
    let nodes: Node[] = []
    let edges: Edge[] = []

    // Helper to recursively position nodes
    function traverse(node: TreeNode, x: number, y: number): { width: number; centerX: number } {
        // If no children, just place the node
        if (!node.children || node.children.length === 0) {
            nodes.push({
                id: node.id,
                type: node.type || "default",
                position: { x, y },
                data: node.data,
            })
            return { width: 0, centerX: x }
        }

        // Place children and calculate their total width
        let childXs: number[] = []
        let childCenters: number[] = []
        let totalWidth = 0

        node.children.forEach((child, i) => {
            const childX = x + totalWidth
            const childY = y + levelGap
            const { width: childWidth, centerX: childCenterX } = traverse(child, childX, childY)
            childXs.push(childX)
            childCenters.push(childCenterX)
            // Add edge from parent to child
            edges.push({
                id: `e${node.id}-${child.id}`,
                type: node.type || "default",
                source: node.id,
                target: child.id,
            })
            // Add gap for next sibling
            if (!node.children) {
                totalWidth += siblingGap
            } else {
                totalWidth += (childWidth || 0) + (i < node.children.length - 1 ? siblingGap : 0)
            }
        })

        // Center this node above its children
        const minX = Math.min(...childCenters)
        const maxX = Math.max(...childCenters)
        const centerX = (minX + maxX) / 2

        nodes.push({
            id: node.id,
            type: node.type || "default",
            position: { x: centerX, y },
            data: node.data,
        })

        return { width: totalWidth, centerX }
    }

    traverse(root, startX, startY)
    return { nodes, edges }
}

type VerticalTreeProps = {
    tree: TreeNode
    nodeTypes: NodeTypes
    className?: string
    onNodeClick?: (ev: React.MouseEvent, node: Node) => void
}

export default function VerticalTree({
    tree,
    nodeTypes,
    className,
    onNodeClick,
}: VerticalTreeProps) {
    const router = useRouter()
    // Memoize nodes/edges so we don't recompute on every render
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        if (!tree) return { nodes: [], edges: [] }
        return treeToFlow(tree)
    }, [tree])

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    )

    return (
        <div className={className}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodesConnectable={false}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                fitView
                fitViewOptions={{
                    padding: 0.5,
                }}
            />
        </div>
    )
}
