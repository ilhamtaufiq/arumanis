import type { NetworkState } from '../hooks/useNetworkEditor';

interface GraphNode {
    id: string;
    neighbors: { nodeId: string; pipeId: string; length: number }[];
}

/**
 * Builds an adjacency list from the network state
 */
export const buildAdjacencyList = (network: NetworkState): Map<string, GraphNode> => {
    const graph = new Map<string, GraphNode>();

    // Initialize all nodes
    const allNodes = [
        ...network.junctions,
        ...network.reservoirs,
        ...network.tanks
    ];

    allNodes.forEach(node => {
        graph.set(node.id, { id: node.id, neighbors: [] });
    });

    // Add edges from pipes
    network.pipes.forEach(pipe => {
        const from = graph.get(pipe.fromNode);
        const to = graph.get(pipe.toNode);

        if (from && to) {
            from.neighbors.push({ nodeId: pipe.toNode, pipeId: pipe.id, length: pipe.length });
            to.neighbors.push({ nodeId: pipe.fromNode, pipeId: pipe.id, length: pipe.length });
        }
    });

    // Add edges from pumps (treat as 0 length or actual length if we had it, usually short)
    network.pumps.forEach(pump => {
        const from = graph.get(pump.fromNode);
        const to = graph.get(pump.toNode);

        if (from && to) {
            from.neighbors.push({ nodeId: pump.toNode, pipeId: pump.id, length: 0 });
            // Pumps are usually directional, but for profile view we might want to traverse backwards too?
            // Let's assume bidirectional for connectivity, but we handle direction in profile logic
            to.neighbors.push({ nodeId: pump.fromNode, pipeId: pump.id, length: 0 });
        }
    });

    // Add edges from valves
    network.valves.forEach(valve => {
        const from = graph.get(valve.fromNode);
        const to = graph.get(valve.toNode);

        if (from && to) {
            from.neighbors.push({ nodeId: valve.toNode, pipeId: valve.id, length: 0 });
            to.neighbors.push({ nodeId: valve.fromNode, pipeId: valve.id, length: 0 });
        }
    });

    return graph;
};

/**
 * Finds the shortest path between startNode and endNode using BFS
 * Returns an array of node IDs and the connecting links
 */
export const findPath = (
    network: NetworkState,
    startNodeId: string,
    endNodeId: string
): { nodes: string[], links: string[] } | null => {
    const graph = buildAdjacencyList(network);

    // BFS state
    const queue: string[] = [startNodeId];
    const visited = new Set<string>([startNodeId]);
    const parent = new Map<string, { nodeId: string, linkId: string }>();

    while (queue.length > 0) {
        const currentId = queue.shift()!;

        if (currentId === endNodeId) {
            // Reconstruct path
            const nodes: string[] = [endNodeId];
            const links: string[] = [];
            let curr = endNodeId;

            while (curr !== startNodeId) {
                const p = parent.get(curr);
                if (!p) break;
                nodes.unshift(p.nodeId);
                links.unshift(p.linkId);
                curr = p.nodeId;
            }

            return { nodes, links };
        }

        const node = graph.get(currentId);
        if (node) {
            for (const neighbor of node.neighbors) {
                if (!visited.has(neighbor.nodeId)) {
                    visited.add(neighbor.nodeId);
                    parent.set(neighbor.nodeId, { nodeId: currentId, linkId: neighbor.pipeId });
                    queue.push(neighbor.nodeId);
                }
            }
        }
    }

    return null; // No path found
};
